package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/Iknite-Space/c4-project-boilerplate/api/db/repo"
	"github.com/gin-gonic/gin"
)

type PrefJson struct {
	AgeRange       string `json:"agerange"`
	Gender         string `json:"gender"`
	Pet            string `json:"pet"`
	LateNights     string `json:"latenights"`
	Smoking        string `json:"smoking"`
	Drinking       string `json:"drinking"`
	Guests         string `json:"guests"`
	NoiseTolerance string `json:"noisetolerance"`
	Religion       string `json:"religion"`
	Occupation     string `json:"occupation"`
}

func (h *UserHandler) handleUserRegistration(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email or password"})
		return
	}
	// Call Firebase REST API to create the user
	payload := map[string]interface{}{
		"email":             req.Email,
		"password":          req.Password,
		"returnSecureToken": true,
	}
	jsonPayload, _ := json.Marshal(payload)
	resp, err := http.Post(
		fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=%s", os.Getenv("FIREBASEAPI_KEY")),
		"application/json",
		bytes.NewBuffer(jsonPayload),
	)

	if err != nil || resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Firebase user"})
		return
	}
	defer resp.Body.Close()

	var fbResp struct {
		IDToken string `json:"idToken"`
		LocalID string `json:"localId"`
		Email   string `json:"email"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&fbResp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding Firebase response"})
		return
	}

	// Store UID and email in your DB
	dbParams := repo.RegisterUserParams{
		UserID: fbResp.LocalID,
		Email:  fbResp.Email,
	}
	user, err := h.querier.RegisterUser(c, dbParams)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user":     user,
		"id_token": fbResp.IDToken, // You can return this so the client can use it for auth
	})

}

func (h *UserHandler) handleUserLogin(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email or password"})
		return
	}
	// Call Firebase REST API to create the user
	payload := map[string]interface{}{
		"email":             req.Email,
		"password":          req.Password,
		"returnSecureToken": true,
	}
	jsonPayload, _ := json.Marshal(payload)
	resp, err := http.Post(
		fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=%s", os.Getenv("FIREBASEAPI_KEY")),
		"application/json",
		bytes.NewBuffer(jsonPayload),
	)

	if err != nil || resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Firebase login failed"})
		return
	}
	defer resp.Body.Close()

	var fbResp struct {
		IDToken string `json:"idToken"`
		LocalID string `json:"localId"`
		Email   string `json:"email"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&fbResp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding Firebase response"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Login successful",
		"id_token": fbResp.IDToken,
		"uid":      fbResp.LocalID,
		"email":    fbResp.Email,
	})

}
func (h *UserHandler) handleCompleteUserProfile(c *gin.Context) {

	firebaseUIDRaw, _ := c.Get("firebase_uid")
	firebaseUID := firebaseUIDRaw.(string)

	// 1. Parse form data
	fname := c.PostForm("fname")
	lname := c.PostForm("lname")
	phoneno := c.PostForm("phoneno")
	birthdateStr := c.PostForm("birthdate")
	birthdate, err := time.Parse("2006-01-02", birthdateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid birthdate format"})
		return
	}
	bio := c.PostForm("bio")
	preferencesStr := c.PostForm("preferences")

	var preferences PrefJson
	err = json.Unmarshal([]byte(preferencesStr), &preferences)
	if err != nil {
		log.Fatalf("Error decoding JSON: %v", err)
	}

	preferencesJSON, err := json.Marshal(preferences)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Handle Profile Picture Upload
	var profilePicture *string
	fileHeader, err := c.FormFile("profile_picture") // Get uploaded file from request
	if err == nil {                                  // Check if file exists
		file, err := fileHeader.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open profile picture"})
			return
		}
		defer file.Close()

		// Save the profile picture using the helper function
		filePath, err := h.service.SaveProfilePicture(file, firebaseUID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save profile picture"})
			fmt.Println("error is here", err)
			return
		}
		profilePicture = &filePath // Store the file path in the request object
	}

	resp := repo.UpdateUserProfileParams{
		UserID:         firebaseUID,
		Fname:          fname,
		Lname:          lname,
		Phoneno:        phoneno,
		Birthdate:      birthdate,
		Bio:            bio,
		Preferences:    preferencesJSON,
		ProfilePicture: profilePicture,
	}

	user, err := h.querier.UpdateUserProfile(c, resp)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}
