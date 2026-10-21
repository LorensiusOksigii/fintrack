import uuid
from enum import Enum as PyEnum

from sqlalchemy import Boolean, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class TransactionType(str, PyEnum):
    """
    Tipe transaksi — dipakai di Category, Transaction, dan Budget.
    Menggunakan str mixin agar nilai enum bisa langsung dipakai
    sebagai string di JSON serialization tanpa konversi manual.
    """

    INCOME = "income"
    EXPENSE = "expense"


class Category(BaseModel):
    """
    Model untuk tabel categories.

    Setiap kategori dimiliki oleh satu user (multi-user ready).
    Constraint UNIQUE(user_id, name, type) mencegah duplikasi nama
    kategori dengan tipe yang sama per user.
    """

    __tablename__ = "categories"

    # UniqueConstraint di level tabel (bukan kolom) karena melibatkan 3 kolom
    __table_args__ = (
        UniqueConstraint("user_id", "name", "type", name="uq_category_user_name_type"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    type: Mapped[TransactionType] = mapped_column(
        String(10),
        nullable=False,
    )
    color: Mapped[str | None] = mapped_column(
        String(7),   # Format hex: #RRGGBB
        nullable=True,
    )
    icon: Mapped[str | None] = mapped_column(
        String(50),  # Nama icon dari lucide-react (misal: "utensils", "car")
        nullable=True,
    )
    is_default: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="True jika kategori ini adalah bawaan sistem (seed data)",
    )

    # --- Relationships ---
    user: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        back_populates="categories",
    )
    transactions: Mapped[list["Transaction"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Transaction",
        back_populates="category",
    )
    budgets: Mapped[list["Budget"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Budget",
        back_populates="category",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Category id={self.id} name={self.name} type={self.type}>"
