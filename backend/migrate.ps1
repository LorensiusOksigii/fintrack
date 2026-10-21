# Helper script untuk menjalankan Alembic di Windows
# Usage: .\migrate.ps1 upgrade head
#        .\migrate.ps1 downgrade -1
#        .\migrate.ps1 revision --autogenerate -m "nama migration"

$env:PYTHONPATH = "."
alembic @args
