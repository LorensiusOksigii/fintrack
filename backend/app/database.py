from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


# Engine SQLAlchemy — koneksi ke PostgreSQL
# pool_pre_ping=True: cek koneksi sebelum dipakai (penting untuk Neon serverless)
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    # echo=settings.debug,  # Log semua SQL query saat debug mode
)

# Session factory — digunakan untuk membuat database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """
    Base class untuk semua ORM models.
    Semua model di app/models/ akan mewarisi class ini.
    """
    pass


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency untuk mendapatkan database session.
    Session otomatis ditutup setelah request selesai (via finally).

    Usage di router:
        @router.get("/items")
        def get_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
