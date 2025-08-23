package payment

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
)

type CampayWebhookPayload struct {
	Status            string `json:"status"`
	Reference         string `json:"reference"`
	Amount            string `json:"amount"`
	Currency          string `json:"currency"`
	Operator          string `json:"operator"`
	Code              string `json:"code"`
	OperatorReference string `json:"operator_reference"`
	Signature         string `json:"signature"`
	Endpoint          string `json:"endpoint"`
	ExternalReference string `json:"external_reference"`
	ExternalUser      string `json:"external_user"`
	ExtraFirstName    string `json:"extra_first_name"`
	ExtraLastName     string `json:"extra_last_name"`
	ExtraEmail        string `json:"extra_email"`
	PhoneNumber       string `json:"phone_number"`
}

// struct type to hold output
type Status struct {
	Reference          string `json:"reference"`
	Ext_ref            string `json:"external_reference"`
	Status             string `json:"status"`
	Amount             string `json:"amount"`
	Currency           string `json:"currency"`
	Operator           string `json:"operator"`
	Code               string `json:"code"`
	Operator_Reference string `json:"operator_reference"`
	Description        string `json:"description"`
	Exterbal_User      string `json:"external_user"`
	Reason             string `json:"reason"`
	Phone_Number       string `json:"phone_number"`
}

func (clients *Requests) CheckWebhook(webhookKey string, c *gin.Context) CampayWebhookPayload {
	// payload := CampayWebhookPayload{
	// 	Status:            c.Query("status"),
	// 	Reference:         c.Query("reference"),
	// 	Amount:            c.Query("amount"),
	// 	Currency:          c.Query("currency"),
	// 	Operator:          c.Query("operator"),
	// 	Code:              c.Query("code"),
	// 	OperatorReference: c.Query("operator_reference"),
	// 	Signature:         c.Query("signature"),
	// 	Endpoint:          c.Query("endpoint"),
	// 	ExternalReference: c.Query("external_reference"),
	// 	ExternalUser:      c.Query("external_user"),
	// 	ExtraFirstName:    c.Query("extra_first_name"),
	// 	ExtraLastName:     c.Query("extra_last_name"),
	// 	ExtraEmail:        c.Query("extra_email"),
	// 	PhoneNumber:       c.Query("phone_number"),
	// }
	var payload CampayWebhookPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		log.Println("Failed to bind JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON", "details": err.Error()})
		return CampayWebhookPayload{}
	}

	log.Printf("Webhook payload: %+v", payload)
	log.Printf("Headers: %v", c.Request.Header)
	log.Printf("Webhook key: %+v", webhookKey)

	// Verify JWT signature
	// claims := jwt.MapClaims{}
	token, err := jwt.Parse(payload.Signature, func(token *jwt.Token) (any, error) {
		// Ensure the signing method is HMAC
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(webhookKey), nil
	})

	if err != nil || !token.Valid {
		log.Println("Invalid signature", err)
		c.JSON(http.StatusForbidden, gin.H{"error": "Invalid signature", "details": err.Error()})
		return CampayWebhookPayload{}
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		log.Println("Verified token claims:", claims)
	}

	c.JSON(http.StatusOK, gin.H{"status": "Payload received"})
	return payload
}

// Initiating request to get the status of the transaction
func (clients *Requests) CheckPaymentStatus(reference string) Status {

	url := fmt.Sprintf(clients.baseUrl+"api/transaction/%s", reference)
	responsebody, err := clients.makeHttpRequest("GET", url, nil)

	if err != nil {
		fmt.Println("Invalid Request, check get request credentials")
		log.Println(err)
	}

	var checkState Status
	if err := json.NewDecoder(bytes.NewBuffer(responsebody)).Decode((&checkState)); err != nil {
		log.Println(err)
	}
	return checkState

}

func (clients *Requests) makeHttpRequest(method string, url string, body io.Reader) ([]byte, error) {
	req, err := http.NewRequest(method, url, body)

	if err != nil {
		fmt.Println("Check GET request credentials")
		log.Println(err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Token %s", clients.apikey))
	req.Header.Add("Content-Type", "application/json")

	response, err := http.DefaultClient.Do(req)

	if err != nil {
		fmt.Println("Invalid Request, check post request credentials")
		log.Println(err)
	}
	defer func() {
		if err := response.Body.Close(); err != nil {
			log.Println(err)
		}
	}()

	responsebody, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err

	}
	return responsebody, nil

}
