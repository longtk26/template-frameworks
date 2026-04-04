package database

import (
	"fmt"

	"github.com/longtk26/template-frameworks.git/configs"
	"github.com/rs/zerolog"
	"go.uber.org/fx"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitDatabaseConnection(config *configs.Config, logger zerolog.Logger) *gorm.DB {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		config.Database.Host,
		config.Database.User,
		config.Database.Password,
		config.Database.Name,
		config.Database.Port,
	)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	logger.Info().Msg("Connecting to the database...")
	if err != nil {
		return nil
	}
	return db
}

func NewDatabaseModule() fx.Option {
	return fx.Options(
		fx.Provide(InitDatabaseConnection),
		fx.Provide(NewTransaction),
	)
}
