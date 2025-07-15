package api

import (
	"net/http"

	"github.com/Iknite-Space/c4-project-boilerplate/api/api/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func (h *UserHandler) WireHttpHandler() http.Handler {

	r := gin.Default()
	r.Use(gin.CustomRecovery(func(c *gin.Context, _ any) {
		c.String(http.StatusInternalServerError, "Internal Server Error: panic")
		c.AbortWithStatus(http.StatusInternalServerError)
	}))
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3001"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	// add routes

	r.GET("//healthcheck", h.handleHealthcheck)
	r.POST("/users/register", h.handleUserRegistration)
	r.PUT("/users/complete-profile", h.middleware.FirebaseAuthMiddleware(middleware.InitFirebaseClient()), h.handleCompleteUserProfile)
	r.POST("/users/login", h.handleUserLogin)
	r.POST("/forgot-password", h.handleForgotPassword)
	r.GET("/user/profile", h.middleware.FirebaseAuthMiddleware(middleware.InitFirebaseClient()), h.handleGetUser)
	// r.POST("/message", h.handleCreateMessage)
	// r.GET("/message/:id", h.handleGetMessage)
	// r.DELETE("/message/:id", h.handleDeleteMessage)
	// r.GET("/thread/:id/messages", h.handleGetThreadMessages)

	return r
}

func (h *UserHandler) handleHealthcheck(c *gin.Context) {
	c.String(http.StatusOK, "ok")
}
