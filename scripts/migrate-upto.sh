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
VERSION="$1"

if [ -z "$VERSION" ]; then
    echo "Usage: bash scripts/migrate-upto.sh <version>"
    exit 1
fi

echo "Migrating to version ${VERSION}..."
echo "Database URL: ${DB_URL}"

# Go to a specific migration version
migrate -path "$MIGRATIONS_PATH" -database "$DB_URL" goto "$VERSION"

if [ $? -eq 0 ]; then
    echo "Migration completed successfully!"
else
    echo "Migration failed!"
    exit 1
fi
