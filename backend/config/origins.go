package config

import (
	"fmt"
	"net/url"
	"os"
	"strings"
)

func AllowedOrigins() (string, error) {
	production := os.Getenv("APP_ENV") == "production"
	origins := []string{}
	for _, raw := range strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",") {
		raw = strings.TrimSpace(raw)
		if raw == "" {
			continue
		}
		u, err := url.Parse(raw)
		if err != nil || u.Host == "" || u.User != nil || u.RawQuery != "" || u.Fragment != "" || (u.Path != "" && u.Path != "/") || (u.Scheme != "https" && u.Scheme != "http") || strings.Contains(u.Host, "*") {
			return "", fmt.Errorf("ALLOWED_ORIGINS must contain exact HTTP(S) origins")
		}
		if production && u.Scheme != "https" {
			return "", fmt.Errorf("production ALLOWED_ORIGINS must use HTTPS")
		}
		origins = append(origins, u.Scheme+"://"+u.Host)
	}
	if production && len(origins) == 0 {
		return "", fmt.Errorf("ALLOWED_ORIGINS is required in production")
	}
	if !production {
		origins = append(origins, "http://localhost:3000", "http://127.0.0.1:3000")
	}
	return strings.Join(origins, ","), nil
}
