# Foodo Backend

This is the backend for the Foodo food delivery application. It consists of a NestJS API server and Go microservices for high-performance components.

## Architecture

The backend is built with the following components:

- **NestJS API Server**: Main API for the application
- **Go Microservices**:
  - **Order Dispatch Service**: Handles order assignment and tracking
  - **Location Tracker Service**: Real-time location tracking for delivery
- **PostgreSQL**: Primary database
- **Redis**: Caching and pub/sub messaging
- **Socket.IO**: Real-time communication with clients

## Prerequisites

- Node.js 18+
- Go 1.21+
- PostgreSQL 16+
- Redis 7+
- Docker and Docker Compose (optional)

## Getting Started

### Environment Setup

1. Copy the example environment file:
   ```
   cp .env.example .env
   ```

2. Update the environment variables in the `.env` file with your actual values.

### Using Neon PostgreSQL

This project is configured to use Neon PostgreSQL, a serverless PostgreSQL service. The connection string is already set up in the `.env` file:

```
DATABASE_URL="postgresql://neondb_owner:npg_iZmQc5el7Jqw@ep-long-leaf-a1as6zlk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

To set up the database schema and seed data:

```bash
./setup-db.sh
```

### Running with Docker

The easiest way to run the entire backend stack is with Docker Compose:

```bash
docker-compose up -d
```

This will start all services: PostgreSQL, Redis, NestJS API, and Go microservices.

### Running Locally

#### NestJS API Server

Use the development script to start the server:

```bash
./dev.sh
```

This script will:
1. Install dependencies if needed
2. Generate the Prisma client
3. Start the server in development mode

The API server will be available at http://localhost:8000.

Alternatively, you can run the commands manually:

```bash
npm install
npx prisma generate
npm run start:dev
```

#### Go Microservices

1. Order Dispatch Service:
   ```bash
   cd go-services/order-dispatch
   go mod download
   go run main.go
   ```

2. Location Tracker Service:
   ```bash
   cd go-services/location-tracker
   go mod download
   go run main.go
   ```

## API Documentation

Once the API server is running, you can access the Swagger documentation at:

http://localhost:8000/api/docs

## Database Schema

The database schema is defined in the Prisma schema file at `prisma/schema.prisma`. It includes the following main entities:

- Users
- Restaurants
- Menu Items
- Categories
- Carts
- Orders
- Promotions
- Notifications

## WebSocket Endpoints

The backend provides the following WebSocket endpoints for real-time communication:

- `/orders` - Order status updates
- `/notifications` - User notifications
- `/ws/drivers/:id` - Driver location updates
- `/ws/location/:type/:id` - Location tracking

## License

This project is licensed under the MIT License.
# food-project-backend
