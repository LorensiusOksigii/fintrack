"""
Category Service — business logic untuk CRUD categories.

Ownership rule yang diterapkan di semua operasi:
- Query selalu di-filter dengan user_id dari token JWT.
- User tidak bisa membaca, mengubah, atau menghapus kategori milik user lain.
- Kategori default (is_default=True) tidak bisa dihapus.
- Kategori yang masih dipakai transaksi tidak bisa dihapus
  (dijaga oleh FK RESTRICT di database, ditangkap di sini sebagai pesan yang jelas).
"""

import uuid

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.category import Category, TransactionType
from app.schemas.category import (
    CategoryCreateRequest,
    CategoryListResponse,
    CategoryResponse,
    CategoryUpdateRequest,
)


def get_categories(db: Session, user_id: uuid.UUID) -> CategoryListResponse:
    """
    Ambil semua kategori milik user, dikelompokkan per tipe.

    Returns:
        CategoryListResponse dengan field income[] dan expense[].
    """
    categories = (
        db.query(Category)
        .filter(Category.user_id == user_id)
        .order_by(Category.is_default.desc(), Category.name.asc())
        .all()
    )

    income = [CategoryResponse.model_validate(c) for c in categories if c.type == TransactionType.INCOME]
    expense = [CategoryResponse.model_validate(c) for c in categories if c.type == TransactionType.EXPENSE]

    return CategoryListResponse(income=income, expense=expense)


def get_category_by_id(
    db: Session,
    user_id: uuid.UUID,
    category_id: uuid.UUID,
) -> Category:
    """
    Ambil satu kategori berdasarkan ID.

    Raises:
        ValueError("not_found"): Jika kategori tidak ada atau bukan milik user.
    """
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == user_id)
        .first()
    )
    if not category:
        raise ValueError("not_found")
    return category


def create_category(
    db: Session,
    user_id: uuid.UUID,
    payload: CategoryCreateRequest,
) -> CategoryResponse:
    """
    Buat kategori baru.

    Raises:
        ValueError("duplicate"): Jika nama + type sudah ada untuk user ini.
    """
    # Cek duplikasi nama + type untuk user yang sama
    existing = (
        db.query(Category)
        .filter(
            Category.user_id == user_id,
            Category.name == payload.name,
            Category.type == payload.type,
        )
        .first()
    )
    if existing:
        raise ValueError("duplicate")

    category = Category(
        user_id=user_id,
        name=payload.name,
        type=payload.type,
        color=payload.color,
        icon=payload.icon,
        is_default=False,
    )
    db.add(category)
    db.commit()
    db.refresh(category)

    return CategoryResponse.model_validate(category)


def update_category(
    db: Session,
    user_id: uuid.UUID,
    category_id: uuid.UUID,
    payload: CategoryUpdateRequest,
) -> CategoryResponse:
    """
    Update nama, warna, atau icon kategori.

    Catatan:
    - Type tidak bisa diubah setelah dibuat — bisa menyebabkan inkonsistensi
      dengan transaksi yang sudah ada.
    - Default categories tetap bisa diupdate (warna/icon) tapi tipenya tidak.

    Raises:
        ValueError("not_found"): Kategori tidak ada atau bukan milik user.
        ValueError("duplicate"): Nama baru konflik dengan kategori lain.
    """
    category = get_category_by_id(db, user_id, category_id)

    # Cek duplikasi nama baru (jika ada perubahan nama)
    if payload.name and payload.name != category.name:
        existing = (
            db.query(Category)
            .filter(
                Category.user_id == user_id,
                Category.name == payload.name,
                Category.type == category.type,
                Category.id != category_id,
            )
            .first()
        )
        if existing:
            raise ValueError("duplicate")
        category.name = payload.name

    if payload.color is not None:
        category.color = payload.color
    if payload.icon is not None:
        category.icon = payload.icon

    db.commit()
    db.refresh(category)

    return CategoryResponse.model_validate(category)


def delete_category(
    db: Session,
    user_id: uuid.UUID,
    category_id: uuid.UUID,
) -> None:
    """
    Hapus kategori.

    Raises:
        ValueError("not_found"): Kategori tidak ada atau bukan milik user.
        ValueError("is_default"): Kategori default tidak bisa dihapus.
        ValueError("has_transactions"): Kategori masih dipakai transaksi.
    """
    category = get_category_by_id(db, user_id, category_id)

    if category.is_default:
        raise ValueError("is_default")

    try:
        db.delete(category)
        db.commit()
    except IntegrityError:
        db.rollback()
        # FK RESTRICT dari tabel transactions terpicu
        raise ValueError("has_transactions")
