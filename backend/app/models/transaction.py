import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import Date, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel
from app.models.category import TransactionType


class Transaction(BaseModel):
    """
    Model untuk tabel transactions.

    Desain keputusan:
    - amount menggunakan Numeric(15, 2) bukan Float untuk menghindari
      floating-point precision error pada kalkulasi keuangan.
    - date bertipe Date (bukan DateTime) karena kita hanya butuh tanggal
      transaksi, bukan jam spesifik.
    - type disimpan redundan (selain di category) agar query filter
      berdasarkan type tidak perlu JOIN ke tabel categories.
    """

    __tablename__ = "transactions"

    # Composite index untuk query paling umum: filter by user + date range
    __table_args__ = (
        Index("idx_transactions_user_date", "user_id", "date"),
        Index("idx_transactions_user_category", "user_id", "category_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="RESTRICT"),
        # RESTRICT: cegah hapus kategori jika masih ada transaksi terkait
        nullable=False,
    )
    type: Mapped[TransactionType] = mapped_column(
        String(10),
        nullable=False,
    )
    amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    # --- Relationships ---
    user: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        back_populates="transactions",
    )
    category: Mapped["Category"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Category",
        back_populates="transactions",
    )

    def __repr__(self) -> str:
        return (
            f"<Transaction id={self.id} type={self.type} "
            f"amount={self.amount} date={self.date}>"
        )
