package main

import (
	"golang.org/x/crypto/bcrypt"
	"path/filepath"
	"petronesia-backend/config"
	"petronesia-backend/models"
	"testing"
)

func TestBootstrapCreatesOnlyFirstAdmin(t *testing.T) {
	t.Setenv("APP_ENV", "test")
	t.Setenv("DATABASE_URL", "")
	t.Setenv("DB_TYPE", "sqlite")
	t.Setenv("SQLITE_FILE", filepath.Join(t.TempDir(), "bootstrap.db"))
	db, err := config.OpenDatabase()
	if err != nil {
		t.Fatal(err)
	}
	sqlDB, _ := db.DB()
	defer sqlDB.Close()
	if err := createInitialAdmin(db, "invalid username", "", []byte("secure-password")); err == nil {
		t.Fatal("accepted invalid username")
	}
	if err := createInitialAdmin(db, "owner", "Owner", []byte("short")); err == nil {
		t.Fatal("accepted short password")
	}
	if err := createInitialAdmin(db, "Owner", "Owner", []byte("secure-password")); err != nil {
		t.Fatal(err)
	}
	if err := createInitialAdmin(db, "second", "Second", []byte("another-password")); err == nil {
		t.Fatal("bootstrap must refuse an existing administrator")
	}
	var admin models.Admin
	if err := db.First(&admin).Error; err != nil {
		t.Fatal(err)
	}
	if admin.Username != "owner" || admin.Role != "superadmin" || admin.TokenVersion != 1 {
		t.Fatalf("unexpected admin: %+v", admin)
	}
	if err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte("secure-password")); err != nil {
		t.Fatal(err)
	}
	for _, model := range []any{&models.Event{}, &models.JobVacancy{}, &models.SiteContent{}, &models.ContactMessage{}, &models.AuditLog{}, &models.FuelPrice{}} {
		var count int64
		if err := db.Model(model).Count(&count).Error; err != nil || count != 0 {
			t.Fatalf("unexpected bootstrap records in %T", model)
		}
	}
}
