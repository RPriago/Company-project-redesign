package controllers

import (
	"log"
	"net/mail"
	"strings"

	"regexp"

	"petronesia-backend/config"
	"petronesia-backend/models"

	"github.com/gofiber/fiber/v2"
)

var htmlTagRegex = regexp.MustCompile(`<[^>]*>`)

func stripHTMLTags(s string) string {
	return strings.TrimSpace(htmlTagRegex.ReplaceAllString(s, ""))
}

type ContactRequest struct {
	Name       string `json:"name"`
	Email      string `json:"email"`
	Phone      string `json:"phone"`
	Subject    string `json:"subject"`
	Message    string `json:"message"`
	CompanyFax string `json:"company_fax"` // Honeypot field: automated bots fill this, humans do not
}

func SubmitContact(c *fiber.Ctx) error {
	var req ContactRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format data JSON tidak valid",
		})
	}

	// SEC-004 Mitigation: Honeypot bot trap silently deflects automated AI/bot spammers
	if req.CompanyFax != "" {
		log.Printf("🛡️ [Bot Defense] Automated submission trapped via honeypot field from IP: %s", c.IP())
		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"success": true,
			"message": "Terima kasih! Pesan Anda telah berhasil terkirim ke Tim Petronesia.",
		})
	}

	name := stripHTMLTags(req.Name)
	email := strings.TrimSpace(req.Email)
	phone := stripHTMLTags(req.Phone)
	subject := stripHTMLTags(req.Subject)
	message := stripHTMLTags(req.Message)

	// SEC-010: Input validation & length limits
	if name == "" || email == "" || message == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Nama, email, dan pesan wajib diisi",
		})
	}

	if len([]rune(name)) < 2 || len([]rune(name)) > 100 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Nama harus antara 2 hingga 100 karakter",
		})
	}

	// Validate RFC 5322 email format
	parsedEmail, err := mail.ParseAddress(email)
	if err != nil || len(email) > 120 || !strings.Contains(parsedEmail.Address, ".") {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format alamat email tidak valid",
		})
	}

	if len([]rune(phone)) > 30 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Nomor telepon maksimal 30 karakter",
		})
	}

	if len([]rune(subject)) > 150 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Subjek pesan maksimal 150 karakter",
		})
	}

	if len([]rune(message)) < 5 || len([]rune(message)) > 3000 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Isi pesan harus antara 5 hingga 3000 karakter",
		})
	}

	msg := models.ContactMessage{
		Name:    name,
		Email:   parsedEmail.Address,
		Phone:   phone,
		Subject: subject,
		Message: message,
	}

	if err := config.DB.Create(&msg).Error; err != nil {
		log.Printf("❌ Database error SubmitContact: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengirim pesan ke sistem. Silakan coba kembali nanti.",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Terima kasih! Pesan Anda telah berhasil terkirim ke Tim Petronesia.",
	})
}

func GetContacts(c *fiber.Ctx) error {
	var messages []models.ContactMessage
	config.DB.Order("created_at desc").Limit(50).Find(&messages)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    messages,
	})
}
