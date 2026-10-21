"""
Budgets Router — CRUD endpoints untuk budget bulanan.

Endpoints:
    GET    /api/v1/budgets           — list budget bulan tertentu
    POST   /api/v1/budgets           — set budget baru
    PUT    /api/v1/budgets/{id}      — update nominal budget
    DELETE /api/v1/budgets/{id}      — hapus budget
"""

import uuid
from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.exceptions import already_exists_exception, bad_request_exception, not_found_exception
from app.database import get_db
from app.models.user import User
from app.schemas.budget import BudgetCreateRequest, BudgetResponse, BudgetUpdateRequest
from app.services import budget_service

router = APIRouter()


@router.get(
    "",
    response_model=list[BudgetResponse],
    summary="List budget bulanan",
    description="Ambil semua budget user untuk bulan dan tahun tertentu. Default: bulan berjalan.",
)
def get_budgets(
    month: int = Query(default=date.today().month, ge=1, le=12, description="Bulan (1-12)"),
    year: int = Query(default=date.today().year, ge=2000, description="Tahun"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[BudgetResponse]:
    return budget_service.get_budgets(
        db=db,
        user_id=current_user.id,
        month=month,
        year=year,
    )


@router.post(
    "",
    response_model=BudgetResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Set budget baru",
    description="Buat budget untuk satu kategori expense di satu bulan. Satu budget per kombinasi kategori + bulan + tahun.",
)
def create_budget(
    payload: BudgetCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BudgetResponse:
    try:
        return budget_service.create_budget(
            db=db,
            user_id=current_user.id,
            payload=payload,
        )
    except ValueError as e:
        err = str(e)
        if "category_not_found" in err:
            raise not_found_exception("Category")
        if "income_category" in err:
            raise bad_request_exception("Budget hanya bisa dibuat untuk kategori bertipe 'expense'")
        if "duplicate" in err:
            raise already_exists_exception("Budget untuk kategori dan periode ini")
        raise bad_request_exception(err)


@router.put(
    "/{budget_id}",
    response_model=BudgetResponse,
    summary="Update nominal budget",
)
def update_budget(
    budget_id: uuid.UUID,
    payload: BudgetUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BudgetResponse:
    try:
        return budget_service.update_budget(
            db=db,
            user_id=current_user.id,
            budget_id=budget_id,
            payload=payload,
        )
    except ValueError as e:
        if "not_found" in str(e):
            raise not_found_exception("Budget")
        raise bad_request_exception(str(e))


@router.delete(
    "/{budget_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Hapus budget",
)
def delete_budget(
    budget_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    try:
        budget_service.delete_budget(
            db=db,
            user_id=current_user.id,
            budget_id=budget_id,
        )
    except ValueError:
        raise not_found_exception("Budget")
