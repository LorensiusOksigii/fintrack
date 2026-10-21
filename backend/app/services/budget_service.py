"""
Budget Service — business logic untuk CRUD budgets.

Rules:
1. Budget hanya bisa dibuat untuk kategori bertipe 'expense'.
   Tidak ada artinya membuat budget untuk pemasukan.
2. Satu budget per (user, category, month, year) — unique constraint.
3. Ownership: user hanya bisa akses budget miliknya sendiri.
4. category_id harus milik user yang sama.
"""

import uuid

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.models.budget import Budget
from app.models.category import Category, TransactionType
from app.schemas.budget import BudgetCreateRequest, BudgetResponse, BudgetUpdateRequest


def _to_response(budget: Budget) -> BudgetResponse:
    """
    Konversi Budget ORM object ke BudgetResponse.
    Category harus sudah di-eager load sebelum memanggil ini.
    """
    return BudgetResponse(
        id=budget.id,
        category_id=budget.category_id,
        amount=budget.amount,
        month=budget.month,
        year=budget.year,
        category_name=budget.category.name,
        category_color=budget.category.color,
        category_icon=budget.category.icon,
    )


def _load_budget(
    db: Session,
    user_id: uuid.UUID,
    budget_id: uuid.UUID,
) -> Budget:
    """
    Helper: ambil budget dengan eager load category.

    Raises:
        ValueError("not_found"): Budget tidak ada atau bukan milik user.
    """
    budget = (
        db.query(Budget)
        .options(joinedload(Budget.category))
        .filter(Budget.id == budget_id, Budget.user_id == user_id)
        .first()
    )
    if not budget:
        raise ValueError("not_found")
    return budget


def get_budgets(
    db: Session,
    user_id: uuid.UUID,
    month: int,
    year: int,
) -> list[BudgetResponse]:
    """
    Ambil semua budget user untuk bulan dan tahun tertentu.
    Diurutkan berdasarkan nama kategori.
    """
    budgets = (
        db.query(Budget)
        .options(joinedload(Budget.category))
        .filter(
            Budget.user_id == user_id,
            Budget.month == month,
            Budget.year == year,
        )
        .order_by(Budget.category_id)
        .all()
    )
    return [_to_response(b) for b in budgets]


def create_budget(
    db: Session,
    user_id: uuid.UUID,
    payload: BudgetCreateRequest,
) -> BudgetResponse:
    """
    Buat budget baru untuk satu kategori di satu bulan.

    Raises:
        ValueError("category_not_found"): Kategori tidak ada atau bukan milik user.
        ValueError("income_category"): Kategori bertipe income — tidak bisa di-budget.
        ValueError("duplicate"): Budget untuk kombinasi ini sudah ada.
    """
    # Validasi kategori
    category = (
        db.query(Category)
        .filter(Category.id == payload.category_id, Category.user_id == user_id)
        .first()
    )
    if not category:
        raise ValueError("category_not_found")

    if category.type == TransactionType.INCOME:
        raise ValueError("income_category")

    budget = Budget(
        user_id=user_id,
        category_id=payload.category_id,
        amount=payload.amount,
        month=payload.month,
        year=payload.year,
    )
    db.add(budget)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # Unique constraint (user, category, month, year) terpicu
        raise ValueError("duplicate")

    db.refresh(budget)

    # Reload dengan eager load
    return _to_response(_load_budget(db, user_id, budget.id))


def update_budget(
    db: Session,
    user_id: uuid.UUID,
    budget_id: uuid.UUID,
    payload: BudgetUpdateRequest,
) -> BudgetResponse:
    """
    Update nominal budget. Hanya amount yang bisa diubah —
    category, month, year bersifat immutable setelah dibuat.

    Raises:
        ValueError("not_found"): Budget tidak ada atau bukan milik user.
    """
    budget = _load_budget(db, user_id, budget_id)
    budget.amount = payload.amount
    db.commit()
    db.refresh(budget)
    return _to_response(_load_budget(db, user_id, budget_id))


def delete_budget(
    db: Session,
    user_id: uuid.UUID,
    budget_id: uuid.UUID,
) -> None:
    """
    Hapus budget.

    Raises:
        ValueError("not_found"): Budget tidak ada atau bukan milik user.
    """
    budget = _load_budget(db, user_id, budget_id)
    db.delete(budget)
    db.commit()
