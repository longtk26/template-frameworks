package pkg

import "github.com/gin-gonic/gin"

func MustGetBody[T any](c *gin.Context) T {
	value, exists := c.Get("body")
	if !exists {
		panic("body not found in context")
	}

	dto, ok := value.(T)
	if !ok {
		panic("invalid body type")
	}

	return dto
}

func GetQuery[T any](c *gin.Context) (T, bool) {
	value, exists := c.Get("query")
	if !exists {
		var zero T
		return zero, false
	}

	dto, ok := value.(T)
	if !ok {
		var zero T
		return zero, false
	}

	return dto, true
}
