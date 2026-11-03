package controllers

import (
	"github.com/gofiber/fiber/v2"
	"petronesia-backend/models"
	"testing"
)

func TestLogoutRollsBackWhenAuditCannotPersist(t *testing.T) {
	db := testDB(t)
	admin := models.Admin{Username: "audit-admin", Password: "hash", TokenVersion: 7}
	if err := db.Create(&admin).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.Migrator().DropTable(&models.AuditLog{}); err != nil {
		t.Fatal(err)
	}
	app := fiber.New()
	app.Post("/logout", func(c *fiber.Ctx) error {
		c.Locals("user_id", admin.ID)
		c.Locals("username", admin.Username)
		return Logout(c)
	})
	res := request(t, app, "POST", "/logout", "")
	defer res.Body.Close()
	if res.StatusCode != 500 {
		t.Fatalf("status %d", res.StatusCode)
	}
	var stored models.Admin
	if err := db.First(&stored, admin.ID).Error; err != nil {
		t.Fatal(err)
	}
	if stored.TokenVersion != 7 {
		t.Fatal("revocation committed without its audit record")
	}
}
