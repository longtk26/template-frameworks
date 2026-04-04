package internal

import (
	"github.com/gin-gonic/gin"
	"github.com/longtk26/template-frameworks.git/app/middlewares"
	"github.com/longtk26/template-frameworks.git/app/modules/auth/dto"
)

type AuthRouter struct {
	presenter *AuthPresenter
}

func RegisterRoutes(router *gin.Engine, ar *AuthRouter) {
	ar.Register(router)
}

func NewAuthRouter(router *gin.Engine, presenter *AuthPresenter) *AuthRouter {
	return &AuthRouter{presenter: presenter}
}

func (ar *AuthRouter) Register(router *gin.Engine) {
	authGroup := router.Group("api/v1/auth")
	{
		authGroup.POST(
			"/signup",
			middlewares.ValidateRequestBody[dto.SignUpRequestDto](),
			ar.presenter.SignUp,
		)
		authGroup.POST(
			"/signin",
			middlewares.ValidateRequestBody[dto.SignInRequestDto](),
			ar.presenter.SignIn,
		)
	}
}
