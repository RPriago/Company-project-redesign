package controllers

import (
	"github.com/gofiber/fiber/v2"
	"petronesia-backend/config"
	"petronesia-backend/models"
)

func GetDashboardStats(c *fiber.Ctx) error {
	// Scalar subqueries keep this portable across SQLite and PostgreSQL and use
	// boolean predicates rather than database-specific numeric boolean casts.
	var counts struct {
		TotalEvents     int64
		PublishedEvents int64
		TotalMessages   int64
		TotalJobs       int64
		ActiveJobs      int64
		TotalContents   int64
	}
	err := config.DB.Raw(`SELECT
 (SELECT COUNT(*) FROM events) AS total_events,
 (SELECT COUNT(*) FROM events WHERE is_published = ?) AS published_events,
 (SELECT COUNT(*) FROM contact_messages) AS total_messages,
 (SELECT COUNT(*) FROM job_vacancies) AS total_jobs,
 (SELECT COUNT(*) FROM job_vacancies WHERE is_active = ?) AS active_jobs,
 (SELECT COUNT(*) FROM site_contents) AS total_contents`, true, true).Scan(&counts).Error
	if err != nil {
		return databaseFailure(c)
	}
	type CategoryCount struct {
		Category string `json:"category"`
		Count    int64  `json:"count"`
	}
	var categories []CategoryCount
	if err := config.DB.Model(&models.Event{}).Select("category, count(*) as count").Group("category").Scan(&categories).Error; err != nil {
		return databaseFailure(c)
	}
	var recent []models.Event
	if err := config.DB.Order("created_at desc").Limit(5).Find(&recent).Error; err != nil {
		return databaseFailure(c)
	}
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"total_events": counts.TotalEvents, "published_events": counts.PublishedEvents, "draft_events": counts.TotalEvents - counts.PublishedEvents, "total_messages": counts.TotalMessages, "total_jobs": counts.TotalJobs, "active_jobs": counts.ActiveJobs, "total_contents": counts.TotalContents, "category_stats": categories, "recent_events": recent}})
}
