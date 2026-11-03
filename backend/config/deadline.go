package config

import (
	"context"
	"gorm.io/gorm"
	"time"
)

type operationDeadline struct {
	original context.Context
	cancel   context.CancelFunc
}

// Each statement owns its cancellation function. Restoring the original context
// lets GORM chains execute subsequent statements without reusing a canceled one.
func installOperationDeadlines(db *gorm.DB) error {
	before := func(tx *gorm.DB) {
		original := tx.Statement.Context
		if original == nil {
			original = context.Background()
		}
		ctx, cancel := context.WithTimeout(original, 5*time.Second)
		tx.Statement.Context = ctx
		tx.Statement.Settings.Store("operation_deadline", operationDeadline{original, cancel})
	}
	after := func(tx *gorm.DB) {
		if value, ok := tx.Statement.Settings.LoadAndDelete("operation_deadline"); ok {
			deadline := value.(operationDeadline)
			deadline.cancel()
			tx.Statement.Context = deadline.original
		}
	}
	registrations := []func() error{
		func() error { return db.Callback().Create().Before("*").Register("app:deadline", before) },
		func() error { return db.Callback().Create().After("*").Register("app:deadline_cancel", after) },
		func() error { return db.Callback().Query().Before("*").Register("app:deadline", before) },
		func() error { return db.Callback().Query().After("*").Register("app:deadline_cancel", after) },
		func() error { return db.Callback().Update().Before("*").Register("app:deadline", before) },
		func() error { return db.Callback().Update().After("*").Register("app:deadline_cancel", after) },
		func() error { return db.Callback().Delete().Before("*").Register("app:deadline", before) },
		func() error { return db.Callback().Delete().After("*").Register("app:deadline_cancel", after) },
		func() error { return db.Callback().Raw().Before("*").Register("app:deadline", before) },
		func() error { return db.Callback().Raw().After("*").Register("app:deadline_cancel", after) },
	}
	// Row callbacks hand a live cursor to Scan/Rows. Canceling in the after
	// hook would close that cursor before the caller can consume it, so its
	// cancellation is scheduled at the deadline while the original context is
	// restored immediately for subsequent statements.
	rowBefore := func(tx *gorm.DB) {
		original := tx.Statement.Context
		if original == nil {
			original = context.Background()
		}
		ctx, cancel := context.WithTimeout(original, 5*time.Second)
		time.AfterFunc(5*time.Second, cancel)
		tx.Statement.Settings.Store("row_original_context", original)
		tx.Statement.Context = ctx
	}
	rowAfter := func(tx *gorm.DB) {
		if original, ok := tx.Statement.Settings.LoadAndDelete("row_original_context"); ok {
			tx.Statement.Context = original.(context.Context)
		}
	}
	if err := db.Callback().Row().Before("*").Register("app:row_deadline", rowBefore); err != nil {
		return err
	}
	if err := db.Callback().Row().After("*").Register("app:row_context_restore", rowAfter); err != nil {
		return err
	}
	for _, register := range registrations {
		if err := register(); err != nil {
			return err
		}
	}
	return nil
}
