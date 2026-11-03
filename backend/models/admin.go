package models

import (
	"time"
)

type Admin struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Username  string    `json:"username" gorm:"unique;not null;size:100"`
	Password  string    `json:"-" gorm:"not null"`
	Name      string    `json:"name" gorm:"size:100"`
	Role         string    `json:"role" gorm:"size:50;default:'admin'"`
	TokenVersion int       `json:"token_version" gorm:"default:1"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
