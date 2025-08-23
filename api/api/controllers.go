package api

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"firebase.google.com/go/auth"
	"github.com/Iknite-Space/c4-project-boilerplate/api/api/middleware"
	"github.com/Iknite-Space/c4-project-boilerplate/api/api/middleware/utils"
	"github.com/Iknite-Space/c4-project-boilerplate/api/db/repo"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
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

type UserResponse struct {
	UserID         string   `json:"user_id"`
	Fname          string   `json:"fname"`
	Lname          string   `json:"lname"`
	Age            int      `json:"birthdate"`
	Bio            string   `json:"bio"`
	Habbits        PrefJson `json:"habbits"`
	ProfilePicture string   `json:"profilepicture"`
}

var firebaseApikey = utils.LoadEnvSecret("FIREBASEAPI_CONFIG", "FIREBASEAPI_KEY")

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
		fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=%s", firebaseApikey),
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
		IDToken      string `json:"idToken"`
		RefreshToken string `json:"refreshToken"`
		LocalID      string `json:"localId"`
		Email        string `json:"email"`
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
		"user":          user,
		"id_token":      fbResp.IDToken, // You can return this so the client can use it for auth
		"refresh_token": fbResp.RefreshToken,
	})

}

func (h *UserHandler) handleGoogleLogin(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email"})
		return
	}

	// Extract Firebase UID and Email from context
	firebaseUIDRaw, exists := c.Get("firebase_uid")
	if !exists || strings.TrimSpace(firebaseUIDRaw.(string)) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Firebase UID is required"})
		return
	}
	firebaseUID := firebaseUIDRaw.(string)

	firebaseEmailRaw, _ := c.Get("firebase_email")
	firebaseEmail := firebaseEmailRaw.(string)

	// Defensive Firebase user existence check
	if _, err := middleware.InitFirebaseClient().GetUser(c, firebaseUID); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Firebase UID"})
		return
	}

	// Check if user exists in DB
	dbUser, err := h.querier.GetUserByFirebaseId(c, firebaseUID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// New user: register them
			newUserParams := repo.RegisterUserParams{
				UserID: firebaseUID,
				Email:  firebaseEmail,
			}
			if _, regErr := h.querier.RegisterUser(c, newUserParams); regErr != nil {
				log.Println("Registration error:", regErr)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register new user"})
				return
			}
			c.JSON(http.StatusOK, gin.H{
				"user": gin.H{
					"user_id": firebaseUID,
					"email":   firebaseEmail,
				},
				"is_new": true,
			})
			return
		}

		// Unexpected DB error
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database query failed"})
		return
	}

	// Existing user found
	c.JSON(http.StatusOK, gin.H{
		"user":   dbUser,
		"is_new": false,
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
	//FireApiKey := "AIzaSyApDxpa0ialxo6_8xowtTG4TIBSm6AWvgc"
	//  os.Getenv("FIREBASEAPI_KEY")
	// if FireApiKey == "" {
	// 	//log.Println("Missing FIREBASEAPI_KEY")
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Server misconfigured"})
	// 	return
	// }

	// Call Firebase REST API to create the user
	payload := map[string]interface{}{
		"email":             req.Email,
		"password":          req.Password,
		"returnSecureToken": true,
	}
	jsonPayload, _ := json.Marshal(payload)
	resp, err := http.Post(
		fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=%s", firebaseApikey),
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
		IDToken      string `json:"idToken"`
		RefreshToken string `json:"refreshToken"`
		LocalID      string `json:"localId"`
		Email        string `json:"email"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&fbResp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding Firebase response"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Login successful",
		"id_token":      fbResp.IDToken,
		"refresh_token": fbResp.RefreshToken,
		"uid":           fbResp.LocalID,
		"email":         fbResp.Email,
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
		filePath, err := utils.UploadProfilePicture(file, firebaseUID) //h.service.SaveProfilePicture(file, firebaseUID)
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
	var profilePicture string
	fileHeader, err := c.FormFile("profile_picture") // Get uploaded file from request
	if err != nil {
		log.Println("No profile picture uploaded:", err)
	} else { // Check if file exists
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
		filePath, err := utils.UploadProfilePicture(file, firebaseUID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save profile picture"})
			fmt.Println("error is here", err)
			return
		}
		profilePicture = filePath // Store the file path in the request object
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
		ProfilePicture: &profilePicture,
	}

	user, err := h.querier.UpdateUserProfile(c, resp)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)

}

func (h *UserHandler) handleGetAllUsers(c *gin.Context) {
	firebaseUIDRaw, _ := c.Get("firebase_uid")
	if firebaseUIDRaw == " " {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Id is required", "Id": firebaseUIDRaw})
		return
	}

	firebaseUID := firebaseUIDRaw.(string)

	users, err := h.querier.GetAllUsers(c, firebaseUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"Failed to fetch users": err.Error()})
		return
	}

	var formattedUsers []UserResponse

	for _, user := range users {
		var habits PrefJson

		// Check if preferences JSONB is present and valid
		if len(user.Habbits) > 0 {
			err := json.Unmarshal(user.Habbits, &habits)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"Failed to decode habits:": err.Error()})
				return
			}
		} else {
			// Provide default values if preferences are missing
			habits = PrefJson{
				AgeRange:       "unspecified",
				Gender:         "unspecified",
				Pet:            "unspecified",
				LateNights:     "unspecified",
				Smoking:        "unspecified",
				Drinking:       "unspecified",
				Guests:         "unspecified",
				NoiseTolerance: "unspecified",
				Religion:       "unspecified",
				Occupation:     "unspecified",
			}
		}

		formattedUsers = append(formattedUsers, UserResponse{
			UserID:         user.UserID,
			Fname:          utils.SafeString(&user.Fname, "unspecified"),
			Lname:          utils.SafeString(&user.Lname, "unspecified"),
			Age:            utils.CalculateAge(user.Birthdate),
			Bio:            utils.SafeString(&user.Bio, "unspecified"),
			Habbits:        habits,
			ProfilePicture: utils.SafeString(&user.ProfilePicture, "unspecified"),
		})
	}

	c.JSON(http.StatusOK, gin.H{"users": formattedUsers})
}

func (h *UserHandler) handleCalculateMatch(c *gin.Context) {
	firebaseUIDRaw, _ := c.Get("firebase_uid")
	if firebaseUIDRaw == " " {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Id is required", "Id": firebaseUIDRaw})
		return
	}

	firebaseUID := firebaseUIDRaw.(string)
	type MatchRequest struct {
		UserID2 string `json:"userId_2" binding:"required"`
	}

	var req MatchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	habbits1, err := h.querier.GetUserHabbits(c, firebaseUID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User 1 not found"})
		return
	}

	habbits2, err := h.querier.GetUserHabbits(c, req.UserID2)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User 2 not found"})
		return
	}

	var prefs1, prefs2 utils.PrefJson
	if err := json.Unmarshal(habbits1, &prefs1); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parsing user 1 preferences"})
		return
	}
	if err := json.Unmarshal(habbits2, &prefs2); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error parsing user 2 preferences"})
		return
	}

	score, mutual := utils.CalculateMatchScore(prefs1, prefs2)
	category, comment := utils.InterpretScore(score)

	c.JSON(http.StatusOK, gin.H{
		"score":    score,
		"mutal":    mutual,
		"category": category,
		"comment":  comment,
	})
}

func (h *UserHandler) handleFilterListings(c *gin.Context) {
	var filters utils.PrefJson

	if err := c.ShouldBindJSON(&filters); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid filter payload"})
		return
	}

	rawPrefs := utils.CleanPrefs(filters)

	prefsJsonBytes, err := json.Marshal(rawPrefs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal preferences"})
		return
	}
	// Query filtered users based on preferences
	users, err := h.querier.FilterUsersByPreferences(c, prefsJsonBytes)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch filtered users"})
		return
	}

	var formattedUsers []UserResponse
	for _, user := range users {
		var habits PrefJson

		// Check if preferences JSONB is present and valid
		if len(user.Habbits) > 0 {
			err := json.Unmarshal(user.Habbits, &habits)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"Failed to decode habits:": err.Error()})
				return
			}
		} else {
			// Provide default values if preferences are missing
			habits = PrefJson{
				AgeRange:       "unspecified",
				Gender:         "unspecified",
				Pet:            "unspecified",
				LateNights:     "unspecified",
				Smoking:        "unspecified",
				Drinking:       "unspecified",
				Guests:         "unspecified",
				NoiseTolerance: "unspecified",
				Religion:       "unspecified",
				Occupation:     "unspecified",
			}
		}

		formattedUsers = append(formattedUsers, UserResponse{
			UserID:         user.UserID,
			Fname:          utils.SafeString(&user.Fname, "unspecified"),
			Lname:          utils.SafeString(&user.Lname, "unspecified"),
			Age:            utils.CalculateAge(user.Birthdate),
			Bio:            utils.SafeString(&user.Bio, "unspecified"),
			Habbits:        habits,
			ProfilePicture: utils.SafeString(&user.ProfilePicture, "unspecified"),
		})

	}

	c.JSON(http.StatusOK, gin.H{"users": formattedUsers})
}

func (h *UserHandler) handleCreateThread(c *gin.Context) {
	var req struct {
		User_2 string `json:"user_2"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user 2 id"})
		return
	}

	firebaseUIDRaw, exists := c.Get("firebase_uid")
	if !exists || strings.TrimSpace(firebaseUIDRaw.(string)) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Firebase ID is required"})
		return
	}
	firebaseUID := firebaseUIDRaw.(string)

	topic := "Chat"

	checkThread := repo.GetThreadBetweenUsersParams{
		InitiatorID:  firebaseUID,
		TargetUserID: req.User_2,
	}

	// Try to fetch an existing thread
	existingThread, err := h.querier.GetThreadBetweenUsers(c, checkThread)
	if err == nil {
		// Found one – return it immediately
		c.JSON(http.StatusOK, gin.H{"existing thread": existingThread})
		return
	}
	if err != sql.ErrNoRows {
		// Did not find any, create one
		createThread := repo.CreateThreadParams{
			InitiatorID:  firebaseUID,
			TargetUserID: req.User_2,
			Topic:        topic,
		}
		newThread, err := h.querier.CreateThread(c, createThread)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error:" + err.Error()})
			return
		}

		// return new thread
		c.JSON(http.StatusOK, gin.H{
			"new thread": newThread,
		})
		return
	}

	c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error" + err.Error()})

}

type Participant struct {
	ThreadId string    `json:"thread_id"`
	User     repo.User `json:"user"`
	Unlocked bool      `json:"unlocked"`
}

func (h *UserHandler) handleGetThreadById(c *gin.Context) {
	firebaseUIDRaw, exists := c.Get("firebase_uid")
	if !exists || strings.TrimSpace(firebaseUIDRaw.(string)) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Firebase ID is required"})
		return
	}
	firebaseUID := firebaseUIDRaw.(string)

	threads, err := h.querier.GetThreadById(c, firebaseUID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "DB Error" + err.Error()})
		return
	}

	var participants []Participant

	for _, thread := range threads {
		nameOnThread, err := h.querier.GetNamesOnThread(c, thread.ThreadID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "DB Error" + err.Error()})
			return
		}
		for _, name := range nameOnThread {
			participants = append(participants, Participant{
				ThreadId: thread.ThreadID,
				User: repo.User{
					UserID: name.UserID,
					Fname:  name.Fname,
					Lname:  name.Lname,
				},
				Unlocked: thread.IsUnlocked,
			})
		}

	}

	c.JSON(http.StatusOK, gin.H{
		"names": participants,
	})
}

//

func (h *UserHandler) handleCreatePayment(c *gin.Context) {
	var req struct {
		UserId_2 string `json:"userId_2"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user 2 id"})
		return
	}

	firebaseUIDRaw, exists := c.Get("firebase_uid")
	if !exists || strings.TrimSpace(firebaseUIDRaw.(string)) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Firebase ID is required"})
		return
	}
	firebaseUID := firebaseUIDRaw.(string)

	checkThread := repo.GetThreadBetweenUsersParams{
		InitiatorID:  firebaseUID,
		TargetUserID: req.UserId_2,
	}

	var amt pgtype.Numeric
	err := amt.Scan("2")
	if err != nil {
		log.Fatal("Failed to parse amount:", err)
	}
	// Try to fetch an existing thread
	existingThread, err := h.querier.GetThreadBetweenUsers(c, checkThread)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Thread lookup failed: " + err.Error()})
		return
	}

	amount := "2"
	currency := "XAF"
	description := "Roommate messaging"
	ext_ref := existingThread.ThreadID
	redirect_url := "https://cribconnect.xyz/chats"
	failure_redirect_url := "https://cribconnect.xyz/"

	existingPayment, err := h.querier.GetPaymentByThreadId(c, existingThread.ThreadID)

	if err == nil && (existingPayment.Status == "PENDING" || existingPayment.Status == "FAILED") {
		paymentLink := h.campayClient.SendPaymentLink(amount, currency, description, ext_ref, redirect_url, failure_redirect_url)
		c.JSON(http.StatusOK, gin.H{
			"payment":     existingPayment,
			"paymentLink": paymentLink,
		})
		return
	}

	newPaymentRequest := repo.CreatePaymentParams{
		PayerID:           firebaseUID,
		TargetUserID:      req.UserId_2,
		ThreadID:          existingThread.ThreadID,
		Amount:            amt,
		ExternalReference: existingThread.ThreadID,
	}

	newPayment, err := h.querier.CreatePayment(c, newPaymentRequest)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error" + err.Error()})
		return
	}

	paymentLink := h.campayClient.SendPaymentLink(amount, currency, description, ext_ref, redirect_url, failure_redirect_url)

	c.JSON(http.StatusOK, gin.H{
		"payment":     newPayment,
		"paymentLink": paymentLink,
	})
}

var hookKey = utils.LoadEnvSecret("CAMPAY_CONFIG", "CAMPAY_WEBHOOK_KEY")

// var webhookKey = []byte(hookKey)

func (h *UserHandler) handleCheckPaymentstatus(c *gin.Context) {
	log.Printf("Received webhook call from Campay")

	webhook := h.campayClient.CheckWebhook(string(hookKey), c)

	paymentStatus := h.campayClient.CheckPaymentStatus(webhook.Reference)

	paymentToBeUpdated, err := h.querier.GetPaymentByThreadId(c, webhook.ExternalReference)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB Error" + err.Error()})
		return
	}
	log.Println("webhook status", webhook.Status)
	log.Println("payment status", paymentStatus.Status)
	status := repo.PaymentStatus(webhook.Status)
	if webhook.Status == paymentStatus.Status &&
		(status == repo.PaymentStatusSUCCESSFUL ||
			status == repo.PaymentStatusFAILED ||
			status == repo.PaymentStatusPENDING) {

		payment := repo.UpdatePaymentStatusParams{
			PaymentID:         paymentToBeUpdated.PaymentID,
			Status:            status,
			Phone:             &webhook.PhoneNumber,
			Reference:         &paymentStatus.Reference,
			ExternalReference: webhook.OperatorReference,
		}

		updatePayment, err := h.querier.UpdatePaymentStatus(c, payment)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "DB Error" + err.Error()})
			return
		}

		if status == repo.PaymentStatusSUCCESSFUL {
			_, err := h.querier.UpdateThreadStatus(c, repo.UpdateThreadStatusParams{
				IsUnlocked: true,
				ThreadID:   paymentToBeUpdated.ThreadID,
			})
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Thread update failed: " + err.Error()})
				return
			}
			log.Print("thread updated")
		}

		c.JSON(http.StatusOK, gin.H{
			"webhookStatus":  webhook,
			"paymentStatus":  paymentStatus,
			"updatedPayment": updatePayment,
		})

		return
	}
	log.Printf("Webhook status mismatch: webhook=%s, transaction=%s", webhook.Status, paymentStatus.Status)
	c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})

}
