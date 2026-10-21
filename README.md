# FinTrack 💰

Personal Finance Tracker — aplikasi web untuk mencatat pemasukan, pengeluaran, dan mengatur budget bulanan.

![CI](https://github.com/yourusername/fintrack/actions/workflows/ci.yml/badge.svg)

## Tech Stack

| Layer      | Teknologi                                      |
|------------|------------------------------------------------|
| Frontend   | React 18 + TypeScript + Vite                  |
| UI         | Tailwind CSS + shadcn/ui + Recharts           |
| Backend    | FastAPI + Python 3.11+                        |
| Database   | PostgreSQL (lokal: Docker, production: Neon)  |
| ORM        | SQLAlchemy 2.0 + Alembic                      |
| Auth       | JWT (python-jose + passlib/bcrypt)            |
| Deployment | Frontend → Vercel, Backend → Railway          |

## Project Structure

```
fintrack/
├── frontend/    # React + Vite app
├── backend/     # FastAPI app
├── docker/      # Docker Compose untuk development lokal
├── docs/        # Dokumentasi teknis
└── .github/     # CI/CD workflows
```

---

## Quick Start (Development Lokal)

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose

### 1. Clone repo

```bash
git clone https://github.com/yourusername/fintrack.git
cd fintrack
```

### 2. Jalankan Database

```bash
cd docker
cp .env.example .env
docker compose up -d

# Verifikasi postgres healthy
docker compose ps
```

### 3. Setup & Jalankan Backend

```bash
cd backend

# Buat virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env jika perlu (DATABASE_URL sudah cocok dengan docker/.env)

# Jalankan migration
alembic upgrade head

# Jalankan server
uvicorn app.main:app --reload
```

Backend: http://localhost:8000
API Docs: http://localhost:8000/docs

### 4. Setup & Jalankan Frontend

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Jalankan dev server
npm run dev
```

Frontend: http://localhost:5173

---

## Deployment

### Database — Neon PostgreSQL

1. Buat akun di [neon.tech](https://neon.tech)
2. Buat project baru → salin **Connection String**
3. Format: `postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require`

### Backend — Railway

1. Buat akun di [railway.app](https://railway.app)
2. **New Project → Deploy from GitHub repo**
3. Pilih folder `backend/` sebagai root directory
4. Set environment variables di Railway Dashboard:

```
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
SECRET_KEY=<generate: python -c "import secrets; print(secrets.token_hex(32))">
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=https://your-app.vercel.app
DEBUG=false
```

5. Deploy — Railway otomatis build Dockerfile dan jalankan `alembic upgrade head`
6. Salin URL deployment Railway (format: `https://xxx.up.railway.app`)

### Frontend — Vercel

1. Buat akun di [vercel.com](https://vercel.com)
2. **New Project → Import Git Repository**
3. Set **Root Directory** ke `frontend/`
4. Set environment variables di Vercel Dashboard:

```
VITE_API_BASE_URL=https://your-backend.up.railway.app
```

5. Deploy — Vercel otomatis detect Vite dan jalankan `npm run build`

### Post-Deployment Checklist

- [ ] Akses URL Vercel → redirect ke `/login` ✓
- [ ] Register akun baru → berhasil masuk dashboard ✓
- [ ] Tambah transaksi → muncul di tabel ✓
- [ ] Dashboard menampilkan data ✓
- [ ] CORS: frontend bisa hit backend tanpa error ✓

---

## Environment Variables Reference

### Backend

| Variable | Wajib | Deskripsi |
|----------|-------|-----------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SECRET_KEY` | ✅ | JWT signing key (min 32 chars random hex) |
| `ALGORITHM` | ❌ | JWT algorithm (default: HS256) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | Token expiry (default: 1440 = 24 jam) |
| `ALLOWED_ORIGINS` | ❌ | CORS origins, pisah koma (default: localhost:5173) |
| `DEBUG` | ❌ | Aktifkan Swagger UI (default: false) |

### Frontend

| Variable | Wajib | Deskripsi |
|----------|-------|-----------|
| `VITE_API_BASE_URL` | ✅ (production) | URL backend Railway |

---

## API Documentation

Swagger UI tersedia di `/docs` saat `DEBUG=true`.

Endpoint summary:

| Method | Path | Deskripsi |
|--------|------|-----------|
| POST | `/api/v1/auth/register` | Daftar akun baru |
| POST | `/api/v1/auth/login` | Login, dapat JWT |
| GET | `/api/v1/auth/me` | Info user aktif |
| GET | `/api/v1/categories` | List kategori |
| POST | `/api/v1/categories` | Buat kategori |
| GET | `/api/v1/transactions` | List transaksi (+ filter) |
| POST | `/api/v1/transactions` | Catat transaksi |
| GET | `/api/v1/budgets` | List budget |
| POST | `/api/v1/budgets` | Set budget |
| GET | `/api/v1/summary/monthly` | Ringkasan bulanan |
| GET | `/api/v1/summary/budget-progress` | Progress budget |
| GET | `/api/v1/summary/trends` | Tren 6 bulan |
| GET | `/api/v1/summary/category-breakdown` | Breakdown per kategori |

---

## Milestones

- [x] Milestone 1 — Project Setup & Scaffolding
- [x] Milestone 2 — Database Models & Migrations
- [x] Milestone 3 — Authentication API
- [x] Milestone 4 — Categories & Transactions API
- [x] Milestone 5 — Budget & Summary API
- [x] Milestone 6 — Frontend Auth & Layout
- [x] Milestone 7 — Dashboard Page
- [x] Milestone 8 — Transactions Page
- [x] Milestone 9 — Budgets & Categories Pages
- [x] Milestone 10 — Deployment
