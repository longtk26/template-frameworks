package internal

import (
	"context"

	"github.com/longtk26/template-frameworks.git/app/modules/users/domain"
	"github.com/rs/zerolog"
)

var _ IUserUseCase = &UserUseCase{}

type IUserUseCase interface {
	GetUserByID(id string) (string, error)
}

type UserUseCase struct {
	userRepo domain.IUserRepository
	logger   zerolog.Logger
}

func NewUserUseCase(userRepo domain.IUserRepository, logger zerolog.Logger) IUserUseCase {
	return &UserUseCase{
		userRepo: userRepo,
		logger:   logger,
	}
}

func (u *UserUseCase) GetUserByID(id string) (string, error) {
	// Mock implementation, replace with actual logic
	user, err := u.userRepo.GetUserByID(context.Background(), id)
	if err != nil {
		return "", err
	}
	if user != nil {
		u.logger.Info().Str("userID", id).Msg("User found")
		return user.Email, nil
	}
	return "User " + id, nil
}
