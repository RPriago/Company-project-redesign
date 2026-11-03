package middlewares

import (
	"crypto/subtle"
	"github.com/gofiber/fiber/v2"
	"net"
	"os"
)

// Gateway authenticates the trusted server boundary before accepting forwarded metadata.
func Gateway(c *fiber.Ctx) error {
	expected := os.Getenv("ADMIN_GATEWAY_SECRET")
	supplied := c.Get("X-Admin-Gateway-Secret")
	if len(expected) < 32 || subtle.ConstantTimeCompare([]byte(expected), []byte(supplied)) != 1 {
		return c.Status(403).JSON(fiber.Map{"success": false, "message": "Gateway required"})
	}
	if ip := net.ParseIP(c.Get("X-Admin-Client-IP")); ip != nil {
		c.Locals("client_ip", ip.String())
	}
	return c.Next()
}
func ClientIP(c *fiber.Ctx) string {
	if ip, ok := c.Locals("client_ip").(string); ok {
		return ip
	}
	return c.IP()
}
func Maintenance(c *fiber.Ctx) error {
	if os.Getenv("MAINTENANCE_MODE") == "true" && c.Method() != "GET" && c.Method() != "HEAD" && c.Method() != "OPTIONS" {
		return c.Status(503).JSON(fiber.Map{"success": false, "message": "Maintenance in progress"})
	}
	return c.Next()
}

// Private responses must stay private even when a handler sets public cache policy.
func PrivateResponse(c *fiber.Ctx) error {
	err := c.Next()
	c.Set("Cache-Control", "no-store")
	c.Set("Pragma", "no-cache")
	return err
}
