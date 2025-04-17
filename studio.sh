#!/bin/bash

# Start Prisma Studio for database management

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please create a .env file with your database connection string."
    exit 1
fi

# Generate Prisma client if needed
if [ ! -d "node_modules/.prisma" ]; then
    echo "Generating Prisma client..."
    npx prisma generate
fi

# Start Prisma Studio
echo "Starting Prisma Studio..."
npx prisma studio
