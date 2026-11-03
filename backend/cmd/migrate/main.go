package main

import (
	"log"

	"petronesia-backend/config"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load("../../.env")
	_ = godotenv.Load(".env")
	log.Println("⚡ Menjalankan migrasi dan seeding database...")
	config.ConnectDB()
	SeedData(config.DB)
	log.Println("🎉 Migrasi & Seeding berhasil 100%!")
}
