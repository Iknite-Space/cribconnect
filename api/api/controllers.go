package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"firebase.google.com/go/auth"
	"github.com/Iknite-Space/c4-project-boilerplate/api/api/middleware"
	"github.com/Iknite-Space/c4-project-boilerplate/api/api/middleware/utils"
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

	// Ensures FIREBASEAPI_KEY is present
	FireApiKey := os.Getenv("FIREBASEAPI_KEY")
	if FireApiKey == "" {
		//log.Println("Missing FIREBASEAPI_KEY")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Server misconfigured"})
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
		fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=%s", FireApiKey),
		"application/json",
		bytes.NewBuffer(jsonPayload),
	)

	if err != nil || resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Firebase user"})
		return
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			// You can log this or handle it gracefully
			log.Printf("error closing response body: %v", err)
		}
	}()

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

	// Ensures FIREBASEAPI_KEY is present
	FireApiKey := os.Getenv("FIREBASEAPI_KEY")
	if FireApiKey == "" {
		//log.Println("Missing FIREBASEAPI_KEY")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Server misconfigured"})
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
		fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=%s", FireApiKey),
		"application/json",
		bytes.NewBuffer(jsonPayload),
	)

	if err != nil || resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Firebase login failed"})
		return
	}
	defer func() {
		if err := resp.Body.Close(); err != nil {
			// You can log this or handle it gracefully
			log.Printf("error closing response body: %v", err)
		}
	}()

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

	firebaseUIDRaw, exists := c.Get("firebase_uid")
	if !exists || strings.TrimSpace(firebaseUIDRaw.(string)) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Firebase ID is required"})
		return
	}
	firebaseUID := firebaseUIDRaw.(string)

	firebaseEmailRaw, _ := c.Get("firebase_email")
	firebaseEmail := firebaseEmailRaw.(string)

	// 1. Parse form data
	fname := c.PostForm("fname")
	lname := c.PostForm("lname")
	phoneno := c.PostForm("phoneno")
	// Validate birthdate format
	birthdateStr := c.PostForm("birthdate")
	birthdate, err := time.Parse("2006-01-02", birthdateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid birthdate format"})
		return
	}
	bio := c.PostForm("bio")
	//Parse JSON for habbits
	habbitsStr := c.PostForm("habbits")

	var habbits PrefJson
	err = json.Unmarshal([]byte(habbitsStr), &habbits)
	if err != nil {
		log.Fatalf("Error decoding JSON: %v", err)
	}

	habbitsJSON, err := json.Marshal(habbits)
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
		defer func() {
			if err := file.Close(); err != nil {
				log.Printf("error closing file: %v", err)
			}
		}()

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
		Fname:          &fname,
		Lname:          &lname,
		Email:          firebaseEmail,
		Phoneno:        &phoneno,
		Birthdate:      birthdate,
		Bio:            bio,
		Habbits:        habbitsJSON,
		ProfilePicture: profilePicture,
	}

	user, err := h.querier.UpdateUserProfile(c, resp)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) handleForgotPassword(c *gin.Context) {
	var request struct {
		Email string `json:"email" binding:"required,email"`
	}

	if err := c.ShouldBindJSON(&request); err != nil || request.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or missing email"})
		return
	}

	// Generate reset link using Firebase Admin SDK
	link, err := middleware.InitFirebaseClient().PasswordResetLink(c.Request.Context(), request.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate reset link"})
		return
	}

	// Send email with your email service
	err = utils.SendEmail(request.Email, "Password Reset Resquest", link)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password reset email sent"})

}

func (h *UserHandler) handleGetUser(c *gin.Context) {
	firebaseUIDRaw, _ := c.Get("firebase_uid")
	if firebaseUIDRaw == " " {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Id is required", "Id": firebaseUIDRaw})
		return
	}

	firebaseUID := firebaseUIDRaw.(string)

	user, errs := h.querier.GetUserById(c, firebaseUID)
	if errs != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": errs.Error()})
		return
	}

	// Parse habbits JSON to struct (optional)
	var habbits PrefJson
	err := json.Unmarshal(user.Habbits, &habbits)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Failed to decode habbits:": err.Error()})

	}

	response := gin.H{
		"fname":          user.Fname,
		"lname":          user.Lname,
		"email":          user.Email,
		"phoneno":        user.Phoneno,
		"birthdate":      user.Birthdate,
		"bio":            user.Bio,
		"habbits":        habbits,
		"profilepicture": user.ProfilePicture,
	}
	c.JSON(http.StatusOK, response) //gin.H{"User": response}

}

func (h *UserHandler) handleUpdateUser(c *gin.Context) {
	firebaseUIDRaw, exists := c.Get("firebase_uid")
	if !exists || strings.TrimSpace(firebaseUIDRaw.(string)) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Firebase ID is required"})
		return
	}
	firebaseUID := firebaseUIDRaw.(string)

	// 🧹 Parse multipart form
	if err := c.Request.ParseMultipartForm(32 << 20); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form data", "details": err.Error()})
		return
	}

	// 1. Parse form data
	fname := c.PostForm("fname")
	lname := c.PostForm("lname")
	email := c.PostForm("email")
	phoneno := c.PostForm("phoneno")
	birthdateStr := c.PostForm("birthdate")
	birthdate, err := time.Parse("2006-01-02", birthdateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid birthdate format"})
		return
	}
	bio := c.PostForm("bio")

	habbitsStr := c.Request.FormValue("habbits")
	if strings.TrimSpace(habbitsStr) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Habits JSON is missing"})
		return
	}
	// Use Firebase Admin SDK to update the user's email
	params := (&auth.UserToUpdate{}).Email(email)
	_, err = middleware.InitFirebaseClient().UpdateUser(c.Request.Context(), firebaseUID, params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	var habbits PrefJson
	if err := json.Unmarshal([]byte(habbitsStr), &habbits); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON", "details": err.Error()})
		return
	}

	habbitsJSON, err := json.Marshal(habbits)
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
		defer func() {
			if err := file.Close(); err != nil {
				log.Printf("error closing file: %v", err)
			}
		}()

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
		Fname:          &fname,
		Lname:          &lname,
		Email:          email,
		Phoneno:        &phoneno,
		Birthdate:      birthdate,
		Bio:            bio,
		Habbits:        habbitsJSON,
		ProfilePicture: profilePicture,
	}

	user, err := h.querier.UpdateUserProfile(c, resp)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)

}
