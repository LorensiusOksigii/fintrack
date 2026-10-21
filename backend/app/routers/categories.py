"""
Categories Router — CRUD endpoints untuk kategori transaksi.

Endpoints:
    GET    /api/v1/categories           — list semua kategori (grouped by type)
    POST   /api/v1/categories           — buat kategori baru
    PUT    /api/v1/categories/{id}      — update kategori
    DELETE /api/v1/categories/{id}      — hapus kategori
"""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.exceptions import already_exists_exception, bad_request_exception, not_found_exception
from app.database import get_db
from app.models.user import User
from app.schemas.category import (
    CategoryCreateRequest,
    CategoryListResponse,
    CategoryResponse,
    CategoryUpdateRequest,
)
from app.services import category_service

router = APIRouter()


@router.get(
    "",
    response_model=CategoryListResponse,
    summary="List semua kategori",
    description="Mengembalikan kategori milik user yang sedang login, dikelompokkan per tipe.",
)
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CategoryListResponse:
    return category_service.get_categories(db=db, user_id=current_user.id)


@router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Buat kategori baru",
)
def create_category(
    payload: CategoryCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CategoryResponse:
    try:
        return category_service.create_category(
            db=db,
            user_id=current_user.id,
            payload=payload,
        )
    except ValueError as e:
        if "duplicate" in str(e):
            raise already_exists_exception(f"Kategori '{payload.name}' dengan tipe {payload.type}")
        raise bad_request_exception(str(e))


@router.put(
    "/{category_id}",
    response_model=CategoryResponse,
    summary="Update kategori",
)
def update_category(
    category_id: uuid.UUID,
    payload: CategoryUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CategoryResponse:
    try:
        return category_service.update_category(
            db=db,
            user_id=current_user.id,
            category_id=category_id,
            payload=payload,
        )
    except ValueError as e:
        err = str(e)
        if "not_found" in err:
            raise not_found_exception("Category")
        if "duplicate" in err:
            raise already_exists_exception("Category dengan nama tersebut")
        raise bad_request_exception(err)


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Hapus kategori",
    description="Kategori default dan kategori yang masih dipakai transaksi tidak bisa dihapus.",
)
def delete_category(
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    try:
        category_service.delete_category(
            db=db,
            user_id=current_user.id,
            category_id=category_id,
        )
    except ValueError as e:
        err = str(e)
        if "not_found" in err:
            raise not_found_exception("Category")
        if "is_default" in err:
            raise bad_request_exception("Kategori default tidak dapat dihapus")
        if "has_transactions" in err:
            raise bad_request_exception(
                "Kategori tidak dapat dihapus karena masih digunakan oleh transaksi"
            )
        raise bad_request_exception(err)
