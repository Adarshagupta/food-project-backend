FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Use a smaller image for the final build
FROM node:20-alpine

WORKDIR /app

# Install OpenSSL and other dependencies needed for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy build from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 8000

# Set working directory for the command
WORKDIR /app

# Command to run
CMD ["node", "dist/src/main.js"]
