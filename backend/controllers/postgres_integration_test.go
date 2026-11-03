package controllers

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"os"
	"petronesia-backend/config"
	"petronesia-backend/models"
	"sync/atomic"
	"testing"
	"time"
)

// TEST_POSTGRES_URL must refer to a disposable database: this test drops its public schema.
func TestPostgresRemediation(t *testing.T) {
	dsn := os.Getenv("TEST_POSTGRES_URL")
	if dsn == "" {
		t.Skip("set TEST_POSTGRES_URL to a disposable PostgreSQL database")
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if err := db.Exec("DROP SCHEMA public CASCADE; CREATE SCHEMA public").Error; err != nil {
		t.Fatal(err)
	}
	if err := config.InitializeSchema(db); err != nil {
		t.Fatal(err)
	}
	old := config.DB
	config.DB = db
	invalidatePublicCache()
	t.Cleanup(func() { config.DB = old; invalidatePublicCache(); sqlDB, _ := db.DB(); sqlDB.Close() })
	for i := 0; i < 2; i++ { // Schema restart must remain empty.
		if err := config.InitializeSchema(db); err != nil {
			t.Fatal(err)
		}
		for _, m := range []any{&models.Admin{}, &models.Event{}, &models.JobVacancy{}, &models.SiteContent{}, &models.ContactMessage{}, &models.AuditLog{}, &models.FuelPrice{}} {
			var n int64
			if err := db.Model(m).Count(&n).Error; err != nil || n != 0 {
				t.Fatalf("restart rows %T=%d: %v", m, n, err)
			}
		}
	}
	app := fiber.New()
	app.Post("/admin/events", func(c *fiber.Ctx) error { c.Locals("user_id", uint(1)); return CreateEvent(c) })
	app.Post("/admin/jobs", CreateJob)
	app.Get("/api/events", GetEvents)
	app.Get("/api/events/:slug", GetEventBySlug)
	app.Get("/api/jobs", GetJobs)
	app.Get("/api/jobs/:slug", GetJobBySlug)
	for _, v := range []struct{ path, body string }{{"/admin/events", `{"title":"Draft pg","is_published":false}`}, {"/admin/jobs", `{"title":"Inactive pg","department":"Test","is_active":false}`}} {
		r := request(t, app, "POST", v.path, v.body)
		r.Body.Close()
		if r.StatusCode != 201 {
			t.Fatalf("%s: %d", v.path, r.StatusCode)
		}
	}
	var event models.Event
	var job models.JobVacancy
	if err := db.First(&event).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.First(&job).Error; err != nil {
		t.Fatal(err)
	}
	if event.IsPublished || job.IsActive {
		t.Fatal("false visibility overwritten")
	}
	for _, p := range []string{"/api/events/" + event.Slug, "/api/jobs/" + job.Slug, "/api/jobs/9999999"} {
		r := request(t, app, "GET", p, "")
		r.Body.Close()
		if r.StatusCode != 404 {
			t.Fatalf("%s: %d", p, r.StatusCode)
		}
	}
	var queries atomic.Int32
	if err := db.Callback().Query().Before("gorm:query").Register("verification:queries", func(*gorm.DB) { queries.Add(1) }); err != nil {
		t.Fatal(err)
	}
	r := request(t, app, "GET", "/api/events?order=title%3Bdrop%20table%20events", "")
	r.Body.Close()
	if r.StatusCode != 400 || queries.Load() != 0 {
		t.Fatal("invalid sort touched SQL")
	}
	for _, p := range []string{"/api/events", "/api/jobs"} {
		r := request(t, app, "GET", p, "")
		r.Body.Close()
		if r.StatusCode != 200 {
			t.Fatal(r.StatusCode)
		}
	}
	cold := queries.Load()
	if cold != 4 {
		t.Fatalf("cold SQL=%d", cold)
	}
	start := time.Now()
	for i := 0; i < 100; i++ {
		for _, p := range []string{"/api/events", "/api/jobs"} {
			r := request(t, app, "GET", p, "")
			r.Body.Close()
			if r.StatusCode != 200 {
				t.Fatal(r.StatusCode)
			}
		}
	}
	if queries.Load() != cold {
		t.Fatal("warm requests executed SQL")
	}
	t.Logf("200 warm requests: %s; SQL queries: 0", time.Since(start))
}
