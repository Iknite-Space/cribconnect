package main

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"

	"github.com/aws/aws-lambda-go/cfn"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/secretsmanager"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
	_ "github.com/lib/pq"
)

const (
	PropertyNameAdminSecretArn   = "AdminSecretArn"
	PropertyNameServiceSecretArn = "ServiceSecretArn"

	CustomTypeNamePgDatabase = "Custom::PgDatabase"
)

var (
	IsAlphanumericRegex = regexp.MustCompile(`^[a-zA-Z0-9]*$`)
)

type RootDatabaseConfig struct {
	Password             string `json:"password"`
	DBName               string `json:"dbname"`
	Engine               string `json:"engine"`
	Port                 int    `json:"port"`
	DBInstanceIdentifier string `json:"dbInstanceIdentifier"`
	Host                 string `json:"host"`
	Username             string `json:"username"`
}

type ServiceDatabaseConfig struct {
	DBName   string `json:"dbname"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type CustomResourceManager struct {
	secretsManager *secretsmanager.SecretsManager
}

func (c *CustomResourceManager) HandleCustomResourceEvent(ctx context.Context, event cfn.Event) (string, map[string]interface{}, error) {
	switch event.ResourceType {
	case CustomTypeNamePgDatabase:
		switch event.RequestType {
		case cfn.RequestCreate:
			return c.createDatabase(ctx, event)
		case cfn.RequestUpdate:
			return c.updateDatabase(ctx, event)
		case cfn.RequestDelete:
			return c.deleteDatabase(ctx, event)
		}
	}

	return "", nil, fmt.Errorf("unknown request type or resource: eventType=%s resourceType=%s", event.RequestType, event.ResourceType)

}

func (c *CustomResourceManager) createDatabase(ctx context.Context, event cfn.Event) (string, map[string]interface{}, error) {
	rootConfig, serviceConfig, err := c.getProperties(ctx, event.ResourceProperties)
	if err != nil {
		return "", nil, err
	}
	// For simplicity we require the dbname and username to match
	if serviceConfig.DBName != serviceConfig.Username {
		return "", nil, fmt.Errorf("service dbname and username must match")
	}

	// The service username must be different from the root username
	if rootConfig.Username == serviceConfig.Username {
		return "", nil, fmt.Errorf("service username must be different from root username")
	}

	// The service dbname must be different from the root dbname
	if rootConfig.DBName == serviceConfig.DBName {
		return "", nil, fmt.Errorf("service dbname must be different from root dbname")
	}

	// Due to limitations around the postgres preparaed statements, we can't use use prepared statements
	// for the CREATE DATABASE and CREATE USER commands. To avoid syntax errors we restrict database names,
	// usernames, and passwords to alphanumeric characters only.
	if !IsAlphanumericRegex.MatchString(serviceConfig.Password) {
		return "", nil, fmt.Errorf("service password must be alphanumeric")
	}

	// we don't need to check the username separately because we also require
	// the dbname and username to match.
	if !IsAlphanumericRegex.MatchString(serviceConfig.DBName) {
		return "", nil, fmt.Errorf("service dbname must be alphanumeric")
	}

	fmt.Println("Connecting to database: ", rootConfig.DBInstanceIdentifier)
	rootDB, err := c.getDBConnection(ctx, rootConfig, rootConfig.DBName)
	if err != nil {
		return "", nil, fmt.Errorf("failed to get db connection: %w", err)
	}
	defer rootDB.Close()

	// CREATE DATABASE EXAMPLE_DB;
	fmt.Println("Creating database: ", serviceConfig.DBName)
	_, err = rootDB.ExecContext(ctx, fmt.Sprintf("CREATE DATABASE %s", serviceConfig.DBName))
	if err != nil {
		pqErr, ok := err.(*pq.Error)
		if !ok {
			return "", nil, fmt.Errorf("failed to create database: %w", err)
		}
		// If the database already exists, we can ignore the error
		if pqErr.Code != "42P04" {
			return "", nil, fmt.Errorf("failed to create database: code=%s %w", pqErr.Code, err)
		}

	}

	// CREATE USER EXAMPLE_USER WITH ENCRYPTED PASSWORD 'Sup3rS3cret';
	fmt.Println("Creating user: ", serviceConfig.Username)
	_, err = rootDB.ExecContext(ctx, fmt.Sprintf("CREATE USER %s WITH PASSWORD '%s'", serviceConfig.Username, serviceConfig.Password))
	if err != nil {
		pqErr, ok := err.(*pq.Error)
		if !ok {
			return "", nil, fmt.Errorf("failed to create user: %w", err)
		}
		// If the user already exists, we can ignore the error
		if pqErr.Code != "42710" {
			return "", nil, fmt.Errorf("failed to create user: code=%s %w", pqErr.Code, err)
		}

	}

	// GRANT ALL PRIVILEGES ON DATABASE EXAMPLE_DB TO EXAMPLE_USER;
	_, err = rootDB.ExecContext(ctx, fmt.Sprintf("GRANT ALL PRIVILEGES ON DATABASE %s TO %s", serviceConfig.DBName, serviceConfig.Username))
	if err != nil {
		return "", nil, fmt.Errorf("failed to grant permissions: %w", err)
	}

	// \c EXAMPLE_DB postgres
	serviceDB, err := c.getDBConnection(ctx, rootConfig, serviceConfig.DBName)
	if err != nil {
		return "", nil, fmt.Errorf("failed to get db connection: %w", err)
	}
	defer serviceDB.Close()

	// GRANT ALL ON SCHEMA public TO EXAMPLE_USER;
	_, err = serviceDB.ExecContext(ctx, fmt.Sprintf("GRANT ALL ON SCHEMA public TO %s", serviceConfig.Username))
	if err != nil {
		return "", nil, fmt.Errorf("failed to grant permissions: %w", err)
	}

	physicalResourceID := getPhysicalResourceID(rootConfig, serviceConfig)
	return physicalResourceID, nil, nil

}

func (c *CustomResourceManager) updateDatabase(ctx context.Context, event cfn.Event) (string, map[string]interface{}, error) {
	rootConfig, serviceConfig, err := c.getProperties(ctx, event.ResourceProperties)
	if err != nil {
		return "", nil, err
	}

	oldRootConfig, oldServiceConfg, err := c.getProperties(ctx, event.OldResourceProperties)
	if err != nil {
		return "", nil, fmt.Errorf("failed to get old properties: %w", err)
	}

	// For simplicity we require the dbname and username to match
	if serviceConfig.DBName != serviceConfig.Username {
		return "", nil, fmt.Errorf("service dbname and username must match")
	}

	// If the DBInstanceIdentifier or DBName has changed, we need to create a new database
	// We don't have to worry about cleaning up the old database, cloudformation
	// will call delete on the old database when we return a new physical resource ID
	if oldRootConfig.DBInstanceIdentifier != rootConfig.DBInstanceIdentifier ||
		oldServiceConfg.DBName != serviceConfig.DBName {
		fmt.Printf("DBInstanceIdentifier or DBName has changed, creating new database: new_dbname=%s new_username=%s old_dbname=%s old_username=%s\n", serviceConfig.DBName, serviceConfig.Username, oldServiceConfg.DBName, oldServiceConfg.Username)
		return c.createDatabase(ctx, event)
	}

	fmt.Println("Connecting to database: ", rootConfig.DBInstanceIdentifier)
	rootDB, err := c.getDBConnection(ctx, rootConfig, rootConfig.DBName)
	if err != nil {
		return "", nil, fmt.Errorf("failed to get db connection: %w", err)
	}

	fmt.Println("updating password for user: ", serviceConfig.Username)
	_, err = rootDB.ExecContext(ctx, fmt.Sprintf("ALTER USER %s WITH PASSWORD '%s'", serviceConfig.Username, serviceConfig.Password))
	if err != nil {
		return "", nil, fmt.Errorf("failed to update password: %w", err)
	}

	physicalResourceID := getPhysicalResourceID(rootConfig, serviceConfig)

	return physicalResourceID, nil, nil
}

func (c *CustomResourceManager) deleteDatabase(ctx context.Context, event cfn.Event) (string, map[string]interface{}, error) {
	rootConfig, serviceConfig, err := c.getProperties(ctx, event.ResourceProperties)
	if err != nil {
		return "", nil, err
	}

	fmt.Println("Connecting to database: ", rootConfig.DBInstanceIdentifier)
	rootDB, err := c.getDBConnection(ctx, rootConfig, rootConfig.DBName)
	if err != nil {
		return "", nil, fmt.Errorf("failed to get db connection: %w", err)
	}
	defer rootDB.Close()

	fmt.Println("Deleting database: ", serviceConfig.DBName)
	_, err = rootDB.ExecContext(ctx, fmt.Sprintf("DROP DATABASE %s", serviceConfig.DBName))
	if err != nil {
		pqErr, ok := err.(*pq.Error)
		if !ok {
			return "", nil, fmt.Errorf("failed to delete database: %w", err)
		}
		// If the database does not exist, we can ignore the error
		if pqErr.Code != "3D000" {
			return "", nil, fmt.Errorf("failed to delete database: code=%s %w", pqErr.Code, err)
		}
	}

	fmt.Println("Deleting user: ", serviceConfig.Username)
	_, err = rootDB.ExecContext(ctx, fmt.Sprintf("DROP USER %s", serviceConfig.Username))
	if err != nil {
		pqErr, ok := err.(*pq.Error)
		if !ok {
			return "", nil, fmt.Errorf("failed to delete user: %w", err)
		}
		// If the user does not exist, we can ignore the error
		if pqErr.Code != "42704" {
			return "", nil, fmt.Errorf("failed to delete user: code=%s %w", pqErr.Code, err)
		}
	}

	physicalResourceID := rootConfig.DBInstanceIdentifier + "/" + serviceConfig.DBName
	return physicalResourceID, nil, nil
}

func (c *CustomResourceManager) getProperties(ctx context.Context, properties map[string]interface{}) (*RootDatabaseConfig, *ServiceDatabaseConfig, error) {
	rootConfig := RootDatabaseConfig{}
	serviceConfig := ServiceDatabaseConfig{}

	adminSecretArn, ok := properties[PropertyNameAdminSecretArn].(string)
	if !ok {
		return nil, nil, fmt.Errorf("RootDatabaseConfig must be a string")
	}

	serviceSecretArn, ok := properties[PropertyNameServiceSecretArn].(string)
	if !ok {
		return nil, nil, fmt.Errorf("ServiceDatabaseConfig must be a string")
	}

	err := c.getSecret(ctx, adminSecretArn, &rootConfig)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get admin secret: %w", err)
	}

	err = c.getSecret(ctx, serviceSecretArn, &serviceConfig)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get service secret: %w", err)
	}

	return &rootConfig, &serviceConfig, nil
}

func (c *CustomResourceManager) getSecret(ctx context.Context, secretArn string, dest any) error {

	input := &secretsmanager.GetSecretValueInput{
		SecretId: aws.String(secretArn),
	}

	result, err := c.secretsManager.GetSecretValueWithContext(ctx, input)
	if err != nil {
		return fmt.Errorf("failed to get secret: %w", err)
	}

	if result.SecretString == nil {
		return fmt.Errorf("secret string is nil")
	}

	err = json.Unmarshal([]byte(*result.SecretString), dest)
	if err != nil {
		return fmt.Errorf("failed to unmarshal secret: %w", err)
	}

	return nil
}

// getDBConnection returns a new database connection.
// The database name is passed as an argument to this function, rather than reading it from the config.
// This allows the caller to connect to the service database using the admin credentials.
func (c *CustomResourceManager) getDBConnection(_ context.Context, rootConfig *RootDatabaseConfig, dbName string) (*sqlx.DB, error) {
	connStr := fmt.Sprintf("host=%s port=%d user=%s dbname=%s sslmode=require password=%s",
		rootConfig.Host, rootConfig.Port, rootConfig.Username, dbName, rootConfig.Password)

	db, err := sqlx.Connect("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	return db, nil
}

func getPhysicalResourceID(rootConfig *RootDatabaseConfig, serviceConfig *ServiceDatabaseConfig) string {
	return rootConfig.DBInstanceIdentifier + "/" + serviceConfig.DBName
}

func main() {
	awsSession, err := session.NewSession()
	if err != nil {
		panic(err)
	}
	svc := secretsmanager.New(awsSession)

	c := &CustomResourceManager{
		secretsManager: svc,
	}

	lambda.Start(cfn.LambdaWrap(c.HandleCustomResourceEvent))
}
