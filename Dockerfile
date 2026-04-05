# ---
# 📚 POR QUÉ: Multi-stage build que separa build (con devDeps) de production (solo dist/).
#    Elimina COPY de service-account*.json — las credenciales se inyectan via variables
#    de entorno en runtime (nunca baked en la imagen). Sin multi-stage, la imagen
#    incluiría TypeScript, vitest, eslint y ~200MB de devDeps innecesarias en prod.
# 📁 ARCHIVO: Dockerfile
# ---

# ══════════════════════════════════════════
# Stage 1: Build
# ══════════════════════════════════════════
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including devDeps for tsc)
RUN npm ci

# Copy source and build
COPY src ./src
RUN npm run build

# ══════════════════════════════════════════
# Stage 2: Production
# ══════════════════════════════════════════
FROM node:20-slim

WORKDIR /app

# Copy package files and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# NOTE: Credentials are injected via environment variables at runtime.
# If using Google Cloud credentials, set GOOGLE_CREDENTIALS_JSON (base64-encoded)
# as an environment variable in your deployment platform (Railway, etc.)
# NEVER bake credentials into the Docker image.

ENV NODE_ENV=production
ENV DB_PATH=/app/data/memory.db

# Create data directory for SQLite persistence
RUN mkdir -p /app/data

CMD ["npm", "start"]
