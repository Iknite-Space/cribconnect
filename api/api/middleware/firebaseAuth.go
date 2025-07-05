package middleware

import (
	"context"
	"log"
	"net/http"
	"strings"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"github.com/gin-gonic/gin"
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

func (m *Middleware) InitFirebaseClient() *auth.Client {
	// added
	if firebaseClient != nil {
		return firebaseClient
	}
	// added

	opt := option.WithCredentialsFile("/home/speedy/Desktop/Roommate_Finder/cribconnect/api/api/middleware/roommate-finder-6f8ef-firebase-adminsdk-fbsvc-463d6d62c8.json")

	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		log.Fatalf("error initializing firebase app: %v\n", err)
	}

	client, err := app.Auth(context.Background())
	if err != nil {
		log.Fatalf("error initializing firebase auth client: %v\n", err)
	}

	return client
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
