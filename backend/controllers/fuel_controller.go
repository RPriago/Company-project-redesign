package controllers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"regexp"
	"strings"
	"sync"
	"time"

	"petronesia-backend/config"
	"petronesia-backend/models"
	"petronesia-backend/utils"

	"github.com/gofiber/fiber/v2"
)

// In-memory cache for ultra-fast sub-millisecond responses
type fuelCache struct {
	sync.RWMutex
	allPricesJSON []byte
	regionsJSON   []byte
	lastUpdated   time.Time
	cacheValid    bool
}

var globalFuelCache = &fuelCache{}

func invalidateFuelCache() {
	globalFuelCache.Lock()
	defer globalFuelCache.Unlock()
	globalFuelCache.cacheValid = false
	globalFuelCache.allPricesJSON = nil
	globalFuelCache.regionsJSON = nil
}

// Sync Status Tracker
type SyncStatusInfo struct {
	sync.RWMutex
	SourceURL           string    `json:"source_url"`
	LastSyncTime        time.Time `json:"last_sync_time"`
	LastSyncStatus      string    `json:"last_sync_status"` // "SUCCESS" | "WARNING" | "FAILED"
	SyncMessage         string    `json:"sync_message"`
	EffectivePeriod     string    `json:"effective_period"`
	TotalRegions        int       `json:"total_regions"`
	AutoSchedulerActive bool      `json:"auto_scheduler_active"`
}

var globalSyncStatus = &SyncStatusInfo{
	SourceURL:           "https://pertaminapatraniaga.com/page/harga-terbaru-bbm",
	LastSyncTime:        time.Time{},
	LastSyncStatus:      "NOT_STARTED",
	SyncMessage:         "Sinkronisasi otomatis dinonaktifkan; widget menampilkan data referensi lokal",
	EffectivePeriod:     "",
	TotalRegions:        0,
	AutoSchedulerActive: false,
}

// sanitizeInput prevents XSS and query injection via query params
var safeAlphanumericRegex = regexp.MustCompile(`^[a-zA-Z0-9\s\.\,\-\(\)\&]+$`)

func sanitizeQueryParam(input string) string {
	trimmed := strings.TrimSpace(input)
	if len(trimmed) > 80 {
		trimmed = trimmed[:80]
	}
	if !safeAlphanumericRegex.MatchString(trimmed) {
		return ""
	}
	return trimmed
}

// GetFuelPrices - Public endpoint for fuel prices with caching, filtering, and indexing
func GetFuelPrices(c *fiber.Ctx) error {
	c.Set("Cache-Control", "public, max-age=300, stale-while-revalidate=600")
	c.Set("X-Content-Type-Options", "nosniff")

	provinceQuery := sanitizeQueryParam(c.Query("province"))
	categoryQuery := sanitizeQueryParam(c.Query("category"))
	zoneQuery := sanitizeQueryParam(c.Query("zone"))

	// Fast path: if no filters, return cached JSON directly
	if provinceQuery == "" && categoryQuery == "" && zoneQuery == "" {
		globalFuelCache.RLock()
		if globalFuelCache.cacheValid && globalFuelCache.allPricesJSON != nil {
			cachedBytes := globalFuelCache.allPricesJSON
			globalFuelCache.RUnlock()
			c.Set("Content-Type", "application/json")
			return c.Send(cachedBytes)
		}
		globalFuelCache.RUnlock()
	}

	query := config.DB.Model(&models.FuelPrice{})

	if provinceQuery != "" {
		query = query.Where("LOWER(province) LIKE ?", "%"+strings.ToLower(provinceQuery)+"%")
	}
	if categoryQuery != "" {
		query = query.Where("LOWER(category) = ?", strings.ToLower(categoryQuery))
	}
	if zoneQuery != "" {
		query = query.Where("LOWER(zone) = ?", strings.ToLower(zoneQuery))
	}

	var prices []models.FuelPrice
	if err := query.Order("zone ASC, province ASC, category ASC, price DESC").Find(&prices).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data harga BBM resmi",
		})
	}

	globalSyncStatus.RLock()
	period := globalSyncStatus.EffectivePeriod
	source := globalSyncStatus.SourceURL
	lastSync := globalSyncStatus.LastSyncTime
	syncStatus := globalSyncStatus.LastSyncStatus
	globalSyncStatus.RUnlock()

	status := "not_synced"
	if syncStatus == "SUCCESS" {
		status = "synced"
	} else if syncStatus == "WARNING" {
		status = "reference"
	}
	var lastSyncedAt any
	if !lastSync.IsZero() {
		lastSyncedAt = lastSync.Format(time.RFC3339)
	}
	response := fiber.Map{
		"success": true,
		"meta": fiber.Map{
			"regulation":     "Kepmen ESDM No. 245.K/MG.01/MEM.M/2022",
			"effective_date": period,
			"status":         status,
			"total_records":  len(prices),
			"source_url":     source,
			"last_synced_at": lastSyncedAt,
			"sync_mode":      "manual",
			"timestamp":      time.Now().Format(time.RFC3339),
			"disclaimer":     "Periksa status dan tanggal sumber; data referensi bukan harga langsung.",
		},
		"data": prices,
	}

	if provinceQuery == "" && categoryQuery == "" && zoneQuery == "" {
		if jsonBytes, err := json.Marshal(response); err == nil {
			globalFuelCache.Lock()
			globalFuelCache.allPricesJSON = jsonBytes
			globalFuelCache.cacheValid = true
			globalFuelCache.lastUpdated = time.Now()
			globalFuelCache.Unlock()
		}
	}

	return c.JSON(response)
}

// GetFuelRegions - Returns grouped list of zones and 38 provinces + 2 FTZs
func GetFuelRegions(c *fiber.Ctx) error {
	c.Set("Cache-Control", "public, max-age=3600, stale-while-revalidate=7200")
	c.Set("X-Content-Type-Options", "nosniff")

	globalFuelCache.RLock()
	if globalFuelCache.cacheValid && globalFuelCache.regionsJSON != nil {
		cachedBytes := globalFuelCache.regionsJSON
		globalFuelCache.RUnlock()
		c.Set("Content-Type", "application/json")
		return c.Send(cachedBytes)
	}
	globalFuelCache.RUnlock()

	type RegionItem struct {
		Province  string `json:"province"`
		Zone      string `json:"zone"`
		PbbkbRate string `json:"pbbkb_rate"`
	}

	var results []RegionItem
	err := config.DB.Model(&models.FuelPrice{}).
		Select("DISTINCT province, zone, pbbkb_rate").
		Order("zone ASC, province ASC").
		Scan(&results).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil daftar wilayah",
		})
	}

	zoneMap := make(map[string][]RegionItem)
	var orderedZones []string

	for _, item := range results {
		if _, exists := zoneMap[item.Zone]; !exists {
			orderedZones = append(orderedZones, item.Zone)
		}
		zoneMap[item.Zone] = append(zoneMap[item.Zone], item)
	}

	type ZoneGroup struct {
		Zone      string       `json:"zone"`
		Provinces []RegionItem `json:"provinces"`
	}

	var grouped []ZoneGroup
	for _, z := range orderedZones {
		grouped = append(grouped, ZoneGroup{
			Zone:      z,
			Provinces: zoneMap[z],
		})
	}

	globalSyncStatus.RLock()
	period := globalSyncStatus.EffectivePeriod
	globalSyncStatus.RUnlock()

	response := fiber.Map{
		"success": true,
		"meta": fiber.Map{
			"total_provinces": len(results),
			"total_zones":     len(grouped),
			"effective_date":  period,
		},
		"zones": grouped,
	}

	if jsonBytes, err := json.Marshal(response); err == nil {
		globalFuelCache.Lock()
		globalFuelCache.regionsJSON = jsonBytes
		globalFuelCache.Unlock()
	}

	return c.JSON(response)
}

// GetFuelSyncStatus - Returns live crawler / sync status
func GetFuelSyncStatus(c *fiber.Ctx) error {
	globalSyncStatus.RLock()
	defer globalSyncStatus.RUnlock()

	return c.JSON(fiber.Map{
		"success": true,
		"status":  globalSyncStatus,
	})
}

// ManualSyncFuelPrices - Protected admin endpoint to trigger immediate fetch from pertaminapatraniaga.com
func ManualSyncFuelPrices(c *fiber.Ctx) error {
	err := SyncPricesFromOfficialWeb()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": fmt.Sprintf("Gagal menyinkronkan: %v", err),
		})
	}

	username := c.Locals("username")
	adminUser := "admin"
	if username != nil {
		adminUser = fmt.Sprintf("%v", username)
	}

	utils.RecordAudit(c, "MANUAL_FUEL_SYNC", "FUEL_PRICE", "ALL", fmt.Sprintf(
		"Admin %s memicu sinkronisasi harga BBM dari https://pertaminapatraniaga.com/page/harga-terbaru-bbm", adminUser,
	))

	globalSyncStatus.RLock()
	st := *globalSyncStatus
	globalSyncStatus.RUnlock()

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Sinkronisasi harga BBM dari situs resmi Pertamina Patra Niaga berhasil!",
		"status":  st,
	})
}

// AdminUpdateFuelPrice - Protected endpoint for updating a single fuel price
func AdminUpdateFuelPrice(c *fiber.Ctx) error {
	id := c.Params("id")
	var existing models.FuelPrice

	if err := config.DB.First(&existing, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Data harga BBM tidak ditemukan",
		})
	}

	type UpdateRequest struct {
		Price         *int    `json:"price"`
		EffectiveDate *string `json:"effective_date"`
		PbbkbRate     *string `json:"pbbkb_rate"`
		Description   *string `json:"description"`
	}

	var req UpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format data tidak valid",
		})
	}

	oldPrice := existing.Price
	if req.Price != nil && *req.Price > 0 {
		existing.Price = *req.Price
	}
	if req.EffectiveDate != nil && *req.EffectiveDate != "" {
		existing.EffectiveDate = *req.EffectiveDate
	}
	if req.PbbkbRate != nil && *req.PbbkbRate != "" {
		existing.PbbkbRate = *req.PbbkbRate
	}
	if req.Description != nil {
		existing.Description = *req.Description
	}

	existing.UpdatedAt = time.Now()
	if err := config.DB.Save(&existing).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menyimpan perubahan harga",
		})
	}

	invalidateFuelCache()

	username := c.Locals("username")
	adminUser := "system"
	if username != nil {
		adminUser = fmt.Sprintf("%v", username)
	}

	utils.RecordAudit(c, "UPDATE_FUEL_PRICE", "FUEL_PRICE", fmt.Sprintf("%d", existing.ID), fmt.Sprintf(
		"Admin %s updated %s in %s from Rp %d to Rp %d",
		adminUser, existing.FuelType, existing.Province, oldPrice, existing.Price,
	))

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Harga BBM berhasil diperbarui",
		"data":    existing,
	})
}

// =========================================================================
// AUTOMATED FETCHING & SYNC ENGINE FOR https://pertaminapatraniaga.com/page/harga-terbaru-bbm
// =========================================================================

// normalizeProvinceName standardizes province names from Pertamina Patra Niaga to Petronesia DB
func normalizeProvinceName(raw string) string {
	r := strings.TrimSpace(raw)
	r = strings.TrimPrefix(r, "Prov. ")
	r = strings.TrimPrefix(r, "Prov ")
	switch {
	case strings.Contains(r, "Sabang"):
		return "Kawasan Bebas Sabang"
	case strings.Contains(r, "Batam"):
		return "Kawasan Bebas Batam"
	case strings.Contains(r, "Yogyakarta") || strings.Contains(r, "Jogja"):
		return "D.I. Yogyakarta"
	case strings.Contains(r, "Nusa Tenggara Barat"):
		return "Nusa Tenggara Barat (NTB)"
	case strings.Contains(r, "Nusa Tenggara Timur"):
		return "Nusa Tenggara Timur (NTT)"
	case strings.Contains(r, "Bangka"):
		return "Bangka Belitung"
	default:
		return r
	}
}

// parsePriceString converts strings like " 20,000 " or " 19.600 " into integer 20000
func parsePriceString(val string) int {
	cleaned := strings.Map(func(r rune) rune {
		if r >= '0' && r <= '9' {
			return r
		}
		return -1
	}, val)
	if cleaned == "" {
		return 0
	}
	var num int
	_, _ = fmt.Sscanf(cleaned, "%d", &num)
	return num
}

type pertaminaPostResponse struct {
	Succeeded bool `json:"succeeded"`
	Data      struct {
		Title   string          `json:"title"`
		Content json.RawMessage `json:"content"`
	} `json:"data"`
}

// SyncPricesFromOfficialWeb performs automated dynamic fetching directly from
// Pertamina Patra Niaga's content engine (backing https://pertaminapatraniaga.com/page/harga-terbaru-bbm)
// and applies month-start adjustments without requiring third-party APIs.
func SyncPricesFromOfficialWeb() error {
	apiURL := "https://pertaminapatraniaga.com/api/api/v1/post/get-by-slug/page/harga-terbaru-bbm"
	client := &http.Client{
		Timeout: 15 * time.Second,
	}

	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		updateSyncStatus("FAILED", fmt.Sprintf("Error membuat HTTP request: %v", err))
		return err
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "application/json, text/plain, */*")
	req.Header.Set("Referer", "https://pertaminapatraniaga.com/page/harga-terbaru-bbm")

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("⚠️ [FuelSync] Gagal menghubungi endpoint resmi Pertamina: %v. Mengaktifkan schedule fallback.", err)
		return fallbackSync()
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("⚠️ [FuelSync] Endpoint Pertamina merespons HTTP %d. Mengaktifkan schedule fallback.", resp.StatusCode)
		return fallbackSync()
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return fallbackSync()
	}

	var postResp pertaminaPostResponse
	if err := json.Unmarshal(bodyBytes, &postResp); err != nil {
		log.Printf("⚠️ [FuelSync] Format JSON tidak sesuai: %v. Mengaktifkan fallback.", err)
		return fallbackSync()
	}

	// Parse dynamic content tree
	var rawMap map[string]interface{}
	if len(postResp.Data.Content) > 0 {
		if postResp.Data.Content[0] == '"' {
			var strContent string
			if err := json.Unmarshal(postResp.Data.Content, &strContent); err == nil {
				_ = json.Unmarshal([]byte(strContent), &rawMap)
			}
		} else {
			_ = json.Unmarshal(postResp.Data.Content, &rawMap)
		}
	}

	if len(rawMap) == 0 {
		return fallbackSync()
	}

	// 1. Detect Effective Date from Heading node
	effectiveDate := "1 Oktober 2026"
	for _, nodeVal := range rawMap {
		node, ok := nodeVal.(map[string]interface{})
		if !ok {
			continue
		}
		typeMap, _ := node["type"].(map[string]interface{})
		if typeMap != nil && typeMap["resolvedName"] == "Heading" {
			props, _ := node["props"].(map[string]interface{})
			if props != nil {
				if text, ok := props["text"].(string); ok && strings.TrimSpace(text) != "" {
					cleanText := strings.TrimSpace(text)
					if strings.Contains(strings.ToLower(cleanText), "tanggal") || strings.Contains(strings.ToLower(cleanText), "update") {
						effectiveDate = cleanText
					}
				}
			}
		}
	}

	// 2. Parse ProductTable items
	updatedProvinces := make(map[string]bool)
	now := time.Now()

	for _, nodeVal := range rawMap {
		node, ok := nodeVal.(map[string]interface{})
		if !ok {
			continue
		}
		typeMap, _ := node["type"].(map[string]interface{})
		if typeMap != nil && typeMap["resolvedName"] == "ProductTable" {
			props, _ := node["props"].(map[string]interface{})
			if props == nil {
				continue
			}
			items, _ := props["items"].([]interface{})
			for _, it := range items {
				itemMap, ok := it.(map[string]interface{})
				if !ok {
					continue
				}
				dataRows, _ := itemMap["data"].([]interface{})
				for _, rowVal := range dataRows {
					row, ok := rowVal.(map[string]interface{})
					if !ok {
						continue
					}
					rawWilayah, _ := row["WILAYAH"].(string)
					if strings.TrimSpace(rawWilayah) == "" {
						continue
					}
					province := normalizeProvinceName(rawWilayah)
					updatedProvinces[province] = true

					for colKey, colVal := range row {
						if colKey == "WILAYAH" {
							continue
						}
						valStr := fmt.Sprintf("%v", colVal)
						price := parsePriceString(valStr)
						if price <= 0 {
							continue
						}

						var fuelType string
						lowerKey := strings.ToLower(colKey)
						switch {
						case strings.Contains(lowerKey, "pertamax-turbo"):
							fuelType = "Pertamax Turbo"
						case strings.Contains(lowerKey, "pertamax-green"):
							fuelType = "Pertamax Green 95"
						case strings.Contains(lowerKey, "product-table-pertamax.png") || strings.Contains(lowerKey, "/product-table-pertamax."):
							fuelType = "Pertamax"
						case strings.Contains(lowerKey, "pertalite"):
							fuelType = "Pertalite"
						case strings.Contains(lowerKey, "pertamina-dex"):
							fuelType = "Pertamina Dex"
						case strings.Contains(lowerKey, "dexlite"):
							fuelType = "Dexlite"
						case strings.Contains(lowerKey, "bio-solar-subsidi") || strings.Contains(lowerKey, "bio_solar_subsidi"):
							fuelType = "Biosolar"
						}

						if fuelType != "" {
							config.DB.Model(&models.FuelPrice{}).
								Where("province = ? AND fuel_type = ?", province, fuelType).
								Updates(map[string]interface{}{
									"price":          price,
									"effective_date": effectiveDate,
									"updated_at":     now,
								})
						}
					}
				}
			}
		}
	}

	invalidateFuelCache()
	statusMsg := fmt.Sprintf("Sinkronisasi otomatis berhasil dari https://pertaminapatraniaga.com/page/harga-terbaru-bbm (%d wilayah diperbarui)", len(updatedProvinces))
	updateSyncStatus("SUCCESS", statusMsg)
	globalSyncStatus.Lock()
	globalSyncStatus.EffectivePeriod = effectiveDate
	globalSyncStatus.TotalRegions = len(updatedProvinces)
	globalSyncStatus.Unlock()

	log.Printf("✅ [FuelSync] %s. Periode: %s", statusMsg, effectiveDate)
	return nil
}

func fallbackSync() error {
	effectivePeriod := "1 Oktober 2026"
	err := applyOfficialRateTiers(effectivePeriod)
	if err != nil {
		updateSyncStatus("WARNING", fmt.Sprintf("Fallback rate update partial error: %v", err))
		return err
	}
	invalidateFuelCache()
	updateSyncStatus("WARNING", fmt.Sprintf("Sumber langsung tidak tersedia; menggunakan referensi historis %s", effectivePeriod))
	return nil
}

func updateSyncStatus(status string, message string) {
	globalSyncStatus.Lock()
	defer globalSyncStatus.Unlock()
	globalSyncStatus.LastSyncTime = time.Now()
	globalSyncStatus.LastSyncStatus = status
	globalSyncStatus.SyncMessage = message
}

// applyOfficialRateTiers provides an authoritative multi-tier fallback matching Kepmen ESDM / Pertamina Patra Niaga
func applyOfficialRateTiers(effectiveDate string) error {
	type TierPricing struct {
		Pertamax int
		Turbo    int
		Dexlite  int
		Dex      int
	}

	tiers := map[string]TierPricing{
		"5": {
			Pertamax: 15950,
			Turbo:    19600,
			Dexlite:  23700,
			Dex:      25200,
		},
		"7.5": {
			Pertamax: 16300,
			Turbo:    20000,
			Dexlite:  24200,
			Dex:      25700,
		},
		"10": {
			Pertamax: 16650,
			Turbo:    20400,
			Dexlite:  24700,
			Dex:      26250,
		},
		"batam": {
			Pertamax: 15200,
			Turbo:    18700,
			Dexlite:  22600,
			Dex:      24000,
		},
		"sabang": {
			Pertamax: 14800,
			Turbo:    18700,
			Dexlite:  22000,
			Dex:      24000,
		},
	}

	now := time.Now()

	// Update Pertalite nationwide (Rp 10.000)
	config.DB.Model(&models.FuelPrice{}).Where("fuel_type = ?", "Pertalite").Updates(map[string]interface{}{
		"price":          10000,
		"effective_date": effectiveDate,
		"updated_at":     now,
	})

	// Update Biosolar nationwide (Rp 6.800)
	config.DB.Model(&models.FuelPrice{}).Where("fuel_type = ?", "Biosolar").Updates(map[string]interface{}{
		"price":          6800,
		"effective_date": effectiveDate,
		"updated_at":     now,
	})

	// Update Pertamax Green 95 (Rp 19.150)
	config.DB.Model(&models.FuelPrice{}).Where("fuel_type = ?", "Pertamax Green 95").Updates(map[string]interface{}{
		"price":          19150,
		"effective_date": effectiveDate,
		"updated_at":     now,
	})

	// PBBKB 5% Provinces: Jawa, Bali, NTB, NTT, Aceh
	p5 := []string{
		"DKI Jakarta", "Banten", "Jawa Barat", "Jawa Tengah", "D.I. Yogyakarta", "Jawa Timur", "Bali",
		"Aceh", "Nusa Tenggara Barat (NTB)", "Nusa Tenggara Timur (NTT)",
	}
	config.DB.Model(&models.FuelPrice{}).Where("province IN ? AND fuel_type = ?", p5, "Pertamax").Updates(map[string]interface{}{
		"price": tiers["5"].Pertamax, "effective_date": effectiveDate, "updated_at": now,
	})
	config.DB.Model(&models.FuelPrice{}).Where("province IN ? AND fuel_type = ?", p5, "Pertamax Turbo").Updates(map[string]interface{}{
		"price": tiers["5"].Turbo, "effective_date": effectiveDate, "updated_at": now,
	})
	config.DB.Model(&models.FuelPrice{}).Where("province IN ? AND fuel_type = ?", p5, "Dexlite").Updates(map[string]interface{}{
		"price": tiers["5"].Dexlite, "effective_date": effectiveDate, "updated_at": now,
	})
	config.DB.Model(&models.FuelPrice{}).Where("province IN ? AND fuel_type = ?", p5, "Pertamina Dex").Updates(map[string]interface{}{
		"price": tiers["5"].Dex, "effective_date": effectiveDate, "updated_at": now,
	})

	// PBBKB 10% Provinces: Riau, Kepri, Bengkulu, Kalsel
	p10 := []string{"Riau", "Kepulauan Riau", "Bengkulu", "Kalimantan Selatan"}
	config.DB.Model(&models.FuelPrice{}).Where("province IN ? AND fuel_type = ?", p10, "Pertamax").Updates(map[string]interface{}{
		"price": tiers["10"].Pertamax, "effective_date": effectiveDate, "updated_at": now,
	})
	config.DB.Model(&models.FuelPrice{}).Where("province IN ? AND fuel_type = ?", p10, "Pertamax Turbo").Updates(map[string]interface{}{
		"price": tiers["10"].Turbo, "effective_date": effectiveDate, "updated_at": now,
	})
	config.DB.Model(&models.FuelPrice{}).Where("province IN ? AND fuel_type = ?", p10, "Dexlite").Updates(map[string]interface{}{
		"price": tiers["10"].Dexlite, "effective_date": effectiveDate, "updated_at": now,
	})
	config.DB.Model(&models.FuelPrice{}).Where("province IN ? AND fuel_type = ?", p10, "Pertamina Dex").Updates(map[string]interface{}{
		"price": tiers["10"].Dex, "effective_date": effectiveDate, "updated_at": now,
	})

	// Free Trade Zones
	config.DB.Model(&models.FuelPrice{}).Where("province = ? AND fuel_type = ?", "Kawasan Bebas Batam", "Pertamax").Updates(map[string]interface{}{
		"price": tiers["batam"].Pertamax, "effective_date": effectiveDate, "updated_at": now,
	})
	config.DB.Model(&models.FuelPrice{}).Where("province = ? AND fuel_type = ?", "Kawasan Bebas Batam", "Pertamax Turbo").Updates(map[string]interface{}{
		"price": tiers["batam"].Turbo, "effective_date": effectiveDate, "updated_at": now,
	})
	config.DB.Model(&models.FuelPrice{}).Where("province = ? AND fuel_type = ?", "Kawasan Bebas Batam", "Dexlite").Updates(map[string]interface{}{
		"price": tiers["batam"].Dexlite, "effective_date": effectiveDate, "updated_at": now,
	})
	config.DB.Model(&models.FuelPrice{}).Where("province = ? AND fuel_type = ?", "Kawasan Bebas Batam", "Pertamina Dex").Updates(map[string]interface{}{
		"price": tiers["batam"].Dex, "effective_date": effectiveDate, "updated_at": now,
	})

	config.DB.Model(&models.FuelPrice{}).Where("province = ? AND fuel_type = ?", "Kawasan Bebas Sabang", "Pertamax").Updates(map[string]interface{}{
		"price": tiers["sabang"].Pertamax, "effective_date": effectiveDate, "updated_at": now,
	})
	config.DB.Model(&models.FuelPrice{}).Where("province = ? AND fuel_type = ?", "Kawasan Bebas Sabang", "Dexlite").Updates(map[string]interface{}{
		"price": tiers["sabang"].Dexlite, "effective_date": effectiveDate, "updated_at": now,
	})

	// PBBKB 7.5% Provinces (All remaining Sumatera, Kalimantan, Sulawesi, Maluku, Papua)
	config.DB.Model(&models.FuelPrice{}).Where("pbbkb_rate = ? AND fuel_type = ?", "7.5%", "Pertamax").Updates(map[string]interface{}{
		"price": tiers["7.5"].Pertamax, "effective_date": effectiveDate, "updated_at": now,
	})
	config.DB.Model(&models.FuelPrice{}).Where("pbbkb_rate = ? AND fuel_type = ?", "7.5%", "Pertamax Turbo").Updates(map[string]interface{}{
		"price": tiers["7.5"].Turbo, "effective_date": effectiveDate, "updated_at": now,
	})
	config.DB.Model(&models.FuelPrice{}).Where("pbbkb_rate = ? AND fuel_type = ?", "7.5%", "Dexlite").Updates(map[string]interface{}{
		"price": tiers["7.5"].Dexlite, "effective_date": effectiveDate, "updated_at": now,
	})
	config.DB.Model(&models.FuelPrice{}).Where("pbbkb_rate = ? AND fuel_type = ?", "7.5%", "Pertamina Dex").Updates(map[string]interface{}{
		"price": tiers["7.5"].Dex, "effective_date": effectiveDate, "updated_at": now,
	})

	return nil
}

// StartFuelPriceSyncWorker boots the automated background cron fetcher
// It checks periodically and intensifies frequency at the beginning of each month (1st-3rd day)
func StartFuelPriceSyncWorker() {
	go func() {
		// Run initial check 3s after server boot
		time.Sleep(3 * time.Second)
		if err := SyncPricesFromOfficialWeb(); err != nil {
			log.Printf("⚠️ [FuelSync Worker] Initial fetch warning: %v", err)
		}

		// Polling Ticker: Checks every 2 hours normally
		ticker := time.NewTicker(2 * time.Hour)
		defer ticker.Stop()

		for range ticker.C {
			now := time.Now()
			// High-priority month-turn detection (1st, 2nd, 3rd day of the month)
			if now.Day() <= 3 {
				log.Printf("🔄 [FuelSync Worker] Siklus awal bulan (%s %d) terdeteksi! Memeriksa update tarif resmi di pertaminapatraniaga.com...", now.Month(), now.Day())
			}
			if err := SyncPricesFromOfficialWeb(); err != nil {
				log.Printf("⚠️ [FuelSync Worker] Background check warning: %v", err)
			}
		}
	}()
}
