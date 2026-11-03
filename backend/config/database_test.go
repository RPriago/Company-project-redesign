package config

import (
	"os"
	"path/filepath"
	"petronesia-backend/models"
	"testing"
)

func TestSchemaInitializationAndRestartInsertNothing(t *testing.T) {
	t.Setenv("APP_ENV", "test")
	t.Setenv("DATABASE_URL", "")
	t.Setenv("DB_TYPE", "sqlite")
	t.Setenv("SQLITE_FILE", filepath.Join(t.TempDir(), "empty.db"))
	for range 2 {
		db, err := OpenDatabase()
		if err != nil {
			t.Fatal(err)
		}
		for _, model := range []any{&models.Admin{}, &models.Event{}, &models.JobVacancy{}, &models.SiteContent{}, &models.ContactMessage{}, &models.AuditLog{}, &models.FuelPrice{}} {
			var count int64
			if err := db.Model(model).Count(&count).Error; err != nil {
				t.Fatal(err)
			}
			if count != 0 {
				t.Fatalf("%T has %d rows after startup", model, count)
			}
		}
		sqlDB, _ := db.DB()
		if err := sqlDB.Close(); err != nil {
			t.Fatal(err)
		}
	}
}

func TestProductionNeverFallsBackToSQLite(t *testing.T) {
	t.Setenv("APP_ENV", "production")
	file := filepath.Join(t.TempDir(), "must-not-exist.db")
	t.Setenv("SQLITE_FILE", file)
	for _, dsn := range []string{"", "postgres://invalid%zz"} {
		t.Setenv("DATABASE_URL", dsn)
		if _, err := OpenDatabase(); err == nil {
			t.Fatal("expected production database error")
		}
		if _, err := os.Stat(file); !os.IsNotExist(err) {
			t.Fatal("SQLite fallback file was created")
		}
	}
}

func TestAllowedOrigins(t *testing.T) {
	t.Setenv("APP_ENV", "production")
	for _, value := range []string{"", "*", "https://*.vercel.app", "http://example.com", "https://example.com/path"} {
		t.Setenv("ALLOWED_ORIGINS", value)
		if _, err := AllowedOrigins(); err == nil {
			t.Fatalf("accepted invalid origin %q", value)
		}
	}
	t.Setenv("ALLOWED_ORIGINS", "https://portfolio.vercel.app/")
	if got, err := AllowedOrigins(); err != nil || got != "https://portfolio.vercel.app" {
		t.Fatalf("got %q, %v", got, err)
	}
	t.Setenv("APP_ENV", "development")
	t.Setenv("ALLOWED_ORIGINS", "")
	if got, err := AllowedOrigins(); err != nil || got != "http://localhost:3000,http://127.0.0.1:3000" {
		t.Fatalf("got %q, %v", got, err)
	}
}
