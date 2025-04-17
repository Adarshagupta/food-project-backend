#!/bin/bash

# Setup database schema for Neon PostgreSQL

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

# Create database schema
echo "Creating database schema..."
npx prisma db push

# Seed the database
echo "Seeding the database..."
npx ts-node prisma/seed.ts

echo "Database setup complete!"
