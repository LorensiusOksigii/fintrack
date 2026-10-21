# ================================
# FinTrack Backend — Dockerfile
# ================================
# Multi-stage build untuk image yang lebih kecil di production.

# --- Stage 1: Builder ---
FROM python:3.11-slim AS builder

WORKDIR /app

# Install dependencies ke folder isolasi
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir --prefix=/install -r requirements.txt

# --- Stage 2: Runtime ---
FROM python:3.11-slim AS runtime

WORKDIR /app

# Copy installed packages dari builder stage
COPY --from=builder /install /usr/local

# Copy source code + migration config
COPY app/ ./app/
COPY alembic.ini ./

# Non-root user untuk keamanan
RUN adduser --disabled-password --gecos "" appuser
USER appuser

# Expose port
EXPOSE 8000

# Jalankan uvicorn
# --host 0.0.0.0 agar bisa diakses dari luar container
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
