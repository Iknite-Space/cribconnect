#!/usr/bin/env sh

# this is just a temporary script while debugging

GOARCH=amd64 GOOS=linux go build -tags lambda.norpc -o bootstrap ./...

rm ../../zip/pgDatabase.zip
zip ../../zip/pgDatabase.zip bootstrap

