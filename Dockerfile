# ===================================================
# Stage 1: Build the React + Vite Frontend
# ===================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# ===================================================
# Stage 2: Python FastAPI Backend + Bundled Frontend
# ===================================================
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/backend \
    PORT=8000

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend application source
COPY backend ./backend

# Copy built frontend assets from Stage 1 into dist
COPY --from=frontend-builder /app/dist ./dist

# Create SQLite storage directory
RUN mkdir -p backend/data

EXPOSE 8000

# Start Uvicorn bound to 0.0.0.0 and dynamic cloud port
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
