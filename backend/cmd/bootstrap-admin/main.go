// Local operator command. Never included in the API runtime or run on deployment.
package main

import (
	"errors"
	"flag"
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/term"
	"gorm.io/gorm"
	"os"
	"petronesia-backend/config"
	"petronesia-backend/models"
	"regexp"
	"strings"
)

func createInitialAdmin(db *gorm.DB, username, name string, password []byte) error {
	username = strings.ToLower(strings.TrimSpace(username))
	if !regexp.MustCompile(`^[a-z0-9_.-]{3,50}$`).MatchString(username) {
		return errors.New("username must contain 3–50 letters, digits, dots, underscores or hyphens")
	}
	if len(password) < 8 || len(password) > 72 {
		return errors.New("password must contain 8–72 bytes")
	}
	if strings.TrimSpace(name) == "" {
		name = username
	}
	hash, err := bcrypt.GenerateFromPassword(password, bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	return db.Transaction(func(tx *gorm.DB) error {
		// Serialize bootstrap attempts on PostgreSQL, including when the table is empty.
		if tx.Dialector.Name() == "postgres" {
			if err := tx.Exec("SELECT pg_advisory_xact_lock(746382915)").Error; err != nil {
				return err
			}
		}
		var count int64
		if err := tx.Model(&models.Admin{}).Count(&count).Error; err != nil {
			return err
		}
		if count != 0 {
			return errors.New("an administrator already exists; bootstrap refused")
		}
		return tx.Create(&models.Admin{Username: username, Name: name, Password: string(hash), Role: "superadmin", TokenVersion: 1}).Error
	})
}

func run() error {
	username := flag.String("username", "", "First administrator username (required)")
	name := flag.String("name", "", "Administrator display name")
	flag.Parse()
	if *username == "" {
		return errors.New("--username is required")
	}
	if os.Getenv("DATABASE_URL") == "" {
		return errors.New("export the target DATABASE_URL before running bootstrap")
	}
	if !term.IsTerminal(int(os.Stdin.Fd())) {
		return errors.New("run in an interactive terminal; passwords are never accepted as arguments")
	}
	fmt.Fprint(os.Stderr, "Password: ")
	password, err := term.ReadPassword(int(os.Stdin.Fd()))
	fmt.Fprintln(os.Stderr)
	if err != nil {
		return err
	}
	defer clear(password)
	fmt.Fprint(os.Stderr, "Confirm password: ")
	confirmation, err := term.ReadPassword(int(os.Stdin.Fd()))
	fmt.Fprintln(os.Stderr)
	if err != nil {
		return err
	}
	defer clear(confirmation)
	if string(password) != string(confirmation) {
		return errors.New("passwords do not match")
	}
	db, err := config.OpenDatabase()
	if err != nil {
		return err
	}
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	defer sqlDB.Close()
	return createInitialAdmin(db, *username, *name, password)
}

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	fmt.Println("First administrator created. No demo content was inserted.")
}
