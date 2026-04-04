package exceptions

import "net/http"

var (
	ErrBadRequest = func(message string, err error) *AppError {
		return NewException(http.StatusBadRequest, "BAD_REQUEST", message, err)
	}
	ErrInternalServerError = func(message string, err error) *AppError {
		return NewException(http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", message, err)
	}
	ErrNotFound = func(message string, err error) *AppError {
		return NewException(http.StatusNotFound, "NOT_FOUND", message, err)
	}
	ErrForbidden = func(message string, err error) *AppError {
		return NewException(http.StatusForbidden, "FORBIDDEN", message, err)
	}
)

type AppError struct {
	Message string `json:"message"`
	Status  int    `json:"status"`
	Code    string `json:"code"`
	Err     error  `json:"-"`
}

func NewException(status int, code string, message string, err error) *AppError {
	return &AppError{
		Status:  status,
		Code:    code,
		Message: message,
		Err:     err,
	}
}

func (e *AppError) Error() string {
	return e.Message
}
