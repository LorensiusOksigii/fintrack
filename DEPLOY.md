# Panduan Deploy FinTrack 🚀

Stack deployment **100% gratis**:
- **Frontend** → Vercel
- **Backend** → Render
- **Database** → Neon PostgreSQL

---

## Urutan Deploy

```
1. Neon (database) → dapat CONNECTION_STRING
        ↓
2. Render (backend) → set env vars → dapat BACKEND_URL
        ↓
3. Vercel (frontend) → set VITE_API_BASE_URL → dapat FRONTEND_URL
        ↓
4. Update ALLOWED_ORIGINS di Render → selesai
```

---

## Persiapan — Push ke GitHub

Sebelum deploy, kode harus ada di GitHub dulu.

### Buat repo di GitHub

1. Buka https://github.com/new
2. Repository name: `fintrack`
3. Pilih **Private** (biar data aman)
4. Klik **Create repository**

### Push kode dari terminal

```powershell
cd C:\Users\USER\Documents\test-kiro\fintrack
git init
git add .
git commit -m "feat: initial fintrack project"
git branch -M main
git remote add origin https://github.com/USERNAME/fintrack.git
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub kamu.

---

## Step 1 — Database: Neon

1. Buka **https://neon.tech** → klik **Sign Up**
2. Login pakai GitHub (lebih cepat)
3. Klik **New Project**
   - Project name: `fintrack`
   - Region: **Singapore** (paling dekat)
   - Klik **Create Project**
4. Setelah project dibuat, lihat bagian **Connection Details**
5. Pilih format **Connection string**
6. Copy string-nya — bentuknya:
   ```
   postgresql://user:password@ep-xxx-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
7. **Simpan string ini** — dipakai di Step 2

---

## Step 2 — Backend: Render

### Buat Web Service

1. Buka **https://render.com** → klik **Get Started for Free**
2. Sign up pakai GitHub
3. Dari dashboard, klik **New +** → **Web Service**
4. Pilih **Build and deploy from a Git repository**
5. Connect ke GitHub → pilih repo `fintrack`
6. Konfigurasi:

   | Setting | Value |
   |---------|-------|
   | Name | `fintrack-backend` |
   | Region | Singapore |
   | Branch | `main` |
   | Root Directory | `backend` |
   | Runtime | `Python 3` |
   | Build Command | `pip install -r requirements.txt` |
   | Start Command | `PYTHONPATH=. alembic upgrade head && PYTHONPATH=. uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
   | Instance Type | **Free** |

### Set Environment Variables

Scroll ke bawah ke bagian **Environment Variables**, tambahkan satu per satu:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | *(connection string dari Neon)* |
| `SECRET_KEY` | *(generate di bawah)* |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` |
| `DEBUG` | `true` |
| `ALLOWED_ORIGINS` | `http://localhost:5173` *(update nanti setelah dapat URL Vercel)* |

**Generate SECRET_KEY** — buka Python di terminal lokal:
```powershell
cd C:\Users\USER\Documents\test-kiro\fintrack\backend
& .venv\Scripts\python.exe -c "import secrets; print(secrets.token_hex(32))"
```
Copy output-nya sebagai nilai `SECRET_KEY`.

### Deploy

7. Klik **Create Web Service**
8. Render mulai build — tunggu sekitar 3-5 menit
9. Kalau berhasil, status jadi **Live** ✅
10. Copy URL service — bentuknya:
    ```
    https://fintrack-backend.onrender.com
    ```
11. Test di browser: `https://fintrack-backend.onrender.com/health`
    - Harus muncul: `{"status":"healthy","version":"0.1.0"}`

---

## Step 3 — Frontend: Vercel

1. Buka **https://vercel.com** → klik **Sign Up**
2. Login pakai GitHub
3. Klik **Add New Project**
4. Import repo `fintrack` dari GitHub
5. Konfigurasi:

   | Setting | Value |
   |---------|-------|
   | Framework Preset | **Vite** |
   | Root Directory | `frontend` |

6. Expand **Environment Variables**, tambahkan:

   | Key | Value |
   |-----|-------|
   | `VITE_API_BASE_URL` | `https://fintrack-backend.onrender.com` |

   *(URL Render dari step 2)*

7. Klik **Deploy**
8. Tunggu sekitar 1-2 menit
9. Vercel kasih URL — bentuknya:
   ```
   https://fintrack-xxx.vercel.app
   ```
10. Copy URL ini untuk step berikutnya

---

## Step 4 — Update CORS di Render

Sekarang backend perlu tahu URL frontend yang boleh akses.

1. Buka Render dashboard → pilih service `fintrack-backend`
2. Klik **Environment**
3. Edit variable `ALLOWED_ORIGINS`:
   ```
   https://fintrack-xxx.vercel.app
   ```
   *(URL Vercel dari step 3)*
4. Klik **Save Changes** → Render otomatis redeploy

---

## Verifikasi Akhir

Buka URL Vercel di browser dan test flow berikut:

- [ ] Halaman login muncul
- [ ] Register akun baru → berhasil masuk dashboard
- [ ] Dashboard menampilkan data (kosong tapi tidak error)
- [ ] Tambah transaksi → muncul di tabel
- [ ] Buka di HP → tampilan responsif

---

## Troubleshooting

### Render build gagal — `ModuleNotFoundError`
→ Pastikan **Root Directory** diset ke `backend` di Render settings.

### CORS error di browser (blocked by CORS policy)
→ `ALLOWED_ORIGINS` di Render belum diupdate dengan URL Vercel.
→ Pastikan tidak ada trailing slash: `https://fintrack.vercel.app` ✅ bukan `https://fintrack.vercel.app/` ❌

### Backend lambat response pertama (~30 detik)
→ Normal untuk Render free tier — server sleep setelah 15 menit idle.
→ Request pertama akan "wake up" server. Request berikutnya normal.

### `alembic upgrade head` gagal saat deploy
→ Cek log di Render dashboard → bagian **Logs**
→ Pastikan `DATABASE_URL` sudah benar dan Neon database aktif.

### Vercel build gagal
→ Pastikan **Root Directory** diset ke `frontend`
→ Pastikan `VITE_API_BASE_URL` sudah diisi

---

## Catatan Penting

- **Render free tier**: server sleep setelah 15 menit tidak ada request. Untuk personal use tidak masalah.
- **Neon free tier**: 0.5GB storage, cukup untuk ribuan transaksi.
- **Vercel free tier**: unlimited untuk personal project.
- Jangan commit file `.env` ke GitHub — sudah ada di `.gitignore`.
