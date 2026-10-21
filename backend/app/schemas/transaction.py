"""
Pydantic schemas untuk Transaction endpoints.
"""

import uuid
from datetime import date as DateType
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, Field, field_validator

from app.models.category import TransactionType
from app.schemas.category import CategoryResponse


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class TransactionCreateRequest(BaseModel):
    """Body untuk POST /transactions."""

    category_id: uuid.UUID = Field(
        description="UUID kategori transaksi.",
    )
    type: TransactionType = Field(
        description="Tipe transaksi: income atau expense.",
        examples=["expense"],
    )
    amount: Decimal = Field(
        gt=0,
        max_digits=15,
        decimal_places=2,
        description="Nominal transaksi. Harus lebih dari 0.",
        examples=["50000.00"],
    )
    description: str | None = Field(
        default=None,
        max_length=500,
        description="Catatan opsional untuk transaksi ini.",
        examples=["Makan siang di warteg"],
    )
    date: DateType = Field(
        description="Tanggal transaksi (format: YYYY-MM-DD).",
        examples=["2026-07-17"],
    )

    @field_validator("date")
    @classmethod
    def date_not_future(cls, v: DateType) -> DateType:
        """Tanggal transaksi tidak boleh di masa depan."""
        if v > DateType.today():
            raise ValueError("Tanggal transaksi tidak boleh di masa depan")
        return v

    @field_validator("description")
    @classmethod
    def strip_description(cls, v: str | None) -> str | None:
        return v.strip() if v else v


class TransactionUpdateRequest(BaseModel):
    """Body untuk PUT /transactions/{id} — semua field opsional."""

    category_id: uuid.UUID | None = None
    type: TransactionType | None = None
    amount: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=15,
        decimal_places=2,
    )
    description: str | None = Field(
        default=None,
        max_length=500,
    )
    date: DateType | None = None

    @field_validator("date")
    @classmethod
    def date_not_future(cls, v: DateType | None) -> DateType | None:
        if v and v > DateType.today():
            raise ValueError("Tanggal transaksi tidak boleh di masa depan")
        return v


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class TransactionResponse(BaseModel):
    """Response untuk satu transaksi."""

    id: uuid.UUID
    type: TransactionType
    amount: Decimal
    description: str | None
    date: DateType
    category: CategoryResponse

    model_config = {"from_attributes": True}


class PaginationMeta(BaseModel):
    """Metadata pagination untuk list response."""

    total: int
    page: int
    limit: int
    total_pages: int


class TransactionListResponse(BaseModel):
    """Response untuk GET /transactions dengan pagination."""

    data: list[TransactionResponse]
    meta: PaginationMeta


# ---------------------------------------------------------------------------
# Query params schema
# ---------------------------------------------------------------------------

class TransactionFilterParams(BaseModel):
    """
    Query parameters untuk filter GET /transactions.
    Dipakai sebagai Depends() di router.
    """

    month: int | None = Field(
        default=None,
        ge=1,
        le=12,
        description="Filter bulan (1-12).",
    )
    year: int | None = Field(
        default=None,
        ge=2000,
        description="Filter tahun.",
    )
    type: TransactionType | None = Field(
        default=None,
        description="Filter tipe: income atau expense.",
    )
    category_id: uuid.UUID | None = Field(
        default=None,
        description="Filter berdasarkan kategori.",
    )
    page: int = Field(default=1, ge=1, description="Nomor halaman.")
    limit: int = Field(default=20, ge=1, le=100, description="Jumlah item per halaman.")
