package routes

import (
	"time"

	"petronesia-backend/controllers"
	"petronesia-backend/middlewares"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

func SetupRoutes(app *fiber.App) {
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"app":     "Petronesia API Gateway",
			"status":  "healthy",
			"version": "1.0.0",
			"company": "PT Petronesia Energi Nusantara",
		})
	})

	api := app.Group("/api")
	api.Get("/health", controllers.Health)

	// Rate Limiter for Login (Anti-Brute Force: Max 5 attempts per minute per IP)
	loginLimiter := limiter.New(limiter.Config{
		Max:        5,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"message": "Terlalu banyak percobaan login. Silakan coba lagi dalam 1 menit.",
			})
		},
	})

	// Rate Limiter for Public Contact Form (Anti-Spam / DoS: Max 10 requests per 10 minutes)
	contactLimiter := limiter.New(limiter.Config{
		Max:        10,
		Expiration: 10 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"message": "Terlalu banyak pengiriman pesan. Silakan coba lagi nanti.",
			})
		},
	})

	// Authentication (Public)
	auth := api.Group("/auth")
	auth.Post("/login", loginLimiter, controllers.Login)

	// Rate Limiter for Public Read/CMS (Anti-Scraping / L7 DoS: Max 300 requests per minute per IP)
	publicReadLimiter := limiter.New(limiter.Config{
		Max:        300,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return "read:" + c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"message": "Batas permintaan terlampaui. Silakan kurangi frekuensi akses.",
			})
		},
	})

	// Public Events & News
	api.Get("/events", publicReadLimiter, controllers.GetEvents)
	api.Get("/events/:slug", publicReadLimiter, controllers.GetEventBySlug)

	// Public Job Vacancies (Loker)
	api.Get("/jobs", publicReadLimiter, controllers.GetJobs)
	api.Get("/jobs/:slug", publicReadLimiter, controllers.GetJobBySlug)

	// Public Site Content & Images CMS
	api.Get("/content", publicReadLimiter, controllers.GetAllContent)
	api.Get("/content/:section", publicReadLimiter, controllers.GetContentBySection)

	// Public Contact Form (Rate Limited)
	api.Post("/contact", contactLimiter, controllers.SubmitContact)

	// Public Market Data (IDX: PGEO, PGAS). Upstream is polled once server-side.
	stockLimiter := limiter.New(limiter.Config{
		Max:        120,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return "stocks:" + c.IP()
		},
	})
	streamLimiter := limiter.New(limiter.Config{
		Max:        20,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return "stream:" + c.IP()
		},
	})
	api.Get("/stocks/stream", streamLimiter, controllers.StreamStocks)
	api.Get("/stocks/:symbol", stockLimiter, controllers.GetStock)

	// Public Official Fuel Prices (38 Provinces & FTZ per Kepmen ESDM)
	fuelLimiter := limiter.New(limiter.Config{
		Max:        180,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return "fuel:" + c.IP()
		},
	})
	api.Get("/fuel-prices", fuelLimiter, controllers.GetFuelPrices)
	api.Get("/fuel-prices/regions", fuelLimiter, controllers.GetFuelRegions)
	api.Get("/fuel-prices/sync-status", controllers.GetFuelSyncStatus)

	// Protected Admin Management (Requires Bearer JWT)
	admin := api.Group("/admin", middlewares.Protected())
	admin.Put("/fuel-prices/:id", controllers.AdminUpdateFuelPrice)
	admin.Post("/fuel-prices/sync", controllers.ManualSyncFuelPrices)
	admin.Get("/me", controllers.Me)
	admin.Post("/logout", controllers.Logout)          // SEC-014: Invalidate token version upon logout
	admin.Put("/password", controllers.ChangePassword) // Change password with token revocation
	admin.Post("/register", controllers.Register)      // Protected: Only authenticated admins can register new admins!
	admin.Get("/stats", controllers.GetDashboardStats)
	admin.Get("/audit-logs", controllers.GetAuditLogs) // SEC-013: Security audit trail

	// Admin Events & News CRUD
	admin.Get("/events", controllers.AdminGetEvents)
	admin.Post("/events", controllers.CreateEvent)
	admin.Put("/events/:id", controllers.UpdateEvent)
	admin.Delete("/events/:id", controllers.DeleteEvent)

	// Admin Job Vacancies (Loker) CRUD
	admin.Get("/jobs", controllers.AdminGetJobs)
	admin.Post("/jobs", controllers.CreateJob)
	admin.Put("/jobs/:id", controllers.UpdateJob)
	admin.Delete("/jobs/:id", controllers.DeleteJob)

	// Admin Site Content & Section Media CMS CRUD
	admin.Get("/content", controllers.GetAllContent)
	admin.Post("/content", controllers.CreateContent)
	admin.Put("/content", controllers.BatchUpdateContent)
	admin.Put("/content/:key", controllers.UpdateSingleContent)
	admin.Delete("/content/:key", controllers.DeleteContent)

	// Image Upload & Contacts
	admin.Post("/upload", controllers.UploadImage)
	admin.Get("/contacts", controllers.GetContacts)
}
