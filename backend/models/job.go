package models

import (
	"time"
)

type JobVacancy struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Title        string    `json:"title" gorm:"size:255;not null"`
	Slug         string    `json:"slug" gorm:"size:255;unique;not null;index"`
	Department   string    `json:"department" gorm:"size:100;index"`
	Location     string    `json:"location" gorm:"size:150"`
	Type         string    `json:"type" gorm:"size:50"` // Full-time, Kontrak, Internship
	Experience   string    `json:"experience" gorm:"size:100"`
	Description  string    `json:"description" gorm:"type:text"`
	Requirements string    `json:"requirements" gorm:"type:text"`
	Deadline     string    `json:"deadline" gorm:"size:100"`
	IsActive     bool      `json:"is_active" gorm:"default:true;index"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
