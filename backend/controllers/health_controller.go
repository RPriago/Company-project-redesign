package controllers

import (
	"context"
	"github.com/gofiber/fiber/v2"
	"petronesia-backend/config"
	"time"
)

func Health(c *fiber.Ctx) error {
	if config.DB != nil {
		db, err := config.DB.DB()
		if err == nil {
			ctx, cancel := context.WithTimeout(c.UserContext(), 2*time.Second)
			defer cancel()
			if db.PingContext(ctx) == nil {
				return c.JSON(fiber.Map{"success": true, "status": "healthy"})
			}
		}
	}
	return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"success": false, "status": "unavailable"})
}
