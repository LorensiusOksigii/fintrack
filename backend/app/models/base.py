import uuid
from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class TimestampMixin:
    """
    Mixin yang menambahkan kolom created_at dan updated_at ke setiap model.

    - created_at: diisi otomatis saat record pertama kali dibuat (server_default).
    - updated_at: diisi otomatis saat record dibuat, lalu di-update tiap kali
      record diubah (onupdate).
    - Menggunakan func.now() agar timestamp diambil dari database server,
      bukan dari application server — konsisten meski ada timezone diff.
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class UUIDMixin:
    """
    Mixin yang menambahkan kolom id bertipe UUID sebagai primary key.

    - Default UUID di-generate oleh database (gen_random_uuid()) —
      lebih efisien dan konsisten dibanding generate di Python.
    - UUID dipilih atas integer karena tidak predictable (lebih aman
      untuk public API) dan memudahkan distributed systems di masa depan.
    """

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid(),
        nullable=False,
    )


class BaseModel(UUIDMixin, TimestampMixin, Base):
    """
    Abstract base class untuk semua ORM models FinTrack.
    Mewarisi UUIDMixin, TimestampMixin, dan SQLAlchemy Base.

    Semua model cukup mewarisi BaseModel:
        class User(BaseModel):
            __tablename__ = "users"
            ...
    """

    __abstract__ = True  # SQLAlchemy tidak akan membuat tabel untuk class ini
