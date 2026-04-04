package middlewares

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

var (
	DEFAULT_BURST_SIZE     int        = 1   // number of requests allowed to burst
	DEFAULT_RATE_LIMIT     rate.Limit = 100 // requests per seconds
	SHORT_TERM_RATE_LIMIT  rate.Limit = 10
	MEDIUM_TERM_RATE_LIMIT rate.Limit = 1
	LONG_TERM_RATE_LIMIT   rate.Limit = 200
)

func enforceRateLimit(c *gin.Context, limiter *rate.Limiter) bool {
	allowed := limiter.Allow()
	if !allowed {
		c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"message": "Too many requests"})
		return false
	}

	return true
}

func RateLimitMiddleware() gin.HandlerFunc {
	limiter := rate.NewLimiter(DEFAULT_RATE_LIMIT, DEFAULT_BURST_SIZE)
	return func(c *gin.Context) {
		if !enforceRateLimit(c, limiter) {
			return
		}

		c.Next()
	}
}

func ShortTermRateLimitMiddleware() gin.HandlerFunc {
	limiter := rate.NewLimiter(SHORT_TERM_RATE_LIMIT, DEFAULT_BURST_SIZE)
	return func(c *gin.Context) {
		if !enforceRateLimit(c, limiter) {
			return
		}

		c.Next()
	}
}

func MediumTermRateLimitMiddleware() gin.HandlerFunc {
	limiter := rate.NewLimiter(MEDIUM_TERM_RATE_LIMIT, DEFAULT_BURST_SIZE)

	return func(c *gin.Context) {
		if !enforceRateLimit(c, limiter) {
			return
		}

		c.Next()
	}
}

func LongTermRateLimitMiddleware() gin.HandlerFunc {
	limiter := rate.NewLimiter(LONG_TERM_RATE_LIMIT, DEFAULT_BURST_SIZE)
	return func(c *gin.Context) {
		if !enforceRateLimit(c, limiter) {
			return
		}

		c.Next()
	}
}
