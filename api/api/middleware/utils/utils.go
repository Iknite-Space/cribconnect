package utils

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/smtp"
	"os"
	"sync"
	"time"

	//

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/gorilla/websocket"
)

func LoadEnvSecret(envVarName, field string) string {
	raw := os.Getenv(envVarName)
	if raw == "" {
		log.Fatalf("Missing environment variable: %s", envVarName)
	}

	// Attempt to parse as JSON
	var parsed map[string]string
	err := json.Unmarshal([]byte(raw), &parsed)
	if err == nil {
		val, ok := parsed[field]
		if !ok {
			log.Fatalf("Field %s not found in secret: %s", field, envVarName)
		}
		return val
	}

	// Fallback: assume raw string value if JSON parsing fails
	if field != "" {
		log.Fatalf("Secret %s is raw but expected field '%s'", envVarName, field)
	}
	return raw
}

func UploadProfilePicture(file multipart.File, userID string) (string, error) {
	cloudinaryJSON := LoadEnvSecret("CLOUDINARY_CONFIG", "cloudinary")
	if cloudinaryJSON == "" {
		log.Fatalf("cloudinary config environment variable is missing or empty")
	}
	// ✅ Step 1: Initialize Cloudinary client
	cld, err := cloudinary.NewFromParams("dh1rs2zgb", "795451961929344", cloudinaryJSON)
	if err != nil {
		return "", fmt.Errorf("failed to initialize cloudinary: %w", err)
	}

	if closer, ok := file.(io.Closer); ok {
		defer func() {
			if err := closer.Close(); err != nil {
				log.Printf("error closing file: %v", err)
			}
		}()
	}

	//  Upload to Cloudinary
	publicID := "profile_" + userID // Use UID as identifier

	uploadResult, err := cld.Upload.Upload(context.Background(), file, uploader.UploadParams{
		PublicID:   publicID,
		Folder:     "profile_pictures",
		Overwrite:  api.Bool(true), // overwrite if user re-uploads
		Invalidate: api.Bool(true),
	})

	if err != nil {
		return "", fmt.Errorf("error Upload failed")
	}

	//  Generate optimized URL
	img, err := cld.Image("profile_pictures/" + publicID)
	if err != nil {
		return "", fmt.Errorf("failed to create image asset: %w", err)
	}

	img.Version = uploadResult.Version
	img.Transformation = "f_auto,q_auto"
	optimizedURL, err := img.String()
	if err != nil {
		return "", fmt.Errorf("failed to generate optimized URL: %v", err)
	}

	return optimizedURL, nil
}

func SendEmail(to, subject, resetLink string) error {
	from := "cribconnect358@gmail.com"
	password := LoadEnvSecret("CRIBCONNECT_GMAIL_CONFIG", "CRIBCONNECT_GMAIL_APP_PASSWORD") // 🔐 moved sensitive data to env

	msg := "MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=\"UTF-8\"\r\n" +
		"From: CribConnect <" + from + ">\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n\r\n" +

		`<html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px;">
                <div style="background: #fff; max-width: 600px; margin: auto; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #007bff;">🔑 Forgot Your Password?</h2>
                    <p style="font-size: 16px;">We’ve got you covered! Use the button below to reset your password and get back to finding your perfect roommate.</p>
                    
                    <a href="` + resetLink + `" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    
                    <p style="margin-top: 30px; font-size: 14px; color: #777;">
                        If you didn’t request a password reset, just ignore this email. Your account is still secure.
                    </p>
                    
                    <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
                    
                    <p style="font-size: 12px; color: #aaa;">
                        💌 Sent with care from CribConnect<br>
                        Need help? <a href="mailto:cribconnect358@gmail.com">Contact Support</a>
                    </p>
                </div>
            </body>
        </html>`

	err := smtp.SendMail(
		"smtp.gmail.com:587",
		smtp.PlainAuth("", from, password, "smtp.gmail.com"),
		from,
		[]string{to},
		[]byte(msg),
	)
	return err
}

func CalculateAge(birthdate pgtype.Date) int {
	if !birthdate.Valid {
		return 0 // or any default/fallback
	}

	now := time.Now()
	birth := birthdate.Time

	age := now.Year() - birth.Year()
	if now.YearDay() < birth.YearDay() {
		age-- // hasn't had birthday yet this year
	}

	return age
}

func SafeString(ptr *string, fallback string) string {
	if ptr != nil {
		return *ptr
	}
	return fallback
}

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

func CalculateMatchScore(p1, p2 PrefJson) (int, []string) {
	total := 0
	max := 10
	var common []string

	if p1.AgeRange == p2.AgeRange {
		total += 1
		common = append(common, "Age range")
	}
	if p1.Gender == p2.Gender {
		total += 1
		common = append(common, "Gender")
	}
	if p1.Pet == p2.Pet {
		total += 1
		common = append(common, "Pets friendly")
	}
	if p1.LateNights == p2.LateNights {
		total += 1
		common = append(common, "LateNights")
	}
	if p1.Smoking == p2.Smoking {
		total += 1
		common = append(common, "Smoking")
	}
	if p1.Drinking == p2.Drinking {
		total += 1
		common = append(common, "Drinking")
	}
	if p1.Guests == p2.Guests {
		total += 1
		common = append(common, "Guest policy")
	}
	if p1.NoiseTolerance == p2.NoiseTolerance {
		total += 1
		common = append(common, "Noise Tolerance")
	}
	if p1.Religion == p2.Religion {
		total += 1
		common = append(common, "Religion")
	}
	if p1.Occupation == p2.Occupation {
		total += 1
		common = append(common, "Occupation")
	}

	score := int((float64(total) / float64(max)) * 100)
	return score, common
}

func InterpretScore(score int) (string, string) {
	switch {
	case score >= 80:
		return "Excellent", "You're aligned on core lifestyle values."
	case score >= 60:
		return "Very Good", "Good compatibility across key areas."
	case score >= 40:
		return "Good", "Some lifestyle overlap, but some friction points."
	case score >= 20:
		return "Fair", "Your preferences are fairly different."
	default:
		return "Poor", "You're night and day but maybe opposites attract?"
	}
}

func CleanPrefs(prefs PrefJson) map[string]string {
	cleaned := make(map[string]string)

	if prefs.AgeRange != "" {
		cleaned["agerange"] = prefs.AgeRange
	}
	if prefs.Gender != "" {
		cleaned["gender"] = prefs.Gender
	}
	if prefs.Pet != "" {
		cleaned["pet"] = prefs.Pet
	}
	if prefs.LateNights != "" {
		cleaned["latenights"] = prefs.LateNights
	}
	if prefs.Smoking != "" {
		cleaned["smoking"] = prefs.Smoking
	}
	if prefs.Drinking != "" {
		cleaned["drinking"] = prefs.Drinking
	}
	if prefs.Guests != "" {
		cleaned["guests"] = prefs.Guests
	}
	if prefs.NoiseTolerance != "" {
		cleaned["noisetolerance"] = prefs.NoiseTolerance
	}
	if prefs.Religion != "" {
		cleaned["religion"] = prefs.Religion
	}
	if prefs.Occupation != "" {
		cleaned["occupation"] = prefs.Occupation
	}

	return cleaned
}

type ConnectionManager struct {
	mu          sync.RWMutex
	connections map[string]*websocket.Conn // userID → ws
}

func NewManager() *ConnectionManager {
	return &ConnectionManager{connections: make(map[string]*websocket.Conn)}
}

func (m *ConnectionManager) Add(userID string, conn *websocket.Conn) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.connections[userID] = conn
}

func (m *ConnectionManager) Remove(userID string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.connections, userID)
}

func (m *ConnectionManager) Send(to string, msg interface{}) error {
	m.mu.RLock()
	defer m.mu.RUnlock()
	conn, ok := m.connections[to]
	if !ok {
		return fmt.Errorf("user offline")
	}
	return conn.WriteJSON(msg)
}
