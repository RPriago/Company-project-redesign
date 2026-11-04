package controllers

import (
	"crypto/sha256"
	"fmt"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/sync/singleflight"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"
)

type publicResult struct {
	body   []byte
	status int
}
type publicEntry struct {
	body       []byte
	expires    time.Time
	generation uint64
}

var publicCache = struct {
	sync.Mutex
	entries    map[string]publicEntry
	bytes      int
	generation uint64
	fills      singleflight.Group
}{entries: make(map[string]publicEntry)}

func databaseFailure(c *fiber.Ctx) error {
	return c.Status(503).JSON(fiber.Map{"success": false, "message": "Database temporarily unavailable"})
}
func invalidatePublicCache() {
	publicCache.Lock()
	publicCache.generation++
	publicCache.entries = make(map[string]publicEntry)
	publicCache.bytes = 0
	publicCache.Unlock()
}

// GET revalidation uses weak comparison; proxies may weaken an origin ETag.
func matchesETag(header, tag string) bool {
	for _, candidate := range strings.Split(header, ",") {
		candidate = strings.TrimSpace(candidate)
		if candidate == "*" || strings.TrimPrefix(candidate, "W/") == tag {
			return true
		}
	}
	return false
}

func cachedPublic(c *fiber.Ctx, handler fiber.Handler) error {
	query, err := url.ParseQuery(string(c.Request().URI().QueryString()))
	if err != nil {
		return c.SendStatus(400)
	}
	for key, values := range query {
		if len(values) != 1 || len(values[0]) > 200 {
			return c.SendStatus(400)
		}
		if key == "page" || key == "limit" {
			n, e := strconv.Atoi(values[0])
			if e != nil || n < 1 || (key == "limit" && n > 50) || n > 1000000 {
				return c.SendStatus(400)
			}
			query.Set(key, strconv.Itoa(n))
		}
	}
	if order := query.Get("order"); order != "" && order != "event_date desc" && order != "event_date asc" && order != "created_at desc" {
		return c.SendStatus(400)
	}
	key := strings.Clone(c.Path()) + "?" + query.Encode()
	publicCache.Lock()
	generation := publicCache.generation
	item, ok := publicCache.entries[key]
	publicCache.Unlock()
	send := func(body []byte, status string) error {
		tag := fmt.Sprintf("\"%x\"", sha256.Sum256(body))
		c.Set("Cache-Control", "public, no-cache")
		c.Set("ETag", tag)
		c.Set("X-Cache", status)
		c.Type("json")
		if matchesETag(c.Get("If-None-Match"), tag) {
			return c.SendStatus(304)
		}
		return c.Send(body)
	}
	if ok && item.generation == generation && time.Now().Before(item.expires) {
		return send(item.body, "HIT")
	}
	result, err, _ := publicCache.fills.Do(fmt.Sprintf("%d:%s", generation, key), func() (interface{}, error) {
		if err := handler(c); err != nil {
			return nil, err
		}
		if c.Response().StatusCode() != 200 {
			return publicResult{append([]byte(nil), c.Response().Body()...), c.Response().StatusCode()}, nil
		}
		body := append([]byte(nil), c.Response().Body()...)
		publicCache.Lock()
		defer publicCache.Unlock()
		if publicCache.generation == generation && len(body) <= 1<<20 {
			if len(publicCache.entries) >= 256 || publicCache.bytes+len(body) > 16<<20 {
				publicCache.entries = make(map[string]publicEntry)
				publicCache.bytes = 0
			}
			if old, exists := publicCache.entries[key]; exists {
				publicCache.bytes -= len(old.body)
			}
			publicCache.entries[key] = publicEntry{body, time.Now().Add(60 * time.Second), generation}
			publicCache.bytes += len(body)
		}
		return publicResult{body, 200}, nil
	})
	if err != nil {
		return err
	}
	if result == nil {
		return nil
	}
	r := result.(publicResult)
	if r.status != 200 {
		c.Set("Cache-Control", "no-store")
		c.Type("json")
		return c.Status(r.status).Send(r.body)
	}
	return send(r.body, "MISS")
}
