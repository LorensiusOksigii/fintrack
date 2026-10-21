"""
Pydantic schemas untuk Category endpoints.
"""

import uuid

from pydantic import BaseModel, Field, field_validator

from app.models.category import TransactionType


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class CategoryCreateRequest(BaseModel):
    """Body untuk POST /categories."""

    name: str = Field(
        min_length=1,
        max_length=100,
        examples=["Makan Siang"],
    )
    type: TransactionType = Field(
        examples=["expense"],
    )
    color: str | None = Field(
        default=None,
        pattern=r"^#[0-9A-Fa-f]{6}$",  # Validasi format hex: #RRGGBB
        examples=["#f97316"],
    )
    icon: str | None = Field(
        default=None,
        max_length=50,
        examples=["utensils"],
    )

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        return v.strip()


class CategoryUpdateRequest(BaseModel):
    """Body untuk PUT /categories/{id} — semua field opsional."""

    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
    color: str | None = Field(
        default=None,
        pattern=r"^#[0-9A-Fa-f]{6}$",
    )
    icon: str | None = Field(
        default=None,
        max_length=50,
    )

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: str | None) -> str | None:
        return v.strip() if v else v


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class CategoryResponse(BaseModel):
    """Response untuk satu category."""

    id: uuid.UUID
    name: str
    type: TransactionType
    color: str | None
    icon: str | None
    is_default: bool

    model_config = {"from_attributes": True}


class CategoryListResponse(BaseModel):
    """Response untuk GET /categories — dikelompokkan per tipe."""

    income: list[CategoryResponse]
    expense: list[CategoryResponse]
