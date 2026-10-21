"""
Pydantic schemas untuk Summary/Analytics endpoints.

Setiap schema dirancang untuk kebutuhan spesifik satu chart atau card
di dashboard frontend — tidak ada field yang tidak perlu.
"""

from decimal import Decimal

import uuid
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Monthly Summary — untuk SummaryCards di dashboard
# ---------------------------------------------------------------------------

class MonthlySummaryResponse(BaseModel):
    """
    Response untuk GET /summary/monthly.
    Dipakai untuk 3 kartu ringkasan di dashboard:
    Total Pemasukan | Total Pengeluaran | Saldo
    """

    month: int
    year: int
    total_income: Decimal
    total_expense: Decimal
    balance: Decimal  # total_income - total_expense


# ---------------------------------------------------------------------------
# Budget Progress — untuk progress bar per kategori
# ---------------------------------------------------------------------------

class BudgetProgressItem(BaseModel):
    """Progress satu kategori budget vs aktual."""

    category_id: uuid.UUID
    category_name: str
    category_color: str | None
    category_icon: str | None
    budget_amount: Decimal
    spent_amount: Decimal
    remaining_amount: Decimal
    percentage_used: float
    is_over_budget: bool


class BudgetProgressResponse(BaseModel):
    """Response untuk GET /summary/budget-progress."""

    month: int
    year: int
    items: list[BudgetProgressItem]


# ---------------------------------------------------------------------------
# Monthly Trend — untuk line chart 6 bulan
# ---------------------------------------------------------------------------

class MonthlyTrendItem(BaseModel):
    """Data satu bulan untuk trend chart."""

    month: int
    year: int
    month_label: str    # Format: "Jan", "Feb", dst — untuk label X axis
    total_income: Decimal
    total_expense: Decimal
    balance: Decimal


class TrendResponse(BaseModel):
    """Response untuk GET /summary/trends."""

    items: list[MonthlyTrendItem]


# ---------------------------------------------------------------------------
# Category Breakdown — untuk pie chart pengeluaran per kategori
# ---------------------------------------------------------------------------

class CategoryBreakdownItem(BaseModel):
    """Data satu kategori untuk pie chart."""

    category_id: uuid.UUID
    category_name: str
    category_color: str | None
    category_icon: str | None
    total_amount: Decimal
    percentage: float = Field(
        description="Persentase dari total pengeluaran bulan ini (0-100).",
    )


class CategoryBreakdownResponse(BaseModel):
    """Response untuk GET /summary/category-breakdown."""

    month: int
    year: int
    total_expense: Decimal
    items: list[CategoryBreakdownItem]
