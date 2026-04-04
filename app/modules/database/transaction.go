package database

import (
	"context"

	"github.com/rs/zerolog"
	"gorm.io/gorm"
)

type txContextKey struct{}

type TransactionStruct struct {
	db     *gorm.DB
	logger zerolog.Logger
}

func NewTransaction(db *gorm.DB, logger zerolog.Logger) *TransactionStruct {
	return &TransactionStruct{db: db, logger: logger}
}

func (ts *TransactionStruct) Execute(ctx context.Context, fc func(ctx context.Context) error) error {
	ts.logger.Info().Msg("Starting transaction")
	tx := ts.db.Begin()
	if err := tx.Error; err != nil {
		ts.logger.Error().Err(err).Msg("Failed to begin transaction")
		return err
	}

	txCtx := context.WithValue(ctx, txContextKey{}, tx)

	defer func() {
		if r := recover(); r != nil {
			ts.logger.Error().Interface("panic", r).Msg("Panic occurred during transaction, rolling back")
			tx.Rollback()
			panic(r)
		}
	}()

	if err := fc(txCtx); err != nil {
		tx.Rollback()
		ts.logger.Error().Err(err).Msg("Failed to execute transaction, rolling back")
		return err
	}

	ts.logger.Info().Msg("Committing transaction")
	return tx.Commit().Error
}

func GetDBFromContext(ctx context.Context, fallback *gorm.DB) *gorm.DB {
	if ctx == nil {
		return fallback
	}

	tx, ok := ctx.Value(txContextKey{}).(*gorm.DB)
	if ok && tx != nil {
		return tx
	}

	return fallback
}
