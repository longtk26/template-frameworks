#!/bin/bash

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    echo "Loading environment variables from .env file..."
    export $(grep -v '^#' .env | xargs)
fi

# Default to local database if DB_URL is not set
DB_URL="${DB_URL:-postgresql://postgres:password@localhost:5432/clean_architecture?sslmode=disable}"

# Path to migrations directory
MIGRATIONS_PATH="migrations"
STEPS="$1"

echo "Running migrations up..."
echo "Database URL: ${DB_URL}"

# Run migrations
if [ -n "$STEPS" ]; then
    migrate -path "$MIGRATIONS_PATH" -database "$DB_URL" up "$STEPS"
else
    migrate -path "$MIGRATIONS_PATH" -database "$DB_URL" up
fi

if [ $? -eq 0 ]; then
    echo "Migrations completed successfully!"
else
    echo "Migration failed!"
    exit 1
fi