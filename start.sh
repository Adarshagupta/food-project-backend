#!/bin/bash

# Start the backend services

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker and Docker Compose."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

# Start the services with Docker Compose
echo "Starting Foodo backend services..."
docker-compose up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 5

# Generate Prisma client
echo "Generating Prisma client..."
docker-compose exec api npm run prisma:generate

# Run database migrations (only in development)
if [ "$NODE_ENV" != "production" ]; then
  echo "Running database migrations..."
  docker-compose exec api npm run prisma:migrate

  # Seed the database
  echo "Seeding the database..."
  docker-compose exec api npm run prisma:seed
fi

echo "Foodo backend is now running!"
echo "API: http://localhost:8000"
echo "API Documentation: http://localhost:8000/api/docs"
echo "Order Dispatch Service: http://localhost:8080"
echo "Location Tracker Service: http://localhost:8081"
echo "Prisma Studio (Database UI): Run 'npm run prisma:studio' in the backend directory"
