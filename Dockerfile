# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies including devDependencies for build
RUN npm install

# Copy source code
COPY src ./src

# Build the project
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy service account files (if they exist in build context)
# Note: In production, it's better to use environment variables or secret volumes.
# This assumes files were copied to build context as allowed by .dockerignore for now.
COPY service-account.json* ./
COPY service-account-climate.json* ./

# Set environment variables (defaults)
ENV NODE_ENV=production
ENV DB_PATH=/app/data/memory.db

# Create data directory for persistent storage (SQLite)
RUN mkdir -p /app/data

# Expose port (if using webhooks later, not needed for long-polling)
# EXPOSE 3000

CMD ["npm", "start"]
