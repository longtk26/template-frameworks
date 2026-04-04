package internal

import (
	"github.com/longtk26/template-frameworks.git/app/models"
	"github.com/longtk26/template-frameworks.git/app/modules/users/domain/entity"
)

type UserMapper struct{}

func NewUserMapper() *UserMapper {
	return &UserMapper{}
}

func (m *UserMapper) MapUserEntityToModel(entity *entity.UserEntity) *models.User {
	return &models.User{
		ID:       entity.ID,
		Email:    entity.Email,
		Username: entity.Username,
		Password: entity.Password,
	}
}

func (m *UserMapper) MapUserModelToEntity(model *models.User) *entity.UserEntity {
	return &entity.UserEntity{
		ID:       model.ID,
		Email:    model.Email,
		Username: model.Username,
		Password: model.Password,
	}
}
