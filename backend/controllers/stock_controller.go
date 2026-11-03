package controllers

import (
	"bufio"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/sync/singleflight"
)

// Market data for listed Pertamina subsidiaries.
//
// The browser never talks to a third party: this server fetches the public
// Yahoo Finance chart endpoint, normalises it into a small JSON shape, caches
// it, and pushes updates to clients over Server-Sent Events. One upstream poll
// serves every connected visitor, so traffic to the provider stays constant no
// matter how many people are watching.
//
// Security notes:
//   - Only allowlisted symbols and ranges ever reach the upstream URL (no SSRF).
//   - Upstream bodies are size-limited, time-limited, and decoded into a strict
//     struct; nothing from the provider is proxied through verbatim.
//   - SSE connections are capped globally and per IP and have a max lifetime.

var stockSymbols = map[string]string{
	"PGEO": "PGEO.JK",
	"PGAS": "PGAS.JK",
}

type rangeSpec struct {
	interval string
	ttl      time.Duration
}

var stockRanges = map[string]rangeSpec{
	"1d":  {"1m", 15 * time.Second}, // 1-minute ticks presisi penuh selama jam bursa
	"1mo": {"1d", 10 * time.Minute}, // 1 bulan harian
	"3mo": {"1d", 15 * time.Minute}, // 3 bulan harian
	"ytd": {"1d", 15 * time.Minute}, // Tahun berjalan
	"1y":  {"1d", 30 * time.Minute}, // 1 tahun harian
	"3y":  {"1wk", time.Hour},       // 3 tahun mingguan
	"5y":  {"1wk", time.Hour},       // 5 tahun mingguan
}

func getRangeLabel(rng string) string {
	switch rng {
	case "1d":
		return "Hari Ini"
	case "1mo":
		return "1 Bulan Terakhir"
	case "3mo":
		return "3 Bulan Terakhir"
	case "ytd":
		return "Tahun Berjalan"
	case "1y":
		return "1 Tahun Terakhir"
	case "3y":
		return "3 Tahun Terakhir"
	case "5y":
		return "5 Tahun Terakhir"
	default:
		return "Periode Terpilih"
	}
}

const (
	upstreamBase        = "https://query1.finance.yahoo.com/v8/finance/chart/"
	upstreamMaxBody     = 2 << 20 // 2 MiB
	staleLimit          = 24 * time.Hour
	pollOpen            = 15 * time.Second
	pollClosed          = 5 * time.Minute
	sseMaxClients       = 1000
	sseMaxPerIP         = 4
	sseHeartbeat        = 20 * time.Second
	sseMaxLifetime      = 30 * time.Minute
	sseRetryMillis      = 5000
	upstreamUserAgent   = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
	upstreamHTTPTimeout = 8 * time.Second
)

type StockSnapshot struct {
	Symbol           string       `json:"symbol"`
	Name             string       `json:"name"`
	Currency         string       `json:"currency"`
	Exchange         string       `json:"exchange"`
	Range            string       `json:"range"`
	RangeLabel       string       `json:"rangeLabel"`
	Price            float64      `json:"price"`
	PreviousClose    float64      `json:"previousClose"`
	Change           float64      `json:"change"`
	ChangePercent    float64      `json:"changePercent"`
	Open             float64      `json:"open"`
	DayHigh          float64      `json:"dayHigh"`
	DayLow           float64      `json:"dayLow"`
	Volume           int64        `json:"volume"`
	FiftyTwoWeekHigh float64      `json:"fiftyTwoWeekHigh"`
	FiftyTwoWeekLow  float64      `json:"fiftyTwoWeekLow"`
	MarketTime       int64        `json:"marketTime"`
	SessionStart     int64        `json:"sessionStart"`
	SessionEnd       int64        `json:"sessionEnd"`
	MarketOpen       bool         `json:"marketOpen"`
	Baseline         float64      `json:"baseline"`
	Points           [][2]float64 `json:"points"`
	FetchedAt        int64        `json:"fetchedAt"`
	Stale            bool         `json:"stale"`
}

// ---------- upstream ----------

type yahooChart struct {
	Chart struct {
		Result []struct {
			Meta struct {
				Currency             string  `json:"currency"`
				LongName             string  `json:"longName"`
				ShortName            string  `json:"shortName"`
				RegularMarketPrice   float64 `json:"regularMarketPrice"`
				RegularMarketTime    int64   `json:"regularMarketTime"`
				RegularMarketDayHigh float64 `json:"regularMarketDayHigh"`
				RegularMarketDayLow  float64 `json:"regularMarketDayLow"`
				RegularMarketVolume  int64   `json:"regularMarketVolume"`
				FiftyTwoWeekHigh     float64 `json:"fiftyTwoWeekHigh"`
				FiftyTwoWeekLow      float64 `json:"fiftyTwoWeekLow"`
				ChartPreviousClose   float64 `json:"chartPreviousClose"`
				PreviousClose        float64 `json:"previousClose"`
				CurrentTradingPeriod struct {
					Regular struct {
						Start int64 `json:"start"`
						End   int64 `json:"end"`
					} `json:"regular"`
				} `json:"currentTradingPeriod"`
			} `json:"meta"`
			Timestamp  []int64 `json:"timestamp"`
			Indicators struct {
				Quote []struct {
					Open  []*float64 `json:"open"`
					Close []*float64 `json:"close"`
				} `json:"quote"`
			} `json:"indicators"`
		} `json:"result"`
		Error *struct {
			Code        string `json:"code"`
			Description string `json:"description"`
		} `json:"error"`
	} `json:"chart"`
}

var upstreamClient = &http.Client{
	Timeout: upstreamHTTPTimeout,
	// Never follow redirects to somewhere we did not choose.
	CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse },
}

func finite(v float64) bool { return !math.IsNaN(v) && !math.IsInf(v, 0) }

func fetchUpstream(ctx context.Context, code, rng string) (*StockSnapshot, error) {
	ticker, ok := stockSymbols[code]
	spec, ok2 := stockRanges[rng]
	if !ok || !ok2 {
		return nil, errors.New("not allowlisted")
	}

	q := url.Values{"range": {rng}, "interval": {spec.interval}, "includePrePost": {"false"}}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, upstreamBase+url.PathEscape(ticker)+"?"+q.Encode(), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", upstreamUserAgent)
	req.Header.Set("Accept", "application/json")

	res, err := upstreamClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("upstream status %d", res.StatusCode)
	}

	var yc yahooChart
	if err := json.NewDecoder(io.LimitReader(res.Body, upstreamMaxBody)).Decode(&yc); err != nil {
		return nil, fmt.Errorf("decode: %w", err)
	}
	if yc.Chart.Error != nil || len(yc.Chart.Result) == 0 {
		return nil, errors.New("upstream returned no result")
	}

	r := yc.Chart.Result[0]
	m := r.Meta
	if !finite(m.RegularMarketPrice) || m.RegularMarketPrice <= 0 {
		return nil, errors.New("invalid price")
	}

	snap := &StockSnapshot{
		Symbol:           code,
		Name:             m.LongName,
		Currency:         m.Currency,
		Exchange:         "IDX",
		Range:            rng,
		RangeLabel:       getRangeLabel(rng),
		Price:            m.RegularMarketPrice,
		DayHigh:          m.RegularMarketDayHigh,
		DayLow:           m.RegularMarketDayLow,
		Volume:           m.RegularMarketVolume,
		FiftyTwoWeekHigh: m.FiftyTwoWeekHigh,
		FiftyTwoWeekLow:  m.FiftyTwoWeekLow,
		MarketTime:       m.RegularMarketTime,
		SessionStart:     m.CurrentTradingPeriod.Regular.Start,
		SessionEnd:       m.CurrentTradingPeriod.Regular.End,
		PreviousClose:    m.PreviousClose,
		FetchedAt:        time.Now().Unix(),
	}
	if snap.PreviousClose == 0 {
		snap.PreviousClose = m.ChartPreviousClose
	}
	if snap.Name == "" {
		snap.Name = m.ShortName
	}
	now := time.Now().Unix()
	snap.MarketOpen = snap.SessionStart > 0 && now >= snap.SessionStart && now < snap.SessionEnd

	if len(r.Indicators.Quote) > 0 {
		quote := r.Indicators.Quote[0]
		snap.Points = make([][2]float64, 0, len(r.Timestamp))
		for i, ts := range r.Timestamp {
			if i >= len(quote.Close) || quote.Close[i] == nil || !finite(*quote.Close[i]) {
				continue
			}
			snap.Points = append(snap.Points, [2]float64{float64(ts), *quote.Close[i]})
		}
		if rng == "1d" {
			for _, o := range quote.Open {
				if o != nil && finite(*o) {
					snap.Open = *o
					break
				}
			}
		}
	}

	if rng == "1d" {
		snap.Baseline = snap.PreviousClose
		if snap.Baseline > 0 {
			snap.Change = snap.Price - snap.Baseline
			snap.ChangePercent = (snap.Change / snap.Baseline) * 100
		}
	} else {
		if len(snap.Points) > 0 {
			snap.Baseline = snap.Points[0][1]
		} else if snap.PreviousClose > 0 {
			snap.Baseline = snap.PreviousClose
		}
		if snap.Baseline > 0 {
			snap.Change = snap.Price - snap.Baseline
			snap.ChangePercent = (snap.Change / snap.Baseline) * 100
		}
	}
	return snap, nil
}

// ---------- cache ----------

type cacheEntry struct {
	snap    *StockSnapshot
	expires time.Time
}

var (
	stockCache   = map[string]cacheEntry{}
	stockCacheMu sync.RWMutex
	stockFlight  singleflight.Group
)

// getSnapshot returns cached data when fresh, dedupes concurrent upstream
// calls, and falls back to stale data (flagged) if the provider is down.
func getSnapshot(code, rng string) (*StockSnapshot, error) {
	key := code + "|" + rng
	stockCacheMu.RLock()
	entry, hit := stockCache[key]
	stockCacheMu.RUnlock()
	if hit && time.Now().Before(entry.expires) {
		return entry.snap, nil
	}

	v, err, _ := stockFlight.Do(key, func() (any, error) {
		ctx, cancel := context.WithTimeout(context.Background(), upstreamHTTPTimeout)
		defer cancel()
		snap, err := fetchUpstream(ctx, code, rng)
		if err != nil {
			return nil, err
		}
		stockCacheMu.Lock()
		stockCache[key] = cacheEntry{snap: snap, expires: time.Now().Add(stockRanges[rng].ttl)}
		stockCacheMu.Unlock()
		return snap, nil
	})
	if err == nil {
		return v.(*StockSnapshot), nil
	}

	log.Printf("stocks: upstream error for %s: %v", key, err)
	if hit && time.Since(time.Unix(entry.snap.FetchedAt, 0)) < staleLimit {
		stale := *entry.snap
		stale.Stale = true
		return &stale, nil
	}
	return nil, err
}

// ---------- SSE hub ----------

type stockHub struct {
	mu      sync.Mutex
	clients map[chan []byte]struct{}
	perIP   map[string]int
}

var hub = &stockHub{clients: map[chan []byte]struct{}{}, perIP: map[string]int{}}

func (h *stockHub) subscribe(ip string) (chan []byte, bool) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if len(h.clients) >= sseMaxClients || h.perIP[ip] >= sseMaxPerIP {
		return nil, false
	}
	ch := make(chan []byte, 1)
	h.clients[ch] = struct{}{}
	h.perIP[ip]++
	return ch, true
}

func (h *stockHub) unsubscribe(ch chan []byte, ip string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.clients, ch)
	if h.perIP[ip]--; h.perIP[ip] <= 0 {
		delete(h.perIP, ip)
	}
}

func (h *stockHub) count() int {
	h.mu.Lock()
	defer h.mu.Unlock()
	return len(h.clients)
}

// broadcast never blocks: a slow client just misses an intermediate tick,
// it always receives the latest snapshot.
func (h *stockHub) broadcast(msg []byte) {
	h.mu.Lock()
	defer h.mu.Unlock()
	for ch := range h.clients {
		select {
		case ch <- msg:
		default:
			select {
			case <-ch:
			default:
			}
			select {
			case ch <- msg:
			default:
			}
		}
	}
}

func liveFrame() ([]byte, bool) {
	payload := make(map[string]*StockSnapshot, len(stockSymbols))
	open := false
	for code := range stockSymbols {
		if snap, err := getSnapshot(code, "1d"); err == nil {
			payload[code] = snap
			open = open || snap.MarketOpen
		}
	}
	if len(payload) == 0 {
		return nil, open
	}
	b, err := json.Marshal(payload)
	if err != nil {
		return nil, open
	}
	return b, open
}

// StartStockPoller runs a single upstream poller for all SSE subscribers.
// It is idle when nobody is connected.
func StartStockPoller() {
	go func() {
		wait := pollOpen
		for {
			time.Sleep(wait)
			if hub.count() == 0 {
				wait = pollOpen
				continue
			}
			frame, open := liveFrame()
			if frame != nil {
				hub.broadcast(frame)
			}
			if open {
				wait = pollOpen
			} else {
				wait = pollClosed
			}
		}
	}()
}

// ---------- handlers ----------

// GetStock: GET /api/stocks/:symbol?range=1d
func GetStock(c *fiber.Ctx) error {
	// Fiber params/queries alias fasthttp's reusable buffer; copy before caching.
	code := strings.Clone(c.Params("symbol"))
	rng := strings.Clone(c.Query("range", "1d"))
	if _, ok := stockSymbols[code]; !ok {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Simbol tidak tersedia"})
	}
	if _, ok := stockRanges[rng]; !ok {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "Rentang waktu tidak valid"})
	}

	snap, err := getSnapshot(code, rng)
	if err != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"success": false, "message": "Data pasar sedang tidak tersedia"})
	}
	if rng != "1d" {
		// Multi-day ranges inherit live intraday stats from 1d,
		// but compute Change and ChangePercent against the period's Baseline.
		if q, err := getSnapshot(code, "1d"); err == nil {
			merged := *snap
			merged.Price = q.Price
			merged.Open, merged.DayHigh, merged.DayLow, merged.Volume = q.Open, q.DayHigh, q.DayLow, q.Volume
			merged.MarketTime, merged.MarketOpen = q.MarketTime, q.MarketOpen
			merged.SessionStart, merged.SessionEnd = q.SessionStart, q.SessionEnd
			if merged.Baseline > 0 {
				merged.Change = merged.Price - merged.Baseline
				merged.ChangePercent = (merged.Change / merged.Baseline) * 100
			}
			snap = &merged
		}
	}

	c.Set("Cache-Control", fmt.Sprintf("public, max-age=%d", int(stockRanges[rng].ttl.Seconds())))
	return c.JSON(fiber.Map{"success": true, "data": snap})
}

// StreamStocks: GET /api/stocks/stream (text/event-stream)
func StreamStocks(c *fiber.Ctx) error {
	ip := strings.Clone(c.IP())
	ch, ok := hub.subscribe(ip)
	if !ok {
		return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{"success": false, "message": "Terlalu banyak koneksi"})
	}

	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache, no-transform")
	c.Set("Connection", "keep-alive")
	c.Set("X-Accel-Buffering", "no")

	initial, _ := liveFrame()

	c.Context().SetBodyStreamWriter(func(w *bufio.Writer) {
		defer hub.unsubscribe(ch, ip)

		send := func(frame []byte) error {
			if _, err := fmt.Fprintf(w, "event: quote\ndata: %s\n\n", frame); err != nil {
				return err
			}
			return w.Flush()
		}

		if _, err := fmt.Fprintf(w, "retry: %d\n\n", sseRetryMillis); err != nil {
			return
		}
		if initial != nil {
			if send(initial) != nil {
				return
			}
		} else if w.Flush() != nil {
			return
		}

		heartbeat := time.NewTicker(sseHeartbeat)
		defer heartbeat.Stop()
		lifetime := time.NewTimer(sseMaxLifetime)
		defer lifetime.Stop()

		for {
			select {
			case frame := <-ch:
				if send(frame) != nil {
					return
				}
			case <-heartbeat.C:
				if _, err := w.WriteString(": ping\n\n"); err != nil || w.Flush() != nil {
					return
				}
			case <-lifetime.C:
				return // EventSource reconnects automatically
			}
		}
	})
	return nil
}
