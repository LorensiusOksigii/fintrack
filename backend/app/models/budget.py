import uuid
from decimal import Decimal

from sqlalchemy import CheckConstraint, ForeignKey, Index, Integer, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Budget(BaseModel):
    """
    Model untuk tabel budgets.

    Setiap record merepresentasikan batas pengeluaran untuk satu kategori
    dalam satu bulan tertentu.

    Constraint UNIQUE(user_id, category_id, month, year) memastikan
    tidak ada duplikasi budget untuk kombinasi yang sama.
    """

    __tablename__ = "budgets"

    __table_args__ = (
        UniqueConstraint(
            "user_id", "category_id", "month", "year",
            name="uq_budget_user_category_period",
        ),
        CheckConstraint("month >= 1 AND month <= 12", name="ck_budget_month_range"),
        CheckConstraint("year >= 2000", name="ck_budget_year_min"),
        CheckConstraint("amount > 0", name="ck_budget_amount_positive"),
        Index("idx_budgets_user_period", "user_id", "year", "month"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="CASCADE"),
        # CASCADE: hapus kategori → hapus budget terkait (wajar, budget
        # tidak relevan jika kategorinya sudah tidak ada)
        nullable=False,
    )
    amount: Mapped[Decimal] = mapped_column(
        Numeric(15, 2),
        nullable=False,
    )
    month: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    year: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    # --- Relationships ---
    user: Mapped["User"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "User",
        back_populates="budgets",
    )
    category: Mapped["Category"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Category",
        back_populates="budgets",
    )

    def __repr__(self) -> str:
        return (
            f"<Budget id={self.id} category_id={self.category_id} "
            f"month={self.month}/{self.year} amount={self.amount}>"
        )
