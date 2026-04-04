package auth

import (
	authInternal "github.com/longtk26/template-frameworks.git/app/modules/auth/internal"
	"go.uber.org/fx"
)

func NewAuthModule() fx.Option {
	return fx.Options(
		fx.Provide(
			authInternal.NewAuthRouter,
			authInternal.NewAuthPresenter,
			authInternal.NewAuthUseCase,
		),
		fx.Invoke(
			authInternal.RegisterRoutes,
		),
	)
}
