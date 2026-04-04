package internal

import (
	"context"

	"github.com/longtk26/template-frameworks.git/app/modules/users/domain"
	"github.com/longtk26/template-frameworks.git/app/modules/users/domain/entity"
	"github.com/longtk26/template-frameworks.git/app/modules/users/ports"
	"github.com/longtk26/template-frameworks.git/pkg/exceptions"
)

var _ ports.IUserService = &UserService{}

type UserService struct {
	userRepo domain.IUserRepository
}

func NewUserService(userRepo domain.IUserRepository) ports.IUserService {
	return &UserService{
		userRepo: userRepo,
	}
}

func (us *UserService) CreateUser(ctx context.Context, userEntity *entity.UserEntity) (*entity.UserEntity, error) {
	foundUser, err := us.userRepo.FindByEmail(ctx, userEntity.Email)
	if err == nil && foundUser != nil {
		return nil, exceptions.ErrBadRequest("Email already exists", err)
	}

	return us.userRepo.CreateUser(ctx, userEntity)
}
