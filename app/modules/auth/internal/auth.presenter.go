package internal

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/longtk26/template-frameworks.git/app/modules/auth/dto"
	"github.com/longtk26/template-frameworks.git/pkg"
)

type AuthPresenter struct {
	us *AuthUseCase
}

func NewAuthPresenter(us *AuthUseCase) *AuthPresenter {
	return &AuthPresenter{us: us}
}

func (p *AuthPresenter) SignUp(c *gin.Context) {
	req := pkg.MustGetBody[dto.SignUpRequestDto](c)

	response, err := p.us.SignUp(req)
	if err != nil {
		_ = c.Error(err)
		return
	}

	c.JSON(http.StatusOK, response)
}

func (p *AuthPresenter) SignIn(c *gin.Context) {}
