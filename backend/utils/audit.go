package utils

import (
	"log"
	"petronesia-backend/config"
	"petronesia-backend/models"

	"github.com/gofiber/fiber/v2"
)

// RecordAudit persists security-relevant actions to the audit_logs table asynchronously
func RecordAudit(c *fiber.Ctx, action, resource, targetID, details string) {
	var userID uint
	var username string

	if id, ok := c.Locals("user_id").(uint); ok {
		userID = id
	} else if idF, ok := c.Locals("user_id").(float64); ok {
		userID = uint(idF)
	}

	if u, ok := c.Locals("username").(string); ok {
		username = u
	}

	ip := c.IP()
	ua := c.Get("User-Agent")
	if len(ua) > 250 {
		ua = ua[:250]
	}

	entry := models.AuditLog{
		UserID:    userID,
		Username:  username,
		Action:    action,
		Resource:  resource,
		TargetID:  targetID,
		IPAddress: ip,
		UserAgent: ua,
		Details:   details,
	}

	db := config.DB
	go func(auditEntry models.AuditLog) {
		if db != nil {
			if err := db.Create(&auditEntry).Error; err != nil {
				log.Printf("⚠️ Audit logging failure: %v", err)
			}
		}
	}(entry)
}
