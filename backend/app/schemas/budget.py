"""
Pydantic schemas untuk Budget endpoints.
"""

import uuid
from decimal import Decimal

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class BudgetCreateRequest(BaseModel):
    """Body untuk POST /budgets."""

    category_id: uuid.UUID = Field(
        description="UUID kategori. Harus bertipe 'expense'.",
    )
    amount: Decimal = Field(
        gt=0,
        max_digits=15,
        decimal_places=2,
        description="Limit budget bulanan. Harus lebih dari 0.",
        examples=["500000.00"],
    )
    month: int = Field(
        ge=1,
        le=12,
        description="Bulan (1-12).",
        examples=[7],
    )
    year: int = Field(
        ge=2000,
        description="Tahun.",
        examples=[2026],
    )


class BudgetUpdateRequest(BaseModel):
    """Body untuk PUT /budgets/{id} — hanya amount yang bisa diupdate."""

    amount: Decimal = Field(
        gt=0,
        max_digits=15,
        decimal_places=2,
        description="Limit budget baru.",
        examples=["750000.00"],
    )


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class BudgetResponse(BaseModel):
    """Response untuk satu budget."""

    id: uuid.UUID
    category_id: uuid.UUID
    amount: Decimal
    month: int
    year: int

    # Denormalized dari relasi category untuk kemudahan frontend
    category_name: str
    category_color: str | None
    category_icon: str | None

    model_config = {"from_attributes": True}
