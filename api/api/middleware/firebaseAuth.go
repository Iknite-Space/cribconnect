package middleware

import (
	"context"
	"log"
	"net/http"
	"strings"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
)

type Middleware struct {
}

func NewMiddleware() *Middleware {
	return &Middleware{}
}

// added
var firebaseClient *auth.Client

// added

func InitFirebaseClient() *auth.Client {
	// added
	if firebaseClient != nil {
		return firebaseClient
	}

	opt := option.WithCredentials(&google.Credentials{})

	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		log.Fatalf("error initializing firebase app: %v\n", err)
	}

	client, err := app.Auth(context.Background())
	if err != nil {
		log.Fatalf("error initializing firebase auth client: %v\n", err)
	}

	firebaseClient = client
	return firebaseClient
}

func (m *Middleware) FirebaseAuthMiddleware(client *auth.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
			return
		}

		idToken := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := client.VerifyIDToken(c.Request.Context(), idToken)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		// Store UID in context for use in handler
		c.Set("firebase_uid", token.UID)
		c.Set("firebase_email", token.Claims["email"])
		c.Next()
	}
}
