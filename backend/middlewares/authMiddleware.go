package middlewares

import (
	"errors"
	"gorm.io/gorm"
	"strings"

	"petronesia-backend/config"
	"petronesia-backend/models"
	"petronesia-backend/utils"

	"github.com/gofiber/fiber/v2"
)

func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Akses ditolak: Token autentikasi tidak ditemukan",
			})
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Format token tidak valid (Gunakan format: Bearer <token>)",
			})
		}

		claims, err := utils.ValidateToken(parts[1])
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali.",
			})
		}

		var admin models.Admin
		err = config.DB.Select("id, token_version, role").First(&admin, claims.UserID).Error
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(503).JSON(fiber.Map{"success": false, "message": "Session service unavailable"})
		}
		if err != nil || admin.TokenVersion != claims.TokenVersion {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Sesi telah dicabut atau kedaluwarsa. Silakan login kembali.",
			})
		}

		c.Locals("user_id", claims.UserID)
		c.Locals("username", claims.Username)
		c.Locals("role", admin.Role)

		return c.Next()
	}
}
