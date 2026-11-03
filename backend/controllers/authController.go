package controllers

import (
	"fmt"
	"log"
	"regexp"
	"strconv"
	"strings"

	"petronesia-backend/config"
	"petronesia-backend/models"
	"petronesia-backend/utils"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

// Precomputed valid bcrypt hash (cost 10) to mitigate username enumeration via timing side-channels
var dummyBcryptHash = "$2a$10$7EqJtq98hPqEX7fNZaFWoO.8H0UpxKxX8k3qXoZlQ1zS/N8g1r0kK"

func Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format data login tidak valid",
		})
	}

	req.Username = strings.TrimSpace(req.Username)
	if req.Username == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Username dan password wajib diisi",
		})
	}

	var admin models.Admin
	if err := config.DB.Where("username = ?", req.Username).First(&admin).Error; err != nil {
		// SEC-001 Mitigation: Constant-time comparison prevents timing-based username enumeration
		_ = bcrypt.CompareHashAndPassword([]byte(dummyBcryptHash), []byte(req.Password))
		utils.RecordAudit(c, "LOGIN_FAILED", "AUTH", req.Username, "Percobaan login dengan kredensial tidak valid")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Username atau password salah",
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(req.Password)); err != nil {
		utils.RecordAudit(c, "LOGIN_FAILED", "AUTH", admin.Username, "Percobaan login gagal: kata sandi salah")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Username atau password salah",
		})
	}

	if admin.TokenVersion == 0 {
		admin.TokenVersion = 1
		_ = config.DB.Model(&admin).Update("token_version", 1).Error
	}
	tokenVersion := admin.TokenVersion

	token, err := utils.GenerateToken(admin.ID, admin.Username, admin.Role, tokenVersion)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membuat sesi token autentikasi",
		})
	}

	// SEC-013: Catat log audit keberhasilan login
	utils.RecordAudit(c, "LOGIN_SUCCESS", "AUTH", fmt.Sprintf("%d", admin.ID), fmt.Sprintf("Admin %s berhasil login", admin.Username))

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Login berhasil",
		"token":   token,
		"admin": fiber.Map{
			"id":       admin.ID,
			"username": admin.Username,
			"name":     admin.Name,
			"role":     admin.Role,
		},
	})
}

// Logout - SEC-014: Revokes token immediately by incrementing token_version in the database
func Logout(c *fiber.Ctx) error {
	var userID uint
	if id, ok := c.Locals("user_id").(uint); ok {
		userID = id
	} else if idF, ok := c.Locals("user_id").(float64); ok {
		userID = uint(idF)
	}

	if userID == 0 {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Sesi tidak ditemukan atau tidak valid",
		})
	}

	username, _ := c.Locals("username").(string)

	// Increment token_version atomically to revoke any active JWTs for this admin
	if err := config.DB.Model(&models.Admin{}).Where("id = ?", userID).Update("token_version", gorm.Expr("token_version + ?", 1)).Error; err != nil {
		log.Printf("❌ Gagal menaikkan token_version admin %d: %v", userID, err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal memproses pencabutan sesi",
		})
	}

	// SEC-013: Record audit log for session revocation
	utils.RecordAudit(c, "LOGOUT", "AUTH", fmt.Sprintf("%d", userID), fmt.Sprintf("Admin %s logout, seluruh sesi token dicabut", username))

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Logout berhasil. Sesi autentikasi telah dicabut secara permanen.",
	})
}

func Register(c *fiber.Ctx) error {
	var req RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format data tidak valid",
		})
	}

	req.Username = strings.ToLower(strings.TrimSpace(req.Username))
	if req.Username == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Username dan password wajib diisi",
		})
	}

	if len(req.Username) < 3 || len(req.Username) > 50 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Username harus terdiri dari 3 hingga 50 karakter",
		})
	}

	validUsernameRegex := regexp.MustCompile(`^[a-z0-9_.-]+$`)
	if !validUsernameRegex.MatchString(req.Username) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Username hanya boleh mengandung huruf kecil, angka, titik, strip, dan underscore",
		})
	}

	if len(req.Password) < 8 || len(req.Password) > 72 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Kata sandi harus terdiri dari 8 hingga 72 karakter (standar keamanan OWASP)",
		})
	}

	var count int64
	config.DB.Model(&models.Admin{}).Where("username = ?", req.Username).Count(&count)
	if count > 0 {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"success": false,
			"message": "Username sudah terdaftar",
		})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengenkripsi kata sandi",
		})
	}

	name := req.Name
	if name == "" {
		name = req.Username
	}

	newAdmin := models.Admin{
		Username:     req.Username,
		Password:     string(hashedPassword),
		Name:         name,
		Role:         "admin",
		TokenVersion: 1,
	}

	if err := config.DB.Create(&newAdmin).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan akun admin",
		})
	}

	creator, _ := c.Locals("username").(string)
	utils.RecordAudit(c, "REGISTER", "AUTH", fmt.Sprintf("%d", newAdmin.ID), fmt.Sprintf("Admin %s mendaftarkan admin baru %s", creator, newAdmin.Username))

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Admin berhasil didaftarkan",
	})
}

func Me(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	var admin models.Admin
	if err := config.DB.First(&admin, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Data admin tidak ditemukan",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"admin": fiber.Map{
			"id":       admin.ID,
			"username": admin.Username,
			"name":     admin.Name,
			"role":     admin.Role,
		},
	})
}

// GetAuditLogs - SEC-013: Protected admin endpoint to inspect security audit trail
func GetAuditLogs(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	var logs []models.AuditLog
	var total int64

	query := config.DB.Model(&models.AuditLog{})
	if action := strings.TrimSpace(c.Query("action")); action != "" {
		query = query.Where("action = ?", action)
	}
	if resource := strings.TrimSpace(c.Query("resource")); resource != "" {
		query = query.Where("resource = ?", resource)
	}

	if err := query.Count(&total).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menghitung data log audit",
		})
	}

	if err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&logs).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil log audit keamanan",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    logs,
		"meta": fiber.Map{
			"total":      total,
			"page":       page,
			"limit":      limit,
			"total_page": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

// ChangePassword - Allows authenticated admin to change password and revokes previous sessions
func ChangePassword(c *fiber.Ctx) error {
	var userID uint
	if id, ok := c.Locals("user_id").(uint); ok {
		userID = id
	} else if idF, ok := c.Locals("user_id").(float64); ok {
		userID = uint(idF)
	}

	if userID == 0 {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Sesi tidak valid",
		})
	}

	var req ChangePasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format data tidak valid",
		})
	}

	if len(req.NewPassword) < 8 || len(req.NewPassword) > 72 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Kata sandi baru harus antara 8 hingga 72 karakter",
		})
	}

	var admin models.Admin
	if err := config.DB.First(&admin, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Akun admin tidak ditemukan",
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(req.CurrentPassword)); err != nil {
		utils.RecordAudit(c, "CHANGE_PASSWORD_FAILED", "AUTH", fmt.Sprintf("%d", admin.ID), "Gagal ganti kata sandi: kata sandi lama salah")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Kata sandi saat ini tidak cocok",
		})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengenkripsi kata sandi baru",
		})
	}

	// Update password and increment token_version to invalidate old sessions (SEC-014)
	admin.Password = string(hashedPassword)
	admin.TokenVersion = admin.TokenVersion + 1
	if err := config.DB.Save(&admin).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal memperbarui kata sandi di sistem",
		})
	}

	utils.RecordAudit(c, "CHANGE_PASSWORD_SUCCESS", "AUTH", fmt.Sprintf("%d", admin.ID), "Admin mengganti kata sandi dan seluruh sesi lama dicabut")

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Kata sandi berhasil diubah. Seluruh sesi aktif lama telah dicabut demi keamanan. Silakan login kembali.",
	})
}
