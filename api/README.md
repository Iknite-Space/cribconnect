# sqlc-example-api

This directory provides starter code for creating a API using sqlc and the Gin web framework in Go. 


Directory Structure

* `api/`: Contains API route definitions and handler functions. You will need to edit this file, if you want to add or modify the apit endpoints.
* `cmd/api/`: Houses the main application entry point. You shouldn't need to edit any files in this directory.
* `db/migrations`: Contains sql files that create/update the database schema (tables and columns) used by the api. If you need to update the database schema make your changes here.
* `db/query`: This folder contains SQL query files. These files define the database queries used by the application, which are processed by sqlc to generate type-safe Go code for interacting with the database.
`db/repo/`: This directory contains repository code that acts as an abstraction layer between the database and the application logic. It provides functions to interact with the database using the generated sqlc code. You shouldn't need to edit any files in this directory.

# Getting Started
* Set Up Environment Variables:
    * Create a new database for use with this project.
    * Copy the .env.example file to .env and configure the necessary environment variables, such as database connection details.
* Install Dependencies:
    * Ensure you have Go installed. Then, install the required Go modules:
    `go mod tidy`
* Generate Code with sqlc:
    * If you make any changes to `db/query` or `db/migrations`, then you need to re-generate the go code in `db/repo`
            `go generate ./...`
    * This command will generate Go code based on the SQL queries defined in the db/queries/ directory.
* Run the Application:
    `go run cmd/api/...`

    The server will start, and it will print the available endpoints.
