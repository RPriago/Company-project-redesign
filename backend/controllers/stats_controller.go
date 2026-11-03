package controllers

import (
	"petronesia-backend/config"
	"petronesia-backend/models"

	"github.com/gofiber/fiber/v2"
)

func GetDashboardStats(c *fiber.Ctx) error {
	var totalEvents int64
	var publishedEvents int64
	var draftEvents int64
	var totalMessages int64
	var totalJobs int64
	var activeJobs int64
	var totalContents int64

	config.DB.Model(&models.Event{}).Count(&totalEvents)
	config.DB.Model(&models.Event{}).Where("is_published = ?", true).Count(&publishedEvents)
	config.DB.Model(&models.Event{}).Where("is_published = ?", false).Count(&draftEvents)
	config.DB.Model(&models.ContactMessage{}).Count(&totalMessages)
	config.DB.Model(&models.JobVacancy{}).Count(&totalJobs)
	config.DB.Model(&models.JobVacancy{}).Where("is_active = ?", true).Count(&activeJobs)
	config.DB.Model(&models.SiteContent{}).Count(&totalContents)

	type ViewSum struct {
		TotalViews int `json:"total_views"`
	}
	var viewResult ViewSum
	config.DB.Model(&models.Event{}).Select("COALESCE(SUM(views), 0) as total_views").Scan(&viewResult)

	type CategoryCount struct {
		Category string `json:"category"`
		Count    int    `json:"count"`
	}
	var categoryStats []CategoryCount
	config.DB.Model(&models.Event{}).
		Select("category, count(*) as count").
		Group("category").
		Scan(&categoryStats)

	var recentEvents []models.Event
	config.DB.Order("created_at desc").Limit(5).Find(&recentEvents)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"total_events":     totalEvents,
			"published_events": publishedEvents,
			"draft_events":     draftEvents,
			"total_views":      viewResult.TotalViews,
			"total_messages":   totalMessages,
			"total_jobs":       totalJobs,
			"active_jobs":      activeJobs,
			"total_contents":   totalContents,
			"category_stats":   categoryStats,
			"recent_events":    recentEvents,
		},
	})
}
