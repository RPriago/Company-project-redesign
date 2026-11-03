package middlewares

import (
	"github.com/gofiber/fiber/v2"
	"net/http/httptest"
	"testing"
)

func TestGatewayBoundary(t *testing.T) {
	t.Setenv("ADMIN_GATEWAY_SECRET", "12345678901234567890123456789012")
	app := fiber.New()
	app.Get("/", Gateway, func(c *fiber.Ctx) error { return c.SendString(ClientIP(c)) })
	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set("X-Admin-Client-IP", "203.0.113.1")
	res, _ := app.Test(req)
	if res.StatusCode != 403 {
		t.Fatal("unguarded gateway")
	}
	req.Header.Set("X-Admin-Gateway-Secret", "12345678901234567890123456789012")
	res, _ = app.Test(req)
	if res.StatusCode != 200 {
		t.Fatal("trusted gateway rejected")
	}
}
func TestMaintenanceBlocksLoginAndWrites(t *testing.T) {
	t.Setenv("MAINTENANCE_MODE", "true")
	app := fiber.New()
	app.Use(Maintenance)
	app.All("/*", func(c *fiber.Ctx) error { return c.SendStatus(200) })
	for _, method := range []string{"POST", "PUT", "DELETE"} {
		res, _ := app.Test(httptest.NewRequest(method, "/api/auth/login", nil))
		if res.StatusCode != 503 {
			t.Fatal(method)
		}
	}
	res, _ := app.Test(httptest.NewRequest("GET", "/api/events", nil))
	if res.StatusCode != 200 {
		t.Fatal("reads blocked")
	}
}

func TestPrivateResponseOverridesHandlerCachePolicy(t *testing.T) {
	app := fiber.New()
	app.Use(PrivateResponse)
	app.Get("/", func(c *fiber.Ctx) error {
		c.Set("Cache-Control", "public, max-age=60")
		return c.Status(503).JSON(fiber.Map{"success": false})
	})
	res, err := app.Test(httptest.NewRequest("GET", "/", nil))
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()
	if res.StatusCode != 503 || res.Header.Get("Cache-Control") != "no-store" {
		t.Fatalf("private response: %d %s", res.StatusCode, res.Header.Get("Cache-Control"))
	}
}
