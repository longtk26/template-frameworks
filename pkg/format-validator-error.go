package pkg

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)

type FieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func FormatValidationErrors(err error) []FieldError {
	var errors []FieldError

	if ve, ok := err.(validator.ValidationErrors); ok {
		for _, fe := range ve {
			errors = append(errors, FieldError{
				Field:   fe.Field(),
				Message: mapValidationMessage(fe),
			})
		}
		return errors
	}

	errors = append(errors, FieldError{
		Field:   "body",
		Message: err.Error(),
	})

	return errors
}

func mapValidationMessage(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return "is required"
	case "email":
		return "must be a valid email"
	case "min":
		return fmt.Sprintf("must be at least %s characters", fe.Param())
	case "max":
		return fmt.Sprintf("must be at most %s characters", fe.Param())
	default:
		return fmt.Sprintf("failed on %s validation", fe.Tag())
	}
}
