package models

import "time"

type FuelPrice struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Province      string    `gorm:"size:100;index:idx_prov_fuel,unique;not null" json:"province"`
	Zone          string    `gorm:"size:50;index;not null" json:"zone"` // e.g. "Jawa & Bali", "Sumatera", "Kalimantan", "Sulawesi", "Nusa Tenggara", "Maluku & Papua", "Kawasan Bebas FTZ"
	FuelType      string    `gorm:"size:50;index:idx_prov_fuel,unique;not null" json:"fuel_type"`
	Category      string    `gorm:"size:20;index;not null" json:"category"` // "bensin" | "diesel"
	OctaneCetane  string    `gorm:"size:30" json:"octane_cetane"`
	Color         string    `gorm:"size:20" json:"color"`
	Price         int       `gorm:"not null" json:"price"`
	Unit          string    `gorm:"size:20;default:'liter'" json:"unit"`
	Description   string    `gorm:"size:255" json:"description"`
	IsSubsidized  bool      `gorm:"default:false" json:"is_subsidized"`
	PbbkbRate     string    `gorm:"size:30;default:'5%'" json:"pbbkb_rate"`
	EffectiveDate string    `gorm:"size:50;default:'1 Oktober 2026'" json:"effective_date"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
