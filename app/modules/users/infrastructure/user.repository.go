package infrastructure

import (
	"context"

	"github.com/longtk26/template-frameworks.git/app/models"
	"github.com/longtk26/template-frameworks.git/app/modules/database"
	"github.com/longtk26/template-frameworks.git/app/modules/users/domain"
	"github.com/longtk26/template-frameworks.git/app/modules/users/domain/entity"
	"github.com/longtk26/template-frameworks.git/app/modules/users/internal"
	"github.com/rs/zerolog"
	"gorm.io/gorm"
)

var _ domain.IUserRepository = &UserRepository{}

type UserRepository struct {
	db         *gorm.DB
	userMapper *internal.UserMapper
	logger     zerolog.Logger
}

func NewUserRepository(db *gorm.DB, userMapper *internal.UserMapper, logger zerolog.Logger) domain.IUserRepository {
	return &UserRepository{
		db:         db,
		userMapper: userMapper,
		logger:     logger,
	}
}

func (r *UserRepository) CreateUser(ctx context.Context, user *entity.UserEntity) (*entity.UserEntity, error) {
	userModel := r.userMapper.MapUserEntityToModel(user)
	db := database.GetDBFromContext(ctx, r.db)

	if err := db.Create(&userModel).Error; err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) GetUserByID(ctx context.Context, id string) (*entity.UserEntity, error) {
	var user models.User
	db := database.GetDBFromContext(ctx, r.db)

	if err := db.First(&user, "id = ?", id).Error; err != nil {
		return nil, err
	}
	r.logger.Info().Str("userID", id).Msg("User retrieved from database")
	userEntity := r.userMapper.MapUserModelToEntity(&user)

	return userEntity, nil
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*entity.UserEntity, error) {
	var user models.User
	db := database.GetDBFromContext(ctx, r.db)

	if err := db.First(&user, "email = ?", email).Error; err != nil {
		return nil, err
	}
	r.logger.Info().Str("email", email).Msg("User retrieved from database by email")
	userEntity := r.userMapper.MapUserModelToEntity(&user)

	return userEntity, nil
}
