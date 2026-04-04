package app

import (
	"context"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/longtk26/template-frameworks.git/app/middlewares"
	"github.com/longtk26/template-frameworks.git/configs"
	"github.com/rs/zerolog"
	"go.uber.org/fx"
)

type App struct {
	fxApp *fx.App
}

func NewApp() *App {
	return &App{
		fxApp: BuildContainer(),
	}
}

func (a *App) Run() {
	a.fxApp.Run()
}

func NewGinEngine() *gin.Engine {
	gin := gin.Default()
	gin.Use(middlewares.ErrorMiddleware())
	gin.Use(middlewares.RateLimitMiddleware())
	return gin
}

func NewHTTPServer(config *configs.Config, engine *gin.Engine, logger zerolog.Logger) *http.Server {
	logger.Info().Msg(fmt.Sprintf("Starting server on port %s...", config.Server.Port))
	return &http.Server{
		Addr:    ":" + config.Server.Port,
		Handler: engine,
	}
}

func RunHTTPServer(lifecycle fx.Lifecycle, server *http.Server) {
	lifecycle.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			go func() {
				_ = server.ListenAndServe()
			}()
			return nil
		},
		OnStop: func(ctx context.Context) error {
			return server.Shutdown(ctx)
		},
	})
}
