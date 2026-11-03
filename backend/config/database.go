package config

import (
	"fmt"
	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"log"
	"os"
	"petronesia-backend/models"
	"strings"
	"time"
)

var DB *gorm.DB

// OpenDatabase creates the schema without inserting any application records.
// Production always uses PostgreSQL and never silently falls back to SQLite.
func OpenDatabase() (*gorm.DB, error) {
	production := os.Getenv("APP_ENV") == "production"
	databaseURL := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	if production && databaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required in production")
	}
	cfg := &gorm.Config{Logger: logger.New(log.New(os.Stdout, "", log.LstdFlags), logger.Config{LogLevel: logger.Warn, SlowThreshold: 200 * time.Millisecond, ParameterizedQueries: true})}
	var db *gorm.DB
	var err error
	if databaseURL != "" {
		db, err = gorm.Open(postgres.Open(databaseURL), cfg)
	} else if os.Getenv("DB_TYPE") != "sqlite" && os.Getenv("DB_HOST") != "" && os.Getenv("DB_USER") != "" {
		port, name, ssl := os.Getenv("DB_PORT"), os.Getenv("DB_NAME"), os.Getenv("DB_SSLMODE")
		if port == "" {
			port = "5432"
		}
		if name == "" {
			name = "petronesia"
		}
		if ssl == "" {
			ssl = "require"
		}
		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Jakarta connect_timeout=10", os.Getenv("DB_HOST"), os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), name, port, ssl)
		db, err = gorm.Open(postgres.Open(dsn), cfg)
	} else {
		file := os.Getenv("SQLITE_FILE")
		if file == "" {
			file = "petronesia.db"
		}
		db, err = gorm.Open(sqlite.Open(file), cfg)
		if err == nil {
			sqlDB, openErr := db.DB()
			if openErr != nil {
				return nil, openErr
			}
			sqlDB.SetMaxOpenConns(1)
			if pragmaErr := db.Exec("PRAGMA busy_timeout = 5000").Error; pragmaErr != nil {
				return nil, pragmaErr
			}
		}
	}
	if err != nil {
		return nil, fmt.Errorf("database connection failed; no fallback database was created")
	}
	if sqlDB, poolErr := db.DB(); poolErr == nil && db.Dialector.Name() == "postgres" {
		sqlDB.SetMaxOpenConns(5)
		sqlDB.SetMaxIdleConns(2)
		sqlDB.SetConnMaxIdleTime(5 * time.Minute)
		sqlDB.SetConnMaxLifetime(30 * time.Minute)
	}
	if err := installOperationDeadlines(db); err != nil {
		return nil, err
	}
	if err := InitializeSchema(db); err != nil {
		return nil, err
	}
	return db, nil
}

func InitializeSchema(db *gorm.DB) error {
	return db.AutoMigrate(&models.Admin{}, &models.Event{}, &models.ContactMessage{}, &models.JobVacancy{}, &models.SiteContent{}, &models.AuditLog{}, &models.FuelPrice{})
}

func ConnectDB() {
	if DB != nil {
		return
	}
	var err error
	DB, err = OpenDatabase()
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Database schema ready; automatic seeding is disabled")
}
