package controllers

import (
	"encoding/json"
	"fmt"
	"github.com/glebarez/sqlite"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"io"
	"net/http"
	"net/http/httptest"
	"petronesia-backend/config"
	"petronesia-backend/models"
	"strings"
	"sync/atomic"
	"testing"
)

func request(t *testing.T, app *fiber.App, method, path, body string) *http.Response {
	t.Helper()
	r := httptest.NewRequest(method, path, strings.NewReader(body))
	r.Header.Set("Content-Type", "application/json")
	res, err := app.Test(r, -1)
	if err != nil {
		t.Fatal(err)
	}
	return res
}
func testDB(t *testing.T) *gorm.DB {
	t.Helper()
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	sqlDB, _ := db.DB()
	sqlDB.SetMaxOpenConns(1)
	t.Cleanup(func() { sqlDB.Close() })
	if err := config.InitializeSchema(db); err != nil {
		t.Fatal(err)
	}
	old := config.DB
	config.DB = db
	t.Cleanup(func() { config.DB = old; invalidatePublicCache() })
	invalidatePublicCache()
	return db
}
func TestPublicCacheNormalizedQueryETagAndFailure(t *testing.T) {
	invalidatePublicCache()
	defer invalidatePublicCache()
	app := fiber.New()
	var calls atomic.Int32
	app.Get("/api/test", func(c *fiber.Ctx) error {
		return cachedPublic(c, func(c *fiber.Ctx) error { calls.Add(1); return c.JSON(fiber.Map{"ok": true}) })
	})
	first := request(t, app, "GET", "/api/test?page=01&limit=10", "")
	first.Body.Close()
	r := httptest.NewRequest("GET", "/api/test?limit=10&page=1", nil)
	r.Header.Set("If-None-Match", first.Header.Get("ETag"))
	second, err := app.Test(r)
	if err != nil {
		t.Fatal(err)
	}
	second.Body.Close()
	if second.StatusCode != 304 || calls.Load() != 1 || second.Header.Get("Cache-Control") != "public, no-cache" {
		t.Fatalf("status %d calls %d", second.StatusCode, calls.Load())
	}
	app.Get("/api/failure", func(c *fiber.Ctx) error {
		return cachedPublic(c, func(c *fiber.Ctx) error { calls.Add(1); return c.SendStatus(503) })
	})
	for i := 0; i < 2; i++ {
		res := request(t, app, "GET", "/api/failure", "")
		res.Body.Close()
	}
	if calls.Load() != 3 {
		t.Fatal("failure cached")
	}
}
func TestPublicCacheInflightInvalidation(t *testing.T) {
	invalidatePublicCache()
	defer invalidatePublicCache()
	started := make(chan struct{})
	release := make(chan struct{})
	done := make(chan error, 1)
	app := fiber.New()
	var calls atomic.Int32
	app.Get("/api/test", func(c *fiber.Ctx) error {
		return cachedPublic(c, func(c *fiber.Ctx) error {
			if calls.Add(1) == 1 {
				close(started)
				<-release
			}
			return c.JSON(fiber.Map{"ok": true})
		})
	})
	go func() {
		r, err := app.Test(httptest.NewRequest("GET", "/api/test", nil), -1)
		if err == nil {
			r.Body.Close()
		}
		done <- err
	}()
	<-started
	invalidatePublicCache()
	close(release)
	if err := <-done; err != nil {
		t.Fatal(err)
	}
	res := request(t, app, "GET", "/api/test", "")
	res.Body.Close()
	if calls.Load() != 2 {
		t.Fatal("stale fill survived invalidation")
	}
}
func TestVisibilityPaginationSortAndDatabaseFailures(t *testing.T) {
	db := testDB(t)
	db.Create(&models.Event{Title: "draft", Slug: "draft", IsPublished: false})
	db.Create(&models.JobVacancy{Title: "inactive", Slug: "inactive", Department: "test", IsActive: false})
	for i := 0; i < 12; i++ {
		db.Create(&models.JobVacancy{Title: fmt.Sprint(i), Slug: fmt.Sprint(i), Department: "test", IsActive: true})
		db.Create(&models.Event{Title: fmt.Sprint(i), Slug: fmt.Sprint(i), IsPublished: true})
	}
	app := fiber.New()
	app.Get("/api/events", GetEvents)
	app.Get("/api/events/:slug", GetEventBySlug)
	app.Get("/api/jobs", GetJobs)
	app.Get("/api/jobs/:slug", GetJobBySlug)
	var res *http.Response
	var payload struct {
		Data []json.RawMessage
		Meta struct {
			Total int
			Limit int
		}
	}
	for _, path := range []string{"/api/jobs", "/api/events"} {
		res = request(t, app, "GET", path, "")
		json.NewDecoder(res.Body).Decode(&payload)
		res.Body.Close()
		if len(payload.Data) != 10 || payload.Meta.Total != 12 || payload.Meta.Limit != 10 {
			t.Fatalf("%s pagination %+v", path, payload)
		}
	}
	for _, path := range []string{"/api/events/draft", "/api/jobs/inactive"} {
		res := request(t, app, "GET", path, "")
		res.Body.Close()
		if res.StatusCode != 404 {
			t.Fatalf("%s: %d", path, res.StatusCode)
		}
	}
	var queries atomic.Int32
	db.Callback().Query().Before("gorm:query").Register("test:queries", func(*gorm.DB) { queries.Add(1) })
	res = request(t, app, "GET", "/api/events?order=title%3Bdrop%20table%20events", "")
	res.Body.Close()
	if res.StatusCode != 400 || queries.Load() != 0 {
		t.Fatal("invalid sort queried database")
	}
	sqlDB, _ := db.DB()
	sqlDB.Close()
	invalidatePublicCache()
	res = request(t, app, "GET", "/api/events/draft", "")
	io.Copy(io.Discard, res.Body)
	res.Body.Close()
	if res.StatusCode != 503 {
		t.Fatalf("database failure: %d", res.StatusCode)
	}
}
func TestCacheBounded(t *testing.T) {
	invalidatePublicCache()
	defer invalidatePublicCache()
	app := fiber.New()
	app.Get("/test/:id", func(c *fiber.Ctx) error {
		return cachedPublic(c, func(c *fiber.Ctx) error { return c.JSON(fiber.Map{"ok": true}) })
	})
	for i := 0; i < 300; i++ {
		res := request(t, app, "GET", fmt.Sprintf("/test/%d", i), "")
		res.Body.Close()
	}
	publicCache.Lock()
	defer publicCache.Unlock()
	if len(publicCache.entries) > 256 || publicCache.bytes > 16<<20 {
		t.Fatal("unbounded cache")
	}
}

func TestDraftAndInactiveCreationAndWarmQueryCount(t *testing.T) {
	db := testDB(t)
	app := fiber.New()
	app.Post("/admin/events", func(c *fiber.Ctx) error { c.Locals("user_id", uint(1)); return CreateEvent(c) })
	app.Post("/admin/jobs", CreateJob)
	app.Get("/api/events", GetEvents)
	app.Get("/api/jobs", GetJobs)
	for _, item := range []struct{ path, body string }{{"/admin/events", `{"title":"Draft created","is_published":false}`}, {"/admin/jobs", `{"title":"Inactive created","department":"Engineering","is_active":false}`}} {
		res := request(t, app, "POST", item.path, item.body)
		res.Body.Close()
		if res.StatusCode != 201 {
			t.Fatalf("create %s: %d", item.path, res.StatusCode)
		}
	}
	var event models.Event
	var job models.JobVacancy
	db.First(&event)
	db.First(&job)
	if event.IsPublished || job.IsActive {
		t.Fatal("explicit false changed to true")
	}
	var queries atomic.Int32
	db.Callback().Query().Before("gorm:query").Register("test:warm_query_count", func(*gorm.DB) { queries.Add(1) })
	for _, path := range []string{"/api/events", "/api/jobs"} {
		res := request(t, app, "GET", path, "")
		res.Body.Close()
	}
	cold := queries.Load()
	if cold != 4 {
		t.Fatalf("cold queries %d", cold)
	}
	for _, path := range []string{"/api/events", "/api/jobs"} {
		res := request(t, app, "GET", path, "")
		res.Body.Close()
	}
	if queries.Load() != cold {
		t.Fatal("warm cache queried database")
	}
}
