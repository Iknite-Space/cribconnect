package api

import (
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"os"
)

type Service struct {
}

func NewService() *Service {
	return &Service{}
}

// Handle Profile Picture Upload
func (s *Service) SaveProfilePicture(file multipart.File, userID string) (string, error) {
	// Define the file path where the image will be stored
	path := fmt.Sprintf("/home/speedy/Desktop/Project Finale/RoommateFinder/api/profilePictures/user_%v.png", userID)

	// Create a new file at the specified path
	outFile, err := os.Create(path)
	if err != nil {
		return "", err // Return an empty string and the error if file creation fails
	}
	defer func() {
		if err := outFile.Close(); err != nil {
			log.Printf("error closing file: %v", err)
		}
	}()

	// Ensure the file is closed after writing

	// Copy the uploaded file's content into the new file
	_, err = io.Copy(outFile, file)
	if err != nil {
		return "", err // Return an empty string and the error if copying fails
	}

	return path, nil // Return the path of the saved image
}
