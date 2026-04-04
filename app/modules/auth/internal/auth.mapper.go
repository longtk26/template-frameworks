package internal

import (
	"github.com/google/uuid"
	"github.com/longtk26/template-frameworks.git/app/modules/auth/dto"
	"github.com/longtk26/template-frameworks.git/app/modules/users/domain/entity"
)

type AuthMapper struct{}

func NewAuthMapper() *AuthMapper {
	return &AuthMapper{}
}

func (m *AuthMapper) MapSignUpRequestDtoToUserEntity(dto dto.SignUpRequestDto) *entity.UserEntity {
	uuid := uuid.New().String()
	return &entity.UserEntity{
		ID:       uuid,
		Email:    dto.Email,
		Username: dto.Username,
		Password: dto.Password,
	}
}
