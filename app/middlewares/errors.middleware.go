package middlewares

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/longtk26/template-frameworks.git/pkg/exceptions"
)

func ErrorMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if len(c.Errors) == 0 {
			return
		}

		err := c.Errors.Last().Err

		var appErr *exceptions.AppError
		if errors.As(err, &appErr) {
			c.JSON(appErr.Status, gin.H{"message": appErr.Message})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"message": "Internal server error"})
	}
}
