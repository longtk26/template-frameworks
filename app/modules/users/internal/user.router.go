package internal

import "github.com/gin-gonic/gin"

type UserRouter struct {
	presenter *UserPresenter
}

func RegisterRoutes(router *gin.Engine, ur *UserRouter) {
	ur.Register(router)
}

func NewUserRouter(router *gin.Engine, presenter *UserPresenter) *UserRouter {
	return &UserRouter{presenter: presenter}
}

func (ur *UserRouter) Register(router *gin.Engine) {
	userGroup := router.Group("/users")
	{
		userGroup.GET("/:id", ur.presenter.GetUserByID)
	}
}
