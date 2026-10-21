"""
Summary Router — analytics endpoints untuk dashboard.

Endpoints:
    GET /api/v1/summary/monthly            — total income, expense, balance
    GET /api/v1/summary/budget-progress    — budget vs aktual per kategori
    GET /api/v1/summary/trends             — tren 6 bulan terakhir
    GET /api/v1/summary/category-breakdown — pie chart pengeluaran per kategori

Semua endpoint protected — butuh JWT token.
Default query params: bulan dan tahun berjalan.
"""

from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.summary import (
    BudgetProgressResponse,
    CategoryBreakdownResponse,
    MonthlySummaryResponse,
    TrendResponse,
)
from app.services import summary_service

router = APIRouter()

# Default ke bulan dan tahun berjalan saat module di-load
_TODAY = date.today()


@router.get(
    "/monthly",
    response_model=MonthlySummaryResponse,
    summary="Ringkasan keuangan bulanan",
    description="Total pemasukan, pengeluaran, dan saldo untuk bulan tertentu.",
)
def get_monthly_summary(
    month: int = Query(default=_TODAY.month, ge=1, le=12, description="Bulan (1-12)"),
    year: int = Query(default=_TODAY.year, ge=2000, description="Tahun"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MonthlySummaryResponse:
    return summary_service.get_monthly_summary(
        db=db,
        user_id=current_user.id,
        month=month,
        year=year,
    )


@router.get(
    "/budget-progress",
    response_model=BudgetProgressResponse,
    summary="Progress budget vs aktual",
    description=(
        "Perbandingan budget yang ditetapkan vs pengeluaran aktual per kategori. "
        "Hanya kategori yang memiliki budget yang ditampilkan."
    ),
)
def get_budget_progress(
    month: int = Query(default=_TODAY.month, ge=1, le=12, description="Bulan (1-12)"),
    year: int = Query(default=_TODAY.year, ge=2000, description="Tahun"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BudgetProgressResponse:
    return summary_service.get_budget_progress(
        db=db,
        user_id=current_user.id,
        month=month,
        year=year,
    )


@router.get(
    "/trends",
    response_model=TrendResponse,
    summary="Tren keuangan bulanan",
    description="Tren pemasukan vs pengeluaran untuk N bulan terakhir (default 6).",
)
def get_trends(
    months: int = Query(default=6, ge=1, le=24, description="Jumlah bulan ke belakang (1-24)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TrendResponse:
    return summary_service.get_monthly_trends(
        db=db,
        user_id=current_user.id,
        months=months,
    )


@router.get(
    "/category-breakdown",
    response_model=CategoryBreakdownResponse,
    summary="Breakdown pengeluaran per kategori",
    description="Total pengeluaran per kategori beserta persentasenya. Dipakai untuk pie chart.",
)
def get_category_breakdown(
    month: int = Query(default=_TODAY.month, ge=1, le=12, description="Bulan (1-12)"),
    year: int = Query(default=_TODAY.year, ge=2000, description="Tahun"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CategoryBreakdownResponse:
    return summary_service.get_category_breakdown(
        db=db,
        user_id=current_user.id,
        month=month,
        year=year,
    )
