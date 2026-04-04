package internal

import (
	"context"

	"github.com/longtk26/template-frameworks.git/app/modules/auth/dto"
	"github.com/longtk26/template-frameworks.git/app/modules/database"
	"github.com/longtk26/template-frameworks.git/app/modules/users/domain/entity"
	"github.com/longtk26/template-frameworks.git/app/modules/users/ports"
	"github.com/longtk26/template-frameworks.git/pkg/exceptions"
	libPassword "github.com/longtk26/template-frameworks.git/pkg/passwords"
	"github.com/rs/zerolog"
)

type AuthUseCase struct {
	transaction *database.TransactionStruct
	logger      zerolog.Logger
	us          ports.IUserService
}

func NewAuthUseCase(
	tx *database.TransactionStruct,
	logger zerolog.Logger,
	userService ports.IUserService,
) *AuthUseCase {
	return &AuthUseCase{
		transaction: tx,
		logger:      logger,
		us:          userService,
	}
}

func (uc *AuthUseCase) SignUp(payload dto.SignUpRequestDto) (dto.SignUpResponseDto, error) {
	hashPass, err := libPassword.HashPassword(payload.Password)
	if err != nil {
		uc.logger.Error().Err(err).Msg("Failed to hash password")
		return dto.SignUpResponseDto{}, exceptions.ErrInternalServerError("Failed to hash password", err)
	}

	userEntity := entity.NewUserEntityFromSignUpRequestDto(dto.SignUpRequestDto{
		Username: payload.Username,
		Email:    payload.Email,
		Password: hashPass,
	})

	err = uc.transaction.Execute(context.Background(), func(ctx context.Context) error {
		_, err := uc.us.CreateUser(ctx, userEntity)
		return err
	})

	return dto.SignUpResponseDto{
		AccessToken:  "",
		RefreshToken: "",
	}, err
}

func (uc *AuthUseCase) SignIn() {}
