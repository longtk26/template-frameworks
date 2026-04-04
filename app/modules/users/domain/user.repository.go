package domain

import (
	"context"

	"github.com/longtk26/template-frameworks.git/app/modules/users/domain/entity"
)

type IUserRepository interface {
	CreateUser(ctx context.Context, user *entity.UserEntity) (*entity.UserEntity, error)
	GetUserByID(ctx context.Context, id string) (*entity.UserEntity, error)
	FindByEmail(ctx context.Context, email string) (*entity.UserEntity, error)
}
