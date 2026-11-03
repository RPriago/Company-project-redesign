package controllers

import (
	"errors"
	"fmt"
	"gorm.io/gorm"
	"log"
	"math/rand"
	"regexp"
	"strconv"
	"strings"
	"time"

	"petronesia-backend/config"
	"petronesia-backend/models"
	"petronesia-backend/utils"

	"github.com/gofiber/fiber/v2"
)

func generateJobSlug(title string) string {
	slug := strings.ToLower(title)
	reg := regexp.MustCompile("[^a-z0-9]+")
	slug = reg.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	if slug == "" {
		slug = "lowongan"
	}
	return fmt.Sprintf("%s-%d", slug, time.Now().Unix()%10000+int64(rand.Intn(900)+100))
}

// GetJobs - Public endpoint to list active vacancies
func GetJobs(c *fiber.Ctx) error {
	if len(c.Path()) >= 11 && c.Path()[:11] == "/api/admin/" {
		return uncachedGetJobs(c)
	}
	return cachedPublic(c, uncachedGetJobs)
}
func uncachedGetJobs(c *fiber.Ctx) error {
	c.Set("Cache-Control", "public, max-age=120, stale-while-revalidate=300")
	c.Set("X-Content-Type-Options", "nosniff")

	var jobs []models.JobVacancy
	query := config.DB.Where("is_active = ?", true)

	search := strings.TrimSpace(c.Query("search"))
	if search != "" {
		// SEC-003 Mitigation: Cap search query to 80 chars to prevent Regex/LIKE DoS
		if len(search) > 80 {
			search = search[:80]
		}
		likeTerm := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(title) LIKE ? OR LOWER(department) LIKE ? OR LOWER(description) LIKE ?", likeTerm, likeTerm, likeTerm)
	}

	department := c.Query("department")
	if department != "" && department != "Semua" {
		query = query.Where("department = ?", department)
	}

	jobType := c.Query("type")
	if jobType != "" && jobType != "Semua" {
		query = query.Where("type = ?", jobType)
	}

	page, limit, err := pagination(c, 10)
	if err != nil {
		return c.SendStatus(400)
	}
	var total int64
	if err := query.Model(&models.JobVacancy{}).Count(&total).Error; err != nil {
		return databaseFailure(c)
	}
	if err := query.Order("created_at DESC").Offset((page - 1) * limit).Limit(limit).Find(&jobs).Error; err != nil {
		return databaseFailure(c)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    jobs,
		"total":   total,
		"meta":    fiber.Map{"total": total, "page": page, "limit": limit, "last_page": max(1, (int(total)+limit-1)/limit)},
	})
}

// GetJobBySlug - Public single vacancy details (Safely handles alphanumeric slugs & integer IDs)
func GetJobBySlug(c *fiber.Ctx) error {
	if len(c.Path()) >= 11 && c.Path()[:11] == "/api/admin/" {
		return uncachedGetJobBySlug(c)
	}
	return cachedPublic(c, uncachedGetJobBySlug)
}
func uncachedGetJobBySlug(c *fiber.Ctx) error {
	identifier := strings.TrimSpace(c.Params("slug"))
	var job models.JobVacancy
	var err error

	// SEC-008: Check if identifier is a valid positive integer to prevent PostgreSQL type cast errors
	if numericID, parseErr := strconv.Atoi(identifier); parseErr == nil && numericID > 0 {
		err = config.DB.Where("(id = ? OR slug = ?) AND is_active = ?", numericID, identifier, true).First(&job).Error
	} else {
		err = config.DB.Where("slug = ? AND is_active = ?", identifier, true).First(&job).Error
	}

	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return databaseFailure(c)
		}
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Lowongan kerja tidak ditemukan",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    job,
	})
}

// AdminGetJobs - Protected admin list
func AdminGetJobs(c *fiber.Ctx) error {
	var jobs []models.JobVacancy
	if err := config.DB.Order("created_at DESC").Limit(50).Find(&jobs).Error; err != nil {
		return databaseFailure(c)
	}

	var activeCount int64
	if err := config.DB.Model(&models.JobVacancy{}).Where("is_active = ?", true).Count(&activeCount).Error; err != nil {
		return databaseFailure(c)
	}

	return c.JSON(fiber.Map{
		"success":      true,
		"data":         jobs,
		"total":        len(jobs),
		"active_count": activeCount,
	})
}

// CreateJob - Protected admin create
func CreateJob(c *fiber.Ctx) error {
	type RequestInput struct {
		Title        string `json:"title"`
		Department   string `json:"department"`
		Location     string `json:"location"`
		Type         string `json:"type"`
		Experience   string `json:"experience"`
		Description  string `json:"description"`
		Requirements string `json:"requirements"`
		Deadline     string `json:"deadline"`
		IsActive     *bool  `json:"is_active"`
	}

	var req RequestInput
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format data JSON tidak valid",
		})
	}

	if !validJob(req.Title, req.Department, req.Location, req.Type, req.Experience, req.Description, req.Requirements, req.Deadline) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Judul posisi dan departemen wajib diisi",
		})
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	slug := generateJobSlug(req.Title)

	job := models.JobVacancy{
		Title:        strings.TrimSpace(req.Title),
		Slug:         slug,
		Department:   strings.TrimSpace(req.Department),
		Location:     strings.TrimSpace(req.Location),
		Type:         strings.TrimSpace(req.Type),
		Experience:   strings.TrimSpace(req.Experience),
		Description:  strings.TrimSpace(req.Description),
		Requirements: strings.TrimSpace(req.Requirements),
		Deadline:     strings.TrimSpace(req.Deadline),
		IsActive:     isActive,
	}

	if err := config.DB.Create(&job).Error; err != nil {
		log.Printf("❌ Database error CreateJob: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan lowongan kerja ke sistem. Silakan periksa kembali data Anda.",
		})
	}

	utils.RecordAudit(c, "CREATE", "JOB", fmt.Sprintf("%d", job.ID), fmt.Sprintf("Lowongan kerja '%s' berhasil ditambahkan", job.Title))

	invalidatePublicCache()
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Lowongan kerja baru berhasil ditambahkan",
		"data":    job,
	})
}

// UpdateJob - Protected admin update
func UpdateJob(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil || id <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "ID lowongan kerja tidak valid",
		})
	}
	var job models.JobVacancy

	if err := config.DB.First(&job, id).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return databaseFailure(c)
		}
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Lowongan kerja tidak ditemukan",
		})
	}

	type RequestInput struct {
		Title        *string `json:"title"`
		Department   *string `json:"department"`
		Location     *string `json:"location"`
		Type         *string `json:"type"`
		Experience   *string `json:"experience"`
		Description  *string `json:"description"`
		Requirements *string `json:"requirements"`
		Deadline     *string `json:"deadline"`
		IsActive     *bool   `json:"is_active"`
	}

	var req RequestInput
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format data JSON tidak valid",
		})
	}

	if req.Title != nil {
		job.Title = strings.TrimSpace(*req.Title)
	}
	if req.Department != nil {
		job.Department = strings.TrimSpace(*req.Department)
	}
	if req.Location != nil {
		job.Location = strings.TrimSpace(*req.Location)
	}
	if req.Type != nil {
		job.Type = strings.TrimSpace(*req.Type)
	}
	if req.Experience != nil {
		job.Experience = strings.TrimSpace(*req.Experience)
	}
	if req.Description != nil {
		job.Description = strings.TrimSpace(*req.Description)
	}
	if req.Requirements != nil {
		job.Requirements = strings.TrimSpace(*req.Requirements)
	}
	if req.Deadline != nil {
		job.Deadline = strings.TrimSpace(*req.Deadline)
	}
	if req.IsActive != nil {
		job.IsActive = *req.IsActive
	}

	if !validJob(job.Title, job.Department, job.Location, job.Type, job.Experience, job.Description, job.Requirements, job.Deadline) {
		return c.SendStatus(400)
	}
	if err := config.DB.Save(&job).Error; err != nil {
		log.Printf("❌ Database error UpdateJob: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal memperbarui data lowongan kerja. Silakan coba beberapa saat lagi.",
		})
	}

	utils.RecordAudit(c, "UPDATE", "JOB", fmt.Sprintf("%d", job.ID), fmt.Sprintf("Lowongan kerja '%s' berhasil diperbarui", job.Title))

	invalidatePublicCache()
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Lowongan kerja berhasil diperbarui",
		"data":    job,
	})
}

// DeleteJob - Protected admin delete
func DeleteJob(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil || id <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "ID lowongan kerja tidak valid",
		})
	}
	var job models.JobVacancy

	if err := config.DB.First(&job, id).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return databaseFailure(c)
		}
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Lowongan kerja tidak ditemukan",
		})
	}

	if err := config.DB.Delete(&job).Error; err != nil {
		log.Printf("❌ Database error DeleteJob: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menghapus lowongan kerja dari sistem.",
		})
	}

	utils.RecordAudit(c, "DELETE", "JOB", fmt.Sprintf("%d", job.ID), fmt.Sprintf("Lowongan kerja '%s' berhasil dihapus", job.Title))

	invalidatePublicCache()
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Lowongan kerja berhasil dihapus",
	})
}
