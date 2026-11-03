package utils

import (
	"context"
	"gorm.io/gorm"
	"log"
	"petronesia-backend/config"
	"petronesia-backend/models"
	"strings"
	"sync"

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
	if trusted, ok := c.Locals("client_ip").(string); ok {
		ip = trusted
	}
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

	auditMu.RLock()
	defer auditMu.RUnlock()
	if auditClosed {
		return
	}
	select {
	case auditQueue <- snapshotAudit(entry):
	default:
		log.Print("Audit queue full: entry dropped")
	}
}

var auditQueue = make(chan models.AuditLog, 256)
var auditMu sync.RWMutex
var auditClosed bool
var auditCloseOnce sync.Once
var auditOnce sync.Once
var auditDone = make(chan struct{})

func StartAuditWorker() {
	auditOnce.Do(func() {
		go func() {
			defer close(auditDone)
			for entry := range auditQueue {
				if config.DB != nil {
					if err := config.DB.Create(&entry).Error; err != nil {
						log.Print("Audit persistence failed")
					}
				}
			}
		}()
	})
}
func DrainAudit(ctx context.Context) {
	StartAuditWorker()
	auditCloseOnce.Do(func() {
		auditMu.Lock()
		auditClosed = true
		close(auditQueue)
		auditMu.Unlock()
	})
	select {
	case <-auditDone:
	case <-ctx.Done():
	}
}

// AuditAuthTx makes sensitive account changes and their audit record inseparable.
func AuditAuthTx(tx *gorm.DB, c *fiber.Ctx, action string, targetID string) error {
	userID, _ := c.Locals("user_id").(uint)
	username, _ := c.Locals("username").(string)
	ip := c.IP()
	if trusted, ok := c.Locals("client_ip").(string); ok {
		ip = trusted
	}
	return tx.Create(&models.AuditLog{UserID: userID, Username: username, Action: action, Resource: "AUTH", TargetID: targetID, IPAddress: ip}).Error
}

// Fiber strings may reference request buffers reused immediately after return.
func snapshotAudit(entry models.AuditLog) models.AuditLog {
	entry.Username = strings.Clone(entry.Username)
	entry.Action = strings.Clone(entry.Action)
	entry.Resource = strings.Clone(entry.Resource)
	entry.TargetID = strings.Clone(entry.TargetID)
	entry.IPAddress = strings.Clone(entry.IPAddress)
	entry.UserAgent = strings.Clone(entry.UserAgent)
	entry.Details = strings.Clone(entry.Details)
	return entry
}
