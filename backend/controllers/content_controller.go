package controllers

import (
	"errors"
	"fmt"
	"gorm.io/gorm"
	"log"
	"regexp"
	"strings"
	"sync"
	"time"

	"petronesia-backend/config"
	"petronesia-backend/models"
	"petronesia-backend/utils"

	"github.com/gofiber/fiber/v2"
)

type contentCache struct {
	sync.RWMutex
	allJSON []byte
	valid   bool
}

var globalContentCache = &contentCache{}

func invalidateContentCache() {
	invalidatePublicCache()
	globalContentCache.Lock()
	defer globalContentCache.Unlock()
	globalContentCache.valid = false
	globalContentCache.allJSON = nil
}

// GetAllContent - Public endpoint returning all site content with ultra-fast sub-millisecond cache
func GetAllContent(c *fiber.Ctx) error {
	if len(c.Path()) >= 11 && c.Path()[:11] == "/api/admin/" {
		return uncachedGetAllContent(c)
	}
	return cachedPublic(c, uncachedGetAllContent)
}
func uncachedGetAllContent(c *fiber.Ctx) error {
	c.Set("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
	c.Set("X-Content-Type-Options", "nosniff")

	var contents []models.SiteContent
	if err := config.DB.Order("section ASC, id ASC").Find(&contents).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data konten situs",
		})
	}

	contentMap := make(map[string]string)
	sectionMap := make(map[string][]models.SiteContent)

	for _, item := range contents {
		contentMap[item.Key] = item.Value
		sectionMap[item.Section] = append(sectionMap[item.Section], item)
	}

	respMap := fiber.Map{
		"success":  true,
		"data":     contents,
		"map":      contentMap,
		"sections": sectionMap,
	}

	return c.JSON(respMap)
}

// GetContentBySection - Public endpoint for section-specific content
func GetContentBySection(c *fiber.Ctx) error {
	if len(c.Path()) >= 11 && c.Path()[:11] == "/api/admin/" {
		return uncachedGetContentBySection(c)
	}
	return cachedPublic(c, uncachedGetContentBySection)
}
func uncachedGetContentBySection(c *fiber.Ctx) error {
	c.Set("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
	section := c.Params("section")
	var contents []models.SiteContent

	if err := config.DB.Where("section = ?", section).Order("id ASC").Find(&contents).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil konten seksi",
		})
	}

	contentMap := make(map[string]string)
	for _, item := range contents {
		contentMap[item.Key] = item.Value
	}

	return c.JSON(fiber.Map{
		"success": true,
		"section": section,
		"data":    contents,
		"map":     contentMap,
	})
}

// UpdateSingleContent - Protected admin update for single key
func UpdateSingleContent(c *fiber.Ctx) error {
	key := c.Params("key")
	var item models.SiteContent

	if err := config.DB.Where("key = ?", key).First(&item).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return databaseFailure(c)
		}
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": fmt.Sprintf("Konten dengan kunci '%s' tidak ditemukan", key),
		})
	}

	type RequestInput struct {
		Value string `json:"value"`
		Label string `json:"label,omitempty"`
	}

	var req RequestInput
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format data JSON tidak valid",
		})
	}

	if len(req.Value) > 500000 || len(req.Label) > 255 {
		return c.SendStatus(400)
	}
	item.Value = req.Value
	if strings.TrimSpace(req.Label) != "" {
		item.Label = strings.TrimSpace(req.Label)
	}
	item.UpdatedAt = time.Now()

	if err := config.DB.Save(&item).Error; err != nil {
		log.Printf("❌ Database error UpdateSingleContent: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan perubahan konten ke sistem.",
		})
	}

	invalidateContentCache()
	utils.RecordAudit(c, "UPDATE", "CONTENT", item.Key, fmt.Sprintf("Konten '%s' berhasil diperbarui", item.Key))

	return c.JSON(fiber.Map{
		"success": true,
		"message": fmt.Sprintf("Konten '%s' berhasil diperbarui", item.Label),
		"data":    item,
	})
}

// BatchUpdateContent - Protected admin update for multiple key-value pairs (with Upsert)
func BatchUpdateContent(c *fiber.Ctx) error {
	type UpdateItem struct {
		Key   string `json:"key"`
		Value string `json:"value"`
	}

	var req struct {
		Items []UpdateItem      `json:"items"`
		Map   map[string]string `json:"map"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format request JSON tidak valid",
		})
	}

	if len(req.Items)+len(req.Map) > 200 {
		return c.SendStatus(400)
	}
	validKey := regexp.MustCompile(`^[a-z0-9_]{2,80}$`)
	for _, item := range req.Items {
		if !validKey.MatchString(item.Key) || len(item.Value) > 500000 {
			return c.SendStatus(400)
		}
	}
	for key, value := range req.Map {
		if !validKey.MatchString(key) || len(value) > 500000 {
			return c.SendStatus(400)
		}
	}
	tx := config.DB.Begin()
	if tx.Error != nil {
		return databaseFailure(c)
	}

	upsertKey := func(key, val string) error {
		key = strings.TrimSpace(key)
		if key == "" {
			return nil
		}
		var item models.SiteContent
		err := tx.Where("key = ?", key).First(&item).Error
		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}
			// Infer properties if not exists
			section := "general"
			if strings.HasPrefix(key, "home_") || strings.HasPrefix(key, "hero_") || strings.HasPrefix(key, "intro_") || strings.HasPrefix(key, "gallery_") || strings.HasPrefix(key, "dark_block_") || strings.HasPrefix(key, "upstream_") || strings.HasPrefix(key, "downstream_") || strings.HasPrefix(key, "renewable_") || strings.HasPrefix(key, "cta_") {
				section = "home"
			} else if strings.HasPrefix(key, "about_") {
				section = "about"
			} else if strings.HasPrefix(key, "business_") {
				section = "business"
			} else if strings.HasPrefix(key, "sustainability_") {
				section = "sustainability"
			} else if strings.HasPrefix(key, "contact_") {
				section = "contact"
			}

			contentType := "text"
			if strings.Contains(key, "img") || strings.Contains(key, "image") || strings.Contains(key, "photo") || strings.Contains(key, "foto") {
				contentType = "image"
			} else if len(val) > 80 || strings.Contains(key, "desc") || strings.Contains(key, "subheadline") || strings.Contains(key, "vision") || strings.Contains(key, "mission") || strings.Contains(key, "bio") {
				contentType = "textarea"
			}

			newItem := models.SiteContent{
				Key:       key,
				Section:   section,
				Label:     strings.ReplaceAll(key, "_", " "),
				Type:      contentType,
				Value:     val,
				UpdatedAt: time.Now(),
			}
			return tx.Create(&newItem).Error
		}

		return tx.Model(&item).Updates(map[string]interface{}{
			"value":      val,
			"updated_at": time.Now(),
		}).Error
	}

	// Update via Items array if provided
	if len(req.Items) > 0 {
		for _, item := range req.Items {
			if err := upsertKey(item.Key, item.Value); err != nil {
				tx.Rollback()
				log.Printf("❌ Database error BatchUpdateContent items: %v", err)
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"success": false,
					"message": "Gagal memperbarui item konten website.",
				})
			}
		}
	}

	// Update via Map if provided
	if len(req.Map) > 0 {
		for k, v := range req.Map {
			if err := upsertKey(k, v); err != nil {
				tx.Rollback()
				log.Printf("❌ Database error BatchUpdateContent map: %v", err)
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"success": false,
					"message": "Gagal memperbarui pemetaan konten website.",
				})
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		return databaseFailure(c)
	}
	invalidateContentCache()

	utils.RecordAudit(c, "BATCH_UPDATE", "CONTENT", "multiple", fmt.Sprintf("Memperbarui massal konten website (%d item / map)", len(req.Items)+len(req.Map)))

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Seluruh perubahan konten website berhasil disimpan",
	})
}

// CreateContent - Admin creates a new content item (text or image)
func CreateContent(c *fiber.Ctx) error {
	type CreateInput struct {
		Key     string `json:"key"`
		Section string `json:"section"`
		Label   string `json:"label"`
		Type    string `json:"type"` // text, textarea, image
		Value   string `json:"value"`
	}

	var req CreateInput
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format request tidak valid",
		})
	}

	req.Key = strings.TrimSpace(req.Key)
	if req.Key == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Kunci konten (key) wajib diisi",
		})
	}

	// SEC-012: Enforce strict regex validation on content key
	validKeyRegex := regexp.MustCompile(`^[a-z0-9_]{2,80}$`)
	if !validKeyRegex.MatchString(req.Key) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format kunci (key) tidak valid. Hanya boleh menggunakan huruf kecil (a-z), angka (0-9), dan underscore (_) sebanyak 2-80 karakter.",
		})
	}

	// Restrict value payload size
	if len([]rune(req.Value)) > 500000 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Panjang isi konten melebihi batas maksimal yang diizinkan (500.000 karakter).",
		})
	}

	if req.Section == "" {
		req.Section = "general"
	}
	if req.Label == "" {
		req.Label = strings.ReplaceAll(req.Key, "_", " ")
	}
	if req.Type == "" {
		if strings.Contains(req.Key, "img") || strings.Contains(req.Key, "image") {
			req.Type = "image"
		} else {
			req.Type = "text"
		}
	}

	var existing models.SiteContent
	if err := config.DB.Where("key = ?", req.Key).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"success": false,
			"message": fmt.Sprintf("Konten dengan kunci '%s' sudah terdaftar", req.Key),
		})
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return databaseFailure(c)
	}

	if len(req.Section) > 100 || len(req.Label) > 255 || (req.Type != "text" && req.Type != "textarea" && req.Type != "image") || (req.Type == "image" && !validImageURL(req.Value)) {
		return c.SendStatus(400)
	}
	newItem := models.SiteContent{
		Key:       req.Key,
		Section:   req.Section,
		Label:     req.Label,
		Type:      req.Type,
		Value:     req.Value,
		UpdatedAt: time.Now(),
	}

	if err := config.DB.Create(&newItem).Error; err != nil {
		log.Printf("❌ Database error CreateContent: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menambahkan konten baru ke sistem.",
		})
	}

	invalidateContentCache()
	utils.RecordAudit(c, "CREATE", "CONTENT", newItem.Key, fmt.Sprintf("Membuat konten baru '%s'", newItem.Key))

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Konten baru berhasil ditambahkan",
		"data":    newItem,
	})
}

// DeleteContent - Admin deletes a content item by key
func DeleteContent(c *fiber.Ctx) error {
	key := c.Params("key")
	key = strings.TrimSpace(key)
	if key == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Kunci konten (key) wajib diisi",
		})
	}

	var item models.SiteContent
	if err := config.DB.Where("key = ?", key).First(&item).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return databaseFailure(c)
		}
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": fmt.Sprintf("Konten dengan kunci '%s' tidak ditemukan", key),
		})
	}

	if err := config.DB.Delete(&item).Error; err != nil {
		log.Printf("❌ Database error DeleteContent: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menghapus konten dari sistem.",
		})
	}

	invalidateContentCache()
	utils.RecordAudit(c, "DELETE", "CONTENT", key, fmt.Sprintf("Menghapus konten '%s'", key))

	return c.JSON(fiber.Map{
		"success": true,
		"message": fmt.Sprintf("Konten '%s' berhasil dihapus", key),
	})
}
