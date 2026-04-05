# ══════════════════════════════════════════════════════
# Stage 1: Builder — install deps (may need gcc headers)
# ══════════════════════════════════════════════════════
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ══════════════════════════════════════════════════════
# Stage 2: Production — minimal image, no build tools
# ══════════════════════════════════════════════════════
FROM python:3.11-slim
WORKDIR /app

# Copy only installed packages from builder
COPY --from=builder /install /usr/local

# Copy only application code (never COPY . .)
COPY main.py config.py models.py ./

# Install curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Create non-root user for security (prevents privilege escalation)
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup appuser

USER appuser

EXPOSE 8000

# Shell form: allows ${PORT:-8000} expansion. 2 workers for parallel Monte Carlo requests.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2"]
