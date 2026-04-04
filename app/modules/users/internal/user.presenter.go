package internal

import "github.com/gin-gonic/gin"

type UserPresenter struct {
	uc IUserUseCase
}

func NewUserPresenter(uc IUserUseCase) *UserPresenter {
	return &UserPresenter{uc: uc}
}

func (p *UserPresenter) GetUserByID(c *gin.Context) {
	id := c.Param("id")
	data, err := p.uc.GetUserByID(id)
	if err != nil {
		_ = c.Error(err)
		return
	}
	c.JSON(200, data)
}
