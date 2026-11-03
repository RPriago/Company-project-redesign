package controllers

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"net/url"
	"strconv"
	"strings"
	"time"
)

func pagination(c *fiber.Ctx, fallback int) (int, int, error) {
	page, err := strconv.Atoi(c.Query("page", "1"))
	if err != nil || page < 1 || page > 1000000 {
		return 0, 0, fmt.Errorf("invalid page")
	}
	limit, err := strconv.Atoi(c.Query("limit", strconv.Itoa(fallback)))
	if err != nil || limit < 1 || limit > 50 {
		return 0, 0, fmt.Errorf("invalid limit")
	}
	return page, limit, nil
}
func validDate(value string) bool {
	if value == "" {
		return true
	}
	_, err := time.Parse("2006-01-02", value)
	return err == nil
}
func validImageURL(value string) bool {
	if value == "" {
		return true
	}
	if strings.HasPrefix(value, "/uploads/") && !strings.Contains(value, "..") {
		return true
	}
	u, err := url.Parse(value)
	return err == nil && (u.Scheme == "https" || u.Scheme == "http") && u.Host != "" && u.User == nil
}
func validEvent(r CreateEventRequest) bool {
	return len(r.Title) <= 255 && len(r.Slug) <= 255 && len(r.Category) <= 100 && len(r.Location) <= 200 && len(r.ImageURL) <= 500 && len(r.Excerpt) <= 10000 && len(r.Description) <= 500000 && validDate(r.EventDate) && validImageURL(r.ImageURL)
}
func validJob(jTitle, jDepartment, jLocation, jType, jExperience, jDescription, jRequirements, jDeadline string) bool {
	return strings.TrimSpace(jTitle) != "" && strings.TrimSpace(jDepartment) != "" && len(jTitle) <= 255 && len(jDepartment) <= 100 && len(jLocation) <= 150 && len(jType) <= 50 && len(jExperience) <= 100 && len(jDescription) <= 500000 && len(jRequirements) <= 500000 && validDate(jDeadline)
}
