// Description: This layer captures the http call from the frontend or anywhere

package messages

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type MessageHandler struct {
	messageService		*MessageService
}

func NewMessageHandler(ms *MessageService) *MessageHandler{
		handler := &MessageHandler{
		messageService: ms,
	}
	return handler
}

func (mh *MessageHandler)WireRoutes(e *gin.Engine) *gin.Engine{
	 e.POST("/message", mh.handleCreateMessage)
	 e.DELETE("/message/:id", mh.handleDeleteMessage)
	 e.GET("/thread/:id/messages", mh.handleGetThreadMessages)

	 return e
}

type CreateMessageRequest struct {
		ThreadID    		string 		`json:"thread_id" binding:"required"`
		SenderID    		string 		`json:"sender_id" binding:"required"`
		ReceiverID    	string 	`json:"receiver_id" binding:"required"`
		MessageText 		string 		`json:"message_text" binding:"required"`
	}

func (mh *MessageHandler) handleCreateMessage(c *gin.Context) {
	req := CreateMessageRequest{} 
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid message request"})
		return
	}
	message, err := mh.messageService.CreateMessage(c, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	c.JSON(http.StatusOK, message)
}

func (mh *MessageHandler) handleGetThreadMessages(c *gin.Context) {
	thread_id := c.Param("id")
	message, err := mh.messageService.GetThreadMessages(c, thread_id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	c.JSON(http.StatusOK, message)
	
}

func (mh *MessageHandler) handleDeleteMessage(c *gin.Context) {
	message_id := c.Param("id")
	 err := mh.messageService.DeleteMessage(c, message_id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	c.JSON(http.StatusOK, "Message deleted")
}