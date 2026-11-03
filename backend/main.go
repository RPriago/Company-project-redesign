package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"petronesia-backend/utils"
	"syscall"
	"time"

	"petronesia-backend/config"
	"petronesia-backend/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("ℹ️  Info: Tidak ada file .env ditemukan, menggunakan konfigurasi default sistem")
	}

	if os.Getenv("APP_ENV") == "production" && (len(os.Getenv("JWT_SECRET")) < 32 || len(os.Getenv("ADMIN_GATEWAY_SECRET")) < 32) {
		log.Fatal("❌ FATAL: JWT_SECRET dan ADMIN_GATEWAY_SECRET minimal 32 byte wajib diatur pada environment production demi keamanan (OWASP A02)")
	}

	allowedOrigins, err := config.AllowedOrigins()
	if err != nil {
		log.Fatal(err)
	}

	// Create schema only; never seed records at startup.
	config.ConnectDB()
	utils.StartAuditWorker()

	// Initialize Fiber
	app := fiber.New(fiber.Config{
		BodyLimit:    6 * 1024 * 1024,
		AppName:      "Petronesia Enterprise Backend v1.0",
		ServerHeader: "Fiber/Petronesia",
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			message := err.Error()
			if code >= 500 {
				message = "Internal server error"
			}
			return c.Status(code).JSON(fiber.Map{
				"success": false,
				"message": message,
			})
		},
	})

	// Global Middlewares
	app.Use(recover.New())
	app.Use(requestid.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${locals:requestid} ${status} - ${method} ${path} (${latency})\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, HEAD, PUT, DELETE, PATCH, OPTIONS",
		AllowCredentials: false,
	}))

	// Register Routes
	routes.SetupRoutes(app)

	// Port
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("====================================================")
	log.Printf("🚀 Petronesia Backend API berjalan di http://localhost:%s", port)
	log.Printf("====================================================")

	shutdownDone := make(chan struct{})
	go func() {
		signals := make(chan os.Signal, 1)
		signal.Notify(signals, syscall.SIGINT, syscall.SIGTERM)
		<-signals
		_ = app.ShutdownWithTimeout(15 * time.Second)
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		utils.DrainAudit(ctx)
		close(shutdownDone)
	}()
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("❌ Server error: %v", err)
	}
	<-shutdownDone
}
