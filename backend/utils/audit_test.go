package utils

import (
	"context"
	"net/http/httptest"
	"petronesia-backend/models"
	"sync"
	"testing"
	"unsafe"

	"github.com/gofiber/fiber/v2"
)

func TestConcurrentAuditDrainAndRecord(t *testing.T) {
	app := fiber.New()
	app.Post("/audit", func(c *fiber.Ctx) error {
		RecordAudit(c, "TEST", "AUTH", "1", "test")
		return c.SendStatus(204)
	})
	StartAuditWorker()
	var workers sync.WaitGroup
	for i := 0; i < 20; i++ {
		workers.Add(1)
		go func() {
			defer workers.Done()
			res, err := app.Test(httptest.NewRequest("POST", "/audit", nil), -1)
			if err != nil {
				t.Error(err)
				return
			}
			res.Body.Close()
		}()
	}
	DrainAudit(context.Background())
	workers.Wait()
	DrainAudit(context.Background())
}

func TestAuditSnapshotOwnsRequestStrings(t *testing.T) {
	data := []byte("request header")
	borrowed := unsafe.String(unsafe.SliceData(data), len(data))
	entry := snapshotAudit(models.AuditLog{Username: borrowed, Action: borrowed, Resource: borrowed, TargetID: borrowed, IPAddress: borrowed, UserAgent: borrowed, Details: borrowed})
	for i := range data {
		data[i] = 'x'
	}
	for _, value := range []string{entry.Username, entry.Action, entry.Resource, entry.TargetID, entry.IPAddress, entry.UserAgent, entry.Details} {
		if value != "request header" {
			t.Fatal("audit retained a reusable request buffer")
		}
	}
}
