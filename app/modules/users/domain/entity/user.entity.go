package entity

import (
	"github.com/google/uuid"
	"github.com/longtk26/template-frameworks.git/app/modules/auth/dto"
)

type UserEntity struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func NewUserEntityFromSignUpRequestDto(dto dto.SignUpRequestDto) *UserEntity {
	uuid := uuid.New()
	return &UserEntity{
		ID:       uuid.String(),
		Username: dto.Username,
		Email:    dto.Email,
		Password: dto.Password,
	}
}
