package middlewares

import (
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// Known aggressive AI scrapers and automated content extractors
var aggressiveAIBots = []string{
	"gptbot",
	"chatgpt-user",
	"ccbot",
	"anthropic-ai",
	"claudebot",
	"bytespider",
	"petalbot",
	"turnitin",
	"cohere-ai",
	"omgili",
	"diffbot",
	"seekport",
}

// BotGuard inspects incoming requests for abusive AI bot signatures and suspicious patterns
func BotGuard() fiber.Handler {
	return func(c *fiber.Ctx) error {
		ua := strings.ToLower(c.Get("User-Agent"))
		path := c.Path()

		// Allow legitimate web search engines (Google, Bing)
		isLegitSearch := strings.Contains(ua, "googlebot") || strings.Contains(ua, "bingbot") || strings.Contains(ua, "yandexbot")

		if !isLegitSearch {
			for _, bot := range aggressiveAIBots {
				if strings.Contains(ua, bot) {
					// Aggressive AI bot detected
					log.Printf("🤖 [AI-Bot Guard] Terdeteksi bot AI agresif '%s' dari IP %s pada path %s", bot, c.IP(), path)

					// Block access to administrative, authentication, and heavy write/search endpoints
					if strings.HasPrefix(path, "/api/admin") || strings.HasPrefix(path, "/api/auth") || strings.HasPrefix(path, "/api/contact") {
						return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
							"success": false,
							"message": "Akses bot otomatis tidak diizinkan pada endpoint ini.",
						})
					}

					// For public content endpoints, set cache and rate headers to prevent server strain
					c.Set("X-Robots-Tag", "noindex, noarchive, nosnippet")
					break
				}
			}
		}

		// Security: Prevent HTTP Header Injection / Oversized headers
		if len(c.Get("User-Agent")) > 500 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Header User-Agent melebihi batas yang diizinkan.",
			})
		}

		return c.Next()
	}
}
