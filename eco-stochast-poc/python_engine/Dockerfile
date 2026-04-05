FROM python:3.11-slim

WORKDIR /app

# Install dependencies FIRST (caching layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Start server using uvicorn for better performance in production
# Railway will automatically use the PORT env var if provided, 
# but 8000 is our default.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
