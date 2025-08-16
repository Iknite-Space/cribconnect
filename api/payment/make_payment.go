package payment

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
)

type Requests struct {
	baseUrl string
	apikey  string
}

func NewApiClient(baseurl string, apikey string) *Requests {
	return &Requests{
		baseUrl: baseurl,
		apikey:  apikey,
	}
}

// Struct types to hold input
type Transrequest struct {
	From        string `json:"from"`
	Amount      string `json:"amount"`
	Description string `json:"description"`
	Reference   string `json:"external_reference"`
}

// Struct types to hold output
type Transresponse struct {
	Reference string `json:"reference"`
	Ussd_code string `json:"ussd_code"`
	Operator  string `json:"operator"`
}

// Initiating mobile money withdrawal
func (clients *Requests) RequestPayment(number string, amount string, description string, ref string) Transresponse {

	number = "237" + number

	transreq := Transrequest{
		From:        number,
		Amount:      amount,
		Description: description,
		Reference:   ref,
	}

	reqBody, _ := json.Marshal(transreq)
	url := clients.baseUrl + "api/collect/"
	responsebody, err := clients.makeHttpRequest("POST", url, bytes.NewBuffer(reqBody))

	if err != nil {
		fmt.Println("Invalid Request, check POST request credentials")
		log.Fatal(err)
	}

	var transaction Transresponse
	if err := json.NewDecoder(bytes.NewBuffer(responsebody)).Decode(&transaction); err != nil {
		log.Fatal(err)
	}
	return transaction

}
