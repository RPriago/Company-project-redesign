package models

import (
	"time"
)

type ContactMessage struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"size:150;not null"`
	Email     string    `json:"email" gorm:"size:150;not null"`
	Phone     string    `json:"phone" gorm:"size:50"`
	Subject   string    `json:"subject" gorm:"size:255;not null"`
	Message   string    `json:"message" gorm:"type:text;not null"`
	IsRead    bool      `json:"is_read" gorm:"default:false"`
	CreatedAt time.Time `json:"created_at"`
}
