package main

import (
	"github.com/gofiber/fiber/v2"
	"net/http/httptest"
	"path/filepath"
	"petronesia-backend/config"
	"petronesia-backend/models"
	"petronesia-backend/routes"
	"testing"
)

func TestReadOnlyLaunchAndHealth(t *testing.T) {
	t.Setenv("APP_ENV", "test")
	t.Setenv("DATABASE_URL", "")
	t.Setenv("DB_TYPE", "sqlite")
	t.Setenv("SQLITE_FILE", filepath.Join(t.TempDir(), "launch.db"))
	db, err := config.OpenDatabase()
	if err != nil {
		t.Fatal(err)
	}
	config.DB = db
	app := fiber.New()
	routes.SetupRoutes(app)
	for _, path := range []string{"/api/health", "/api/content", "/api/jobs", "/api/events", "/api/fuel-prices", "/api/fuel-prices/regions", "/api/fuel-prices/sync-status"} {
		res, err := app.Test(httptest.NewRequest("GET", path, nil))
		if err != nil || res.StatusCode != 200 {
			t.Fatalf("%s failed: %v", path, err)
		}
		res.Body.Close()
	}
	for _, model := range []any{&models.Admin{}, &models.Event{}, &models.JobVacancy{}, &models.SiteContent{}, &models.ContactMessage{}, &models.AuditLog{}, &models.FuelPrice{}} {
		var count int64
		if err := db.Model(model).Count(&count).Error; err != nil || count != 0 {
			t.Fatalf("read-only launch wrote rows in %T: %d %v", model, count, err)
		}
	}
	sqlDB, _ := db.DB()
	sqlDB.Close()
	res, err := app.Test(httptest.NewRequest("GET", "/api/health", nil))
	if err != nil || res.StatusCode != 503 {
		t.Fatalf("health must report unavailable DB: %v", err)
	}
}
