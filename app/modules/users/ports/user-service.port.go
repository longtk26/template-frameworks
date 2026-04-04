package ports

import (
	"context"

	"github.com/longtk26/template-frameworks.git/app/modules/users/domain/entity"
)

type IUserService interface {
	CreateUser(ctx context.Context, userEntity *entity.UserEntity) (*entity.UserEntity, error)
}
