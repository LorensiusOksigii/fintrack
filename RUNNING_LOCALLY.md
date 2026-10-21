# Cara Jalankan FinTrack di Local 🚀

Panduan ini untuk menjalankan FinTrack di komputer sendiri.
Butuh **3 terminal** yang berjalan bersamaan.

---

## Prasyarat (Install Sekali Saja)

| Software | Cek | Download |
|----------|-----|----------|
| Docker Desktop | `docker --version` | https://www.docker.com/products/docker-desktop |
| Python 3.11+ | `python --version` | https://www.python.org/downloads |
| Node.js 20 LTS | `node --version` | https://nodejs.org |

> ⚠️ Setelah install, **tutup dan buka ulang terminal** agar PATH terupdate.

---

## Terminal 1 — Database (PostgreSQL)

```powershell
cd C:\Users\USER\Documents\test-kiro\fintrack\docker
```

Pertama kali saja — buat file `.env`:
```powershell
copy .env.example .env
```

Jalankan database:
```powershell
docker compose up -d
```

Cek status (tunggu sampai `healthy`):
```powershell
docker compose ps
```

✅ Berhasil jika kolom `Status` menunjukkan `healthy`.

> **Matikan database:** `docker compose down`
> **Lihat logs:** `docker compose logs -f`

---

## Terminal 2 — Backend (FastAPI)

```powershell
cd C:\Users\USER\Documents\test-kiro\fintrack\backend
```

### Setup (Pertama Kali Saja)

Buat virtual environment:
```powershell
python -m venv .venv
```

Aktifkan venv:
```powershell
.venv\Scripts\activate
```

Install dependencies:
```powershell
pip install -r requirements.txt
```

Buat file `.env`:
```powershell
copy .env.example .env
```

Jalankan migration database:
```powershell
$env:PYTHONPATH = "."; alembic upgrade head
```
atau pakai script:
```powershell
.\migrate.ps1 upgrade head
```

### Jalankan Backend

```powershell
.venv\Scripts\activate
$env:PYTHONPATH = "."; uvicorn app.main:app --reload
```
atau pakai script:
```powershell
.venv\Scripts\activate
.\dev.ps1
```

✅ Berhasil jika muncul:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

> Buka **http://localhost:8000/docs** untuk lihat Swagger UI.

---

## Terminal 3 — Frontend (React)

```powershell
cd C:\Users\USER\Documents\test-kiro\fintrack\frontend
```

### Setup (Pertama Kali Saja)

```powershell
npm install
```

### Jalankan Frontend

```powershell
npm run dev
```

✅ Berhasil jika muncul:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

> Buka **http://localhost:5173** di browser.

---

## Urutan Wajib Diikuti

```
1. Terminal 1 → docker compose up -d   (tunggu healthy)
      ↓
2. Terminal 2 → uvicorn (jalankan backend)
      ↓
3. Terminal 3 → npm run dev (jalankan frontend)
```

> ❌ Jangan jalankan backend sebelum database ready.

---

## Akses Aplikasi

| Service | URL | Keterangan |
|---------|-----|------------|
| Frontend | http://localhost:5173 | Tampilan aplikasi |
| Backend API | http://localhost:8000 | REST API |
| Swagger UI | http://localhost:8000/docs | Dokumentasi & test API |
| pgAdmin (opsional) | http://localhost:5050 | GUI database |

---

## Sesi Berikutnya (Sudah Pernah Setup)

Cukup jalankan di masing-masing terminal:

**Terminal 1:**
```powershell
cd C:\Users\USER\Documents\test-kiro\fintrack\docker
docker compose up -d
```

**Terminal 2:**
```powershell
cd C:\Users\USER\Documents\test-kiro\fintrack\backend
.venv\Scripts\activate
.\dev.ps1
```

**Terminal 3:**
```powershell
cd C:\Users\USER\Documents\test-kiro\fintrack\frontend
npm run dev
```

---

## Troubleshooting

### `npm` not recognized
→ Node.js belum terinstall atau belum restart terminal setelah install.
→ Download di https://nodejs.org (pilih LTS), install, restart terminal.

### `python` not recognized
→ Python belum terinstall atau tidak ada di PATH.
→ Download di https://python.org, centang **"Add Python to PATH"** saat install.

### `alembic upgrade head` — ModuleNotFoundError: No module named 'app'
→ Lupa set PYTHONPATH. Jalankan:
```powershell
$env:PYTHONPATH = "."; alembic upgrade head
```

### Backend error — connection refused / can't connect to database
→ Database belum ready. Cek:
```powershell
docker compose ps   # Status harus "healthy"
```

### Port 5432 already in use
→ PostgreSQL lain sudah jalan di komputer. Edit `docker/.env`:
```
POSTGRES_PORT=5433
```
Lalu update `DATABASE_URL` di `backend/.env`:
```
DATABASE_URL=postgresql://fintrack_user:fintrack_password@localhost:5433/fintrack_db
```

### Frontend bisa buka tapi login gagal / API error
→ Pastikan backend sudah jalan di port 8000.
→ Vite otomatis proxy `/api/*` ke `localhost:8000`.

### Lupa matikan semua service
```powershell
# Matikan database
cd fintrack\docker
docker compose down

# Backend dan frontend: tekan Ctrl+C di terminal masing-masing
```
