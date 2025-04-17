#!/bin/bash

# Start the backend in development mode

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please create a .env file with your database connection string."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Start the server
echo "Starting the server..."
npm run start:dev
