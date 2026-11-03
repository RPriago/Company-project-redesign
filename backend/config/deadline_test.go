package config

import (
	"context"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"testing"
)

func TestOperationDeadlinesKeepChainedStatementsUsable(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	sqlDB, _ := db.DB()
	defer sqlDB.Close()
	sqlDB.SetMaxOpenConns(1)
	if err := installOperationDeadlines(db); err != nil {
		t.Fatal(err)
	}
	if err := db.Exec("CREATE TABLE deadline_rows (id integer)").Error; err != nil {
		t.Fatal(err)
	}
	chain := db.WithContext(context.Background()).Table("deadline_rows")
	var total int64
	if err := chain.Count(&total).Error; err != nil {
		t.Fatal(err)
	}
	if err := chain.Create(map[string]any{"id": 1}).Error; err != nil {
		t.Fatal(err)
	}
	var id int
	if err := chain.Select("id").Row().Scan(&id); err != nil {
		t.Fatal(err)
	}
	if id != 1 {
		t.Fatal("row cursor was closed before consumption")
	}
	if err := chain.Count(&total).Error; err != nil {
		t.Fatal(err)
	}
	if total != 1 {
		t.Fatalf("total %d", total)
	}
}
