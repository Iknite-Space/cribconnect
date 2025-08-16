package payment

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

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

// Initiating request to get the status of the transaction
func (clients *Requests) CheckPaymentStatus(reference string) Status {

	url := fmt.Sprintf(clients.baseUrl+"api/transaction/%s", reference)
	responsebody, err := clients.makeHttpRequest("GET", url, nil)

	if err != nil {
		fmt.Println("Invalid Request, check get request credentials")
		log.Fatal(err)
	}

	var checkState Status
	if err := json.NewDecoder(bytes.NewBuffer(responsebody)).Decode((&checkState)); err != nil {
		log.Fatal(err)
	}
	return checkState

}

func (clients *Requests) makeHttpRequest(method string, url string, body io.Reader) ([]byte, error) {
	req, err := http.NewRequest(method, url, body)

	if err != nil {
		fmt.Println("Check GET request credentials")
		log.Fatal(err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Token %s", clients.apikey))
	req.Header.Add("Content-Type", "application/json")

	response, err := http.DefaultClient.Do(req)

	if err != nil {
		fmt.Println("Invalid Request, check post request credentials")
		log.Fatal(err)
	}
	defer func() {
		if err := response.Body.Close(); err != nil {
			log.Fatal(err)
		}
	}()

	responsebody, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err

	}
	return responsebody, nil

}
