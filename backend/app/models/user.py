from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class User(BaseModel):
    """
    Model untuk tabel users.

    Single-user app, tapi tetap pakai tabel users agar:
    1. Auth flow (JWT) bisa diimplementasi dengan standar.
    2. Mudah dikembangkan ke multi-user di masa depan tanpa migrasi besar.
    """

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,  # Index untuk lookup saat login
    )
    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    hashed_password: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # --- Relationships ---
    # cascade="all, delete-orphan": hapus user → hapus semua data terkait
    categories: Mapped[list["Category"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Category",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    transactions: Mapped[list["Transaction"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Transaction",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    budgets: Mapped[list["Budget"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Budget",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email}>"
