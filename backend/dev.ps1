# Helper script untuk menjalankan backend development server di Windows
# Usage: .\dev.ps1

$env:PYTHONPATH = "."
uvicorn app.main:app --reload
