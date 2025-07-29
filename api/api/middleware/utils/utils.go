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

	//

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
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
		PublicID:  publicID,
		Folder:    "profile_pictures",
		Overwrite: api.Bool(true), // overwrite if user re-uploads
	})

	if err != nil {
		return "", fmt.Errorf("error Upload failed")
	}

	fmt.Printf("upload Result %v", uploadResult)

	//  Generate optimized URL
	img, err := cld.Image("profile_pictures/" + publicID)
	if err != nil {
		return "", fmt.Errorf("failed to create image asset: %w", err)
	}

	img.Transformation = "f_auto,q_auto"
	optimizedURL, err := img.String()
	if err != nil {
		return "", fmt.Errorf("failed to generate optimized URL: %v", err)
	}

	//  Respond
	// c.JSON(http.StatusOK, gin.H{
	// 	"uid":          uid,
	// 	"profile_url":  optimizedURL,
	// 	"original_url": uploadResult.SecureURL,
	// })

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
