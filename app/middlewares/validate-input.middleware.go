package middlewares

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/longtk26/template-frameworks.git/pkg"
)

func ValidateRequestBody[T any]() gin.HandlerFunc {
	return func(c *gin.Context) {
		var obj T
		if err := c.ShouldBindJSON(&obj); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"errors": pkg.FormatValidationErrors(err)})
			c.Abort()
			return
		}
		c.Set("body", obj)
		c.Next()
	}
}

func ValidateQueryParams[T any]() gin.HandlerFunc {
	return func(c *gin.Context) {
		var obj T
		if err := c.ShouldBindQuery(&obj); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"errors": pkg.FormatValidationErrors(err)})
			c.Abort()
			return
		}
		c.Set("query", obj)
		c.Next()
	}
}
