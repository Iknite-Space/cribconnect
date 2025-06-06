FROM golang:1.24-alpine3.20 AS builder

WORKDIR /app

# Copy only the go.mod and go.sum files from the root
COPY go.mod go.sum ./

# Download the dependencies
RUN go mod download -x

# Install curl
RUN apk add --no-cache curl


# Copy the source code for api service
COPY . ./api

# Build the service
WORKDIR /app/api
RUN go build -o /app/bin/api ./cmd/api/...

# Run stage
FROM alpine:3.18

WORKDIR /app

COPY --from=builder /app/bin/api .

# Copy the database migration files
COPY db/migrations ./migrations

# Add timezone data
RUN apk add --no-cache tzdata

# Run the jsonproxy
CMD ["/app/api"]
