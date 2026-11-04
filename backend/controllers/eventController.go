package controllers

import (
	"errors"
	"fmt"
	"gorm.io/gorm"
	"math"
	"regexp"
	"strconv"
	"strings"
	"time"

	"petronesia-backend/config"
	"petronesia-backend/models"

	"github.com/gofiber/fiber/v2"
)

func generateSlug(title string) string {
	slug := strings.ToLower(title)
	reg := regexp.MustCompile("[^a-z0-9]+")
	slug = reg.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	if slug == "" {
		slug = fmt.Sprintf("event-%d", time.Now().Unix())
	}
	return slug
}

// GET /api/events (Public)
func GetEvents(c *fiber.Ctx) error {
	if len(c.Path()) >= 11 && c.Path()[:11] == "/api/admin/" {
		return uncachedGetEvents(c)
	}
	return cachedPublic(c, uncachedGetEvents)
}
func uncachedGetEvents(c *fiber.Ctx) error {
	order := c.Query("order", "event_date desc")
	if order != "event_date desc" && order != "event_date asc" && order != "created_at desc" {
		return c.SendStatus(400)
	}

	var events []models.Event
	db := config.DB.Model(&models.Event{}).Where("is_published = ?", true)

	// Filter Category
	if category := c.Query("category"); category != "" && category != "Semua" {
		db = db.Where("category = ?", category)
	}

	// Search
	if q := c.Query("q"); q != "" {
		searchTerm := "%" + strings.ToLower(q) + "%"
		db = db.Where("LOWER(title) LIKE ? OR LOWER(excerpt) LIKE ? OR LOWER(description) LIKE ?", searchTerm, searchTerm, searchTerm)
	}

	var total int64
	if err := db.Count(&total).Error; err != nil {
		return databaseFailure(c)
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	if limit < 1 || limit > 50 {
		limit = 10
	}
	if page > 1000000 {
		return c.SendStatus(400)
	}
	offset := (page - 1) * limit

	if err := db.Order(order).Offset(offset).Limit(limit).Find(&events).Error; err != nil {
		return databaseFailure(c)
	}

	lastPage := int(math.Ceil(float64(total) / float64(limit)))
	if lastPage < 1 {
		lastPage = 1
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    events,
		"meta": fiber.Map{
			"total":     total,
			"page":      page,
			"limit":     limit,
			"last_page": lastPage,
		},
	})
}

// GET /api/events/:slug (Public)
func GetEventBySlug(c *fiber.Ctx) error {
	if len(c.Path()) >= 11 && c.Path()[:11] == "/api/admin/" {
		return uncachedGetEventBySlug(c)
	}
	return cachedPublic(c, uncachedGetEventBySlug)
}
func uncachedGetEventBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	var event models.Event

	if err := config.DB.Where("slug = ? AND is_published = ?", slug, true).First(&event).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return databaseFailure(c)
		}
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Berita atau event tidak ditemukan",
		})
	}

	// Public article reads never modify application data.

	// Fetch related articles (same category or recent)
	var related []models.Event
	if err := config.DB.Where("id != ? AND is_published = ?", event.ID, true).
		Order("created_at desc").
		Limit(3).
		Find(&related).Error; err != nil {
		return databaseFailure(c)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    event,
		"related": related,
	})
}

// GET /api/admin/events (Protected)
func AdminGetEvents(c *fiber.Ctx) error {
	var events []models.Event
	db := config.DB.Model(&models.Event{})

	if category := c.Query("category"); category != "" && category != "Semua" {
		db = db.Where("category = ?", category)
	}

	if q := c.Query("q"); q != "" {
		searchTerm := "%" + strings.ToLower(q) + "%"
		db = db.Where("LOWER(title) LIKE ? OR LOWER(excerpt) LIKE ?", searchTerm, searchTerm)
	}

	if status := c.Query("status"); status != "" {
		if status == "published" {
			db = db.Where("is_published = ?", true)
		} else if status == "draft" {
			db = db.Where("is_published = ?", false)
		}
	}

	var total int64
	if err := db.Count(&total).Error; err != nil {
		return databaseFailure(c)
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	if limit < 1 || limit > 50 {
		limit = 10
	}
	if page > 1000000 {
		return c.SendStatus(400)
	}
	offset := (page - 1) * limit

	if err := db.Order("created_at desc").Offset(offset).Limit(limit).Find(&events).Error; err != nil {
		return databaseFailure(c)
	}

	lastPage := int(math.Ceil(float64(total) / float64(limit)))
	if lastPage < 1 {
		lastPage = 1
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    events,
		"meta": fiber.Map{
			"total":     total,
			"page":      page,
			"limit":     limit,
			"last_page": lastPage,
		},
	})
}

type CreateEventRequest struct {
	Title       string `json:"title"`
	Slug        string `json:"slug"`
	Excerpt     string `json:"excerpt"`
	Description string `json:"description"`
	Category    string `json:"category"`
	EventDate   string `json:"event_date"`
	Location    string `json:"location"`
	ImageURL    string `json:"image_url"`
	IsPublished *bool  `json:"is_published"`
}

// POST /api/admin/events (Protected)
func CreateEvent(c *fiber.Ctx) error {
	var req CreateEventRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format data tidak valid",
		})
	}

	if !validEvent(req) || strings.TrimSpace(req.Title) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Judul berita / event wajib diisi",
		})
	}

	slug := req.Slug
	if strings.TrimSpace(slug) == "" {
		slug = generateSlug(req.Title)
	}

	// Ensure unique slug
	var existing models.Event
	if err := config.DB.Where("slug = ?", slug).First(&existing).Error; err == nil {
		slug = fmt.Sprintf("%s-%d", slug, time.Now().UnixNano())
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return databaseFailure(c)
	}

	var eventDate time.Time
	if req.EventDate != "" {
		var parseErr error
		eventDate, parseErr = time.Parse("2006-01-02", req.EventDate)
		if parseErr != nil {
			return c.Status(400).JSON(fiber.Map{"success": false, "message": "Invalid event_date"})
		}
	} else {
		eventDate = time.Now()
	}

	isPublished := true
	if req.IsPublished != nil {
		isPublished = *req.IsPublished
	}

	var publishedAt *time.Time
	if isPublished {
		now := time.Now()
		publishedAt = &now
	}

	userID := c.Locals("user_id").(uint)

	imageURL := req.ImageURL
	if imageURL == "" {
		imageURL = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop"
	}

	category := req.Category
	if category == "" {
		category = "Siaran Pers"
	}

	excerpt := req.Excerpt
	if excerpt == "" && len(req.Description) > 0 {
		runes := []rune(req.Description)
		if len(runes) > 150 {
			excerpt = string(runes[:150]) + "..."
		} else {
			excerpt = req.Description
		}
	}

	newEvent := models.Event{
		Title:       req.Title,
		Slug:        slug,
		Excerpt:     excerpt,
		Description: req.Description,
		Category:    category,
		EventDate:   eventDate,
		Location:    req.Location,
		ImageURL:    imageURL,
		IsPublished: isPublished,
		PublishedAt: publishedAt,
		CreatedBy:   userID,
	}

	if err := config.DB.Create(&newEvent).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan event ke database",
		})
	}

	invalidatePublicCache()
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Berita / event berhasil ditambahkan",
		"data":    newEvent,
	})
}

// PUT /api/admin/events/:id (Protected)
func UpdateEvent(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil || id <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "ID berita / event tidak valid",
		})
	}
	var event models.Event

	if err := config.DB.First(&event, id).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return databaseFailure(c)
		}
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Data berita / event tidak ditemukan",
		})
	}

	var req CreateEventRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format data tidak valid",
		})
	}

	if !validEvent(req) {
		return c.SendStatus(400)
	}
	var fields map[string]interface{}
	if err := c.BodyParser(&fields); err != nil {
		return c.SendStatus(400)
	}
	if _, present := fields["title"]; present {
		if strings.TrimSpace(req.Title) == "" {
			return c.SendStatus(400)
		}
		event.Title = req.Title
	}
	for key, target := range map[string]*string{"excerpt": &event.Excerpt, "description": &event.Description, "location": &event.Location, "image_url": &event.ImageURL} {
		if _, present := fields[key]; present {
			if value, ok := fields[key].(string); ok {
				*target = value
			} else {
				return c.SendStatus(400)
			}
		}
	}
	if req.Excerpt != "" {
		event.Excerpt = req.Excerpt
	}
	if req.Description != "" {
		event.Description = req.Description
	}
	if req.Category != "" {
		event.Category = req.Category
	}
	if req.Location != "" {
		event.Location = req.Location
	}
	if req.ImageURL != "" {
		event.ImageURL = req.ImageURL
	}
	if req.EventDate != "" {
		if parsed, err := time.Parse("2006-01-02", req.EventDate); err == nil {
			event.EventDate = parsed
		}
	}
	if req.IsPublished != nil {
		event.IsPublished = *req.IsPublished
		if event.IsPublished && event.PublishedAt == nil {
			now := time.Now()
			event.PublishedAt = &now
		}
	}

	if err := config.DB.Save(&event).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal memperbarui data berita / event",
		})
	}

	invalidatePublicCache()
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Berita / event berhasil diperbarui",
		"data":    event,
	})
}

// DELETE /api/admin/events/:id (Protected)
func DeleteEvent(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil || id <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "ID berita / event tidak valid",
		})
	}
	var event models.Event

	if err := config.DB.First(&event, id).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return databaseFailure(c)
		}
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Data berita / event tidak ditemukan",
		})
	}

	if err := config.DB.Delete(&event).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menghapus data berita / event",
		})
	}

	invalidatePublicCache()
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Berita / event berhasil dihapus",
	})
}
