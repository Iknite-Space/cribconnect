package payment

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
)

type PaymentRequest struct {
	Amount               string `json:"amount"`
	Currency             string `json:"currency"`
	Description          string `json:"description"`
	External_reference   string `json:"external_reference"`
	RedirectUrl          string `json:"redirect_url"`
	Failure_redirect_url string `json:"failure_redirect_url"`
}

type PaymentLink struct {
	Link string `json:"link"`
}

func (clients *Requests) SendPaymentLink(amount string,
	currency string, description string, external_reference string,
	redirect_url string, failure_redirect_url string) PaymentLink {

	paymentRequest := PaymentRequest{
		Amount:               amount,
		Currency:             currency,
		Description:          description,
		External_reference:   external_reference,
		RedirectUrl:          redirect_url,
		Failure_redirect_url: failure_redirect_url,
	}

	paymentBody, _ := json.Marshal(paymentRequest)
	url := clients.baseUrl + "api/get_payment_link/"

	responseBody, err := clients.makeHttpRequest("POST", url, bytes.NewBuffer(paymentBody))

	if err != nil {
		fmt.Println("Invalid Request, check payment request credentials")
		log.Fatal(err)
	}

	var paymentLink PaymentLink
	if err := json.NewDecoder(bytes.NewBuffer(responseBody)).Decode(&paymentLink); err != nil {
		fmt.Println("Error is at the payment link")
		log.Fatal(err)
	}
	return paymentLink
}
