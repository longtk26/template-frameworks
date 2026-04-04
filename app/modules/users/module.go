package users

import (
	"github.com/longtk26/template-frameworks.git/app/modules/users/infrastructure"
	usersInternal "github.com/longtk26/template-frameworks.git/app/modules/users/internal"
	"go.uber.org/fx"
)

func NewUserModule() fx.Option {
	return fx.Options(
		fx.Provide(
			usersInternal.NewUserRouter,
			usersInternal.NewUserPresenter,
			usersInternal.NewUserUseCase,
			usersInternal.NewUserService,
			infrastructure.NewUserRepository,
			usersInternal.NewUserMapper,
		),
		fx.Invoke(
			usersInternal.RegisterRoutes,
		),
	)
}
