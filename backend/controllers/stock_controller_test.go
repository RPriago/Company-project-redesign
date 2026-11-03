package controllers

import (
	"context"
	"testing"
)

func TestFetchUpstreamRejectsNonAllowlisted(t *testing.T) {
	cases := [][2]string{
		{"AAPL", "1d"},
		{"PGEO", "10y"},
		{"PGEO", "99d"},
		{"../../etc/passwd", "1d"},
		{"PGEO.JK", "1d"},
		{"PGEO", "1d&interval=1m"},
	}
	for _, c := range cases {
		if _, err := fetchUpstream(context.Background(), c[0], c[1]); err == nil {
			t.Errorf("expected rejection for %q/%q", c[0], c[1])
		}
	}
}

func TestStockRangesAllowlist(t *testing.T) {
	expected := []string{"1d", "1mo", "3mo", "ytd", "1y", "3y", "5y"}
	for _, r := range expected {
		if _, ok := stockRanges[r]; !ok {
			t.Errorf("expected range %q to be supported", r)
		}
		if lbl := getRangeLabel(r); lbl == "Periode Terpilih" {
			t.Errorf("expected explicit label for range %q, got %q", r, lbl)
		}
	}
}

func TestHubPerIPCapAndRelease(t *testing.T) {
	h := &stockHub{clients: map[chan []byte]struct{}{}, perIP: map[string]int{}}
	var chans []chan []byte
	for i := 0; i < sseMaxPerIP; i++ {
		ch, ok := h.subscribe("1.2.3.4")
		if !ok {
			t.Fatalf("subscribe %d should succeed", i)
		}
		chans = append(chans, ch)
	}
	if _, ok := h.subscribe("1.2.3.4"); ok {
		t.Fatal("per-IP cap not enforced")
	}
	if _, ok := h.subscribe("5.6.7.8"); !ok {
		t.Fatal("other IP should not be affected")
	}
	h.unsubscribe(chans[0], "1.2.3.4")
	if _, ok := h.subscribe("1.2.3.4"); !ok {
		t.Fatal("slot should be released after unsubscribe")
	}
}

func TestHubBroadcastNeverBlocksAndKeepsLatest(t *testing.T) {
	h := &stockHub{clients: map[chan []byte]struct{}{}, perIP: map[string]int{}}
	ch, _ := h.subscribe("1.1.1.1")
	h.broadcast([]byte("a"))
	h.broadcast([]byte("b")) // must not block on a full channel
	if got := string(<-ch); got != "b" {
		t.Fatalf("expected latest frame, got %q", got)
	}
}
