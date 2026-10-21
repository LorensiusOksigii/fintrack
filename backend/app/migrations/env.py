"""
Alembic environment configuration.

Perbedaan dari template default alembic:
1. DATABASE_URL dibaca dari app.config.settings (pydantic-settings),
   bukan dari alembic.ini — single source of truth untuk config.
2. Semua ORM models diimport via app.models agar Alembic dapat
   mendeteksi perubahan skema secara otomatis (autogenerate).
3. target_metadata diset ke Base.metadata agar --autogenerate bekerja.
"""

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# Import settings dan Base SEBELUM import models
# agar SQLAlchemy registry sudah siap saat models di-load
from app.config import settings
from app.database import Base

# Import semua models — WAJIB agar Alembic mendeteksi semua tabel.
# Tanpa ini, autogenerate tidak akan menghasilkan migration yang benar.
import app.models  # noqa: F401

# ---------------------------------------------------------------------------
# Alembic Config object — akses ke nilai di alembic.ini
# ---------------------------------------------------------------------------
config = context.config

# Override sqlalchemy.url dengan nilai dari pydantic-settings
# Ini menggantikan nilai kosong di alembic.ini
config.set_main_option("sqlalchemy.url", settings.database_url)

# Setup logging dari alembic.ini (jika ada section [loggers])
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata target untuk --autogenerate
# Alembic akan membandingkan state ini dengan skema di database
target_metadata = Base.metadata


# ---------------------------------------------------------------------------
# Migration runners
# ---------------------------------------------------------------------------

def run_migrations_offline() -> None:
    """
    Mode offline: generate SQL script tanpa koneksi ke database.
    Berguna untuk review migration sebelum dijalankan di production.

    Jalankan dengan: alembic upgrade head --sql
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        # Render AS_BATCH untuk kompatibilitas dengan SQLite (tidak relevan
        # untuk PostgreSQL, tapi tidak ada ruginya ditambahkan)
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Mode online: jalankan migration langsung ke database via koneksi aktif.

    Jalankan dengan: alembic upgrade head
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        # NullPool: setiap migration run membuat koneksi baru dan langsung
        # menutupnya — ideal untuk migration (bukan untuk app runtime)
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,  # Deteksi perubahan tipe kolom
        )

        with context.begin_transaction():
            context.run_migrations()


# Pilih mode berdasarkan apakah Alembic dijalankan dengan koneksi aktif
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
