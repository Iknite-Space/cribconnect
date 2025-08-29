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
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001", "https://cribconnect.xyz", "https://www.cribconnect.xyz"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	// add routes

	r.GET("//healthcheck", h.handleHealthcheck)
	r.POST("/v1/users/register", h.handleUserRegistration)
	r.POST("/v1/users/google-login", h.middleware.FirebaseAuthMiddleware(middleware.InitFirebaseClient()), h.handleGoogleLogin)
	r.PUT("/v1/users/complete-profile", h.middleware.FirebaseAuthMiddleware(middleware.InitFirebaseClient()), h.handleCompleteUserProfile)
	r.POST("/v1/users/login", h.handleUserLogin)
	r.POST("/v1/forgot-password", h.handleForgotPassword)
	r.GET("/v1/user/profile", h.middleware.FirebaseAuthMiddleware(middleware.InitFirebaseClient()), h.handleGetUser)
	r.PUT("/v1/user/profile", h.middleware.FirebaseAuthMiddleware(middleware.InitFirebaseClient()), h.handleUpdateUser)
	r.GET("/v1/users/profiles", h.middleware.FirebaseAuthMiddleware(middleware.InitFirebaseClient()), h.handleGetAllUsers)
	r.POST("/v1/match", h.middleware.FirebaseAuthMiddleware(middleware.InitFirebaseClient()), h.handleCalculateMatch)
	r.POST("/v1/filter", h.middleware.FirebaseAuthMiddleware(middleware.InitFirebaseClient()), h.handleFilterListings)

	r.POST("/v1/users/chats", h.middleware.FirebaseAuthMiddleware(middleware.InitFirebaseClient()), h.handleCreateThread)
	r.POST("/v1/users/payment", h.middleware.FirebaseAuthMiddleware(middleware.InitFirebaseClient()), h.handleCreatePayment)
	r.GET("/v1/user/threads", h.middleware.FirebaseAuthMiddleware(middleware.InitFirebaseClient()), h.handleGetThreadById)
	r.POST("/v1/check-payment", h.handleCheckPaymentstatus)
	r.GET("/v1/threads/:thread_id/messages", h.middleware.FirebaseAuthMiddleware(middleware.InitFirebaseClient()), h.GetMessages)
	r.GET("/v1/user/:user_id/messages", h.serveWs)
	return r
}

func (h *UserHandler) handleHealthcheck(c *gin.Context) {
	c.String(http.StatusOK, "ok")
}
