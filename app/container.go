package app

import (
	"github.com/longtk26/template-frameworks.git/app/modules/auth"
	"github.com/longtk26/template-frameworks.git/app/modules/database"
	"github.com/longtk26/template-frameworks.git/app/modules/users"
	"github.com/longtk26/template-frameworks.git/configs"
	"go.uber.org/fx"
)

func BuildContainer() *fx.App {
	return fx.New(
		fx.Provide(
			configs.LoadConfig,
			NewGinEngine,
			NewHTTPServer,
			configs.InitLoggerConfig,
		),
		auth.NewAuthModule(),
		users.NewUserModule(),
		database.NewDatabaseModule(),
		fx.Invoke(
			RunHTTPServer,
			configs.InitLoggerConfig,
		),
		fx.NopLogger,
	)
}
