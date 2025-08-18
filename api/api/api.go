package api

import (
	"github.com/Iknite-Space/c4-project-boilerplate/api/api/middleware"
	"github.com/Iknite-Space/c4-project-boilerplate/api/db/repo"
	"github.com/Iknite-Space/c4-project-boilerplate/api/payment"
)

type UserHandler struct {
	querier      repo.Querier
	service      *Service
	middleware   *middleware.Middleware
	campayClient *payment.Requests
}

func NewControllerHandler(querier repo.Querier, service *Service, middleware *middleware.Middleware, campayClient *payment.Requests) *UserHandler {
	handler := &UserHandler{
		querier:      querier,
		service:      service,
		middleware:   middleware,
		campayClient: campayClient,
	}
	return handler
}

// func (h *UserHandler) handleCreateMessage(c *gin.Context) {
// 	var req repo.CreateMessageParams
// 	err := c.ShouldBindBodyWithJSON(&req)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	message, err := h.querier.CreateMessage(c, req)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}

// 	c.JSON(http.StatusOK, message)
// }

// func (h *UserHandler) handleGetMessage(c *gin.Context) {
// 	id := c.Param("id")
// 	if id == "" {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
// 		return
// 	}

// 	message, err := h.querier.GetMessageByID(c, id)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}

// 	c.JSON(http.StatusOK, message)
// }

// func (h *UserHandler) handleGetThreadMessages(c *gin.Context) {
// 	id := c.Param("id")
// 	if id == "" {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
// 		return
// 	}

// 	messages, err := h.querier.GetMessagesByThread(c, id)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{
// 		"thread":   id,
// 		"topic":    "example",
// 		"messages": messages,
// 	})
// }

// func (h *UserHandler) handleDeleteMessage(c *gin.Context) {
// 	id := c.Param("id")
// 	if id == "" {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "id is required"})
// 		return
// 	}

// 	err := h.querier.DeleteMessage(c, id)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 		return
// 	}

// 	c.JSON(http.StatusOK, "ok")
// }
