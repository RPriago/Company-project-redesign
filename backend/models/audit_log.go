package models

import (
	"time"
)

type AuditLog struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"index"`
	Username  string    `json:"username" gorm:"size:100;index"`
	Action    string    `json:"action" gorm:"size:50;index"`   // e.g., CREATE, UPDATE, DELETE, LOGIN, LOGOUT
	Resource  string    `json:"resource" gorm:"size:50;index"` // e.g., EVENT, JOB, CONTENT, AUTH
	TargetID  string    `json:"target_id" gorm:"size:100"`
	IPAddress string    `json:"ip_address" gorm:"size:50"`
	UserAgent string    `json:"user_agent" gorm:"size:255"`
	Details   string    `json:"details" gorm:"type:text"`
	CreatedAt time.Time `json:"created_at" gorm:"index"`
}
