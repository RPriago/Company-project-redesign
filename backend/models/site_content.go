package models

import (
	"time"
)

type SiteContent struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Key       string    `json:"key" gorm:"size:100;uniqueIndex;not null"`
	Section   string    `json:"section" gorm:"size:50;index;not null"`
	Label     string    `json:"label" gorm:"size:255;not null"`
	Type      string    `json:"type" gorm:"size:50;not null"` // image, text, textarea
	Value     string    `json:"value" gorm:"type:text"`
	UpdatedAt time.Time `json:"updated_at"`
}
