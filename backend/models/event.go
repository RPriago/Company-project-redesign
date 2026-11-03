package models

import (
	"time"
)

type Event struct {
	ID          uint       `json:"id" gorm:"primaryKey"`
	Title       string     `json:"title" gorm:"size:255;not null"`
	Slug        string     `json:"slug" gorm:"size:255;unique;not null;index"`
	Excerpt     string     `json:"excerpt" gorm:"type:text"`
	Description string     `json:"description" gorm:"type:text"`
	Category    string     `json:"category" gorm:"size:100;index"`
	EventDate   time.Time  `json:"event_date"`
	Location    string     `json:"location" gorm:"size:200"`
	ImageURL    string     `json:"image_url" gorm:"size:500"`
	IsPublished bool       `json:"is_published" gorm:"default:true;index"`
	Views       int        `json:"views" gorm:"default:0"`
	PublishedAt *time.Time `json:"published_at"`
	CreatedBy   uint       `json:"created_by"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}
