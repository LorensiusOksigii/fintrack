"""
Transaction Service — business logic untuk CRUD transactions.

Ownership rules:
1. Setiap query di-filter oleh user_id.
2. category_id yang dikirim harus milik user yang sama — mencegah
   user A menggunakan kategori milik user B.
3. Type di transaksi harus konsisten dengan type di kategori.
"""

import uuid
from datetime import date

from sqlalchemy import extract, func
from sqlalchemy.orm import Session, joinedload

from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.transaction import (
    PaginationMeta,
    TransactionCreateRequest,
    TransactionFilterParams,
    TransactionListResponse,
    TransactionResponse,
    TransactionUpdateRequest,
)


def _validate_category_ownership(
    db: Session,
    user_id: uuid.UUID,
    category_id: uuid.UUID,
) -> Category:
    """
    Pastikan category_id ada dan milik user.
    Helper internal — tidak diexport.

    Raises:
        ValueError("category_not_found"): Kategori tidak ada atau bukan milik user.
    """
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == user_id)
        .first()
    )
    if not category:
        raise ValueError("category_not_found")
    return category


def get_transactions(
    db: Session,
    user_id: uuid.UUID,
    filters: TransactionFilterParams,
) -> TransactionListResponse:
    """
    Ambil daftar transaksi dengan filter opsional dan pagination.

    Filter yang tersedia: month, year, type, category_id.
    Hasil diurutkan berdasarkan tanggal terbaru.
    """
    query = (
        db.query(Transaction)
        .options(joinedload(Transaction.category))  # Eager load kategori agar tidak N+1
        .filter(Transaction.user_id == user_id)
    )

    # Terapkan filter opsional
    if filters.month is not None:
        query = query.filter(extract("month", Transaction.date) == filters.month)
    if filters.year is not None:
        query = query.filter(extract("year", Transaction.date) == filters.year)
    if filters.type is not None:
        query = query.filter(Transaction.type == filters.type)
    if filters.category_id is not None:
        query = query.filter(Transaction.category_id == filters.category_id)

    # Hitung total sebelum pagination (untuk meta)
    total = query.with_entities(func.count(Transaction.id)).scalar() or 0

    # Terapkan pagination
    offset = (filters.page - 1) * filters.limit
    transactions = (
        query
        .order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .offset(offset)
        .limit(filters.limit)
        .all()
    )

    total_pages = max(1, -(-total // filters.limit))  # Ceiling division

    data = [TransactionResponse.model_validate(t) for t in transactions]

    return TransactionListResponse(
        data=data,
        meta=PaginationMeta(
            total=total,
            page=filters.page,
            limit=filters.limit,
            total_pages=total_pages,
        ),
    )


def get_transaction_by_id(
    db: Session,
    user_id: uuid.UUID,
    transaction_id: uuid.UUID,
) -> Transaction:
    """
    Ambil satu transaksi berdasarkan ID.

    Raises:
        ValueError("not_found"): Jika transaksi tidak ada atau bukan milik user.
    """
    transaction = (
        db.query(Transaction)
        .options(joinedload(Transaction.category))
        .filter(Transaction.id == transaction_id, Transaction.user_id == user_id)
        .first()
    )
    if not transaction:
        raise ValueError("not_found")
    return transaction


def create_transaction(
    db: Session,
    user_id: uuid.UUID,
    payload: TransactionCreateRequest,
) -> TransactionResponse:
    """
    Buat transaksi baru.

    Validasi:
    - category_id harus milik user.
    - type di payload harus sama dengan type di kategori.

    Raises:
        ValueError("category_not_found"): Kategori tidak ada/bukan milik user.
        ValueError("type_mismatch"): Type transaksi tidak cocok dengan kategori.
    """
    category = _validate_category_ownership(db, user_id, payload.category_id)

    # Pastikan tipe transaksi konsisten dengan tipe kategori
    if payload.type != category.type:
        raise ValueError("type_mismatch")

    transaction = Transaction(
        user_id=user_id,
        category_id=payload.category_id,
        type=payload.type,
        amount=payload.amount,
        description=payload.description,
        date=payload.date,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    # Reload dengan eager load untuk include kategori di response
    return TransactionResponse.model_validate(
        get_transaction_by_id(db, user_id, transaction.id)
    )


def update_transaction(
    db: Session,
    user_id: uuid.UUID,
    transaction_id: uuid.UUID,
    payload: TransactionUpdateRequest,
) -> TransactionResponse:
    """
    Update transaksi.

    Jika category_id berubah, validasi ulang ownership dan type consistency.

    Raises:
        ValueError("not_found"): Transaksi tidak ada/bukan milik user.
        ValueError("category_not_found"): Kategori baru tidak ada/bukan milik user.
        ValueError("type_mismatch"): Type tidak konsisten dengan kategori baru.
    """
    transaction = get_transaction_by_id(db, user_id, transaction_id)

    # Tentukan kategori yang berlaku (baru atau existing)
    if payload.category_id is not None and payload.category_id != transaction.category_id:
        category = _validate_category_ownership(db, user_id, payload.category_id)
        # Type yang berlaku: dari payload jika ada, kalau tidak dari transaksi existing
        effective_type = payload.type or transaction.type
        if effective_type != category.type:
            raise ValueError("type_mismatch")
        transaction.category_id = payload.category_id

    if payload.type is not None:
        transaction.type = payload.type
    if payload.amount is not None:
        transaction.amount = payload.amount
    if payload.description is not None:
        transaction.description = payload.description
    if payload.date is not None:
        transaction.date = payload.date

    db.commit()
    db.refresh(transaction)

    return TransactionResponse.model_validate(
        get_transaction_by_id(db, user_id, transaction.id)
    )


def delete_transaction(
    db: Session,
    user_id: uuid.UUID,
    transaction_id: uuid.UUID,
) -> None:
    """
    Hapus transaksi.

    Raises:
        ValueError("not_found"): Transaksi tidak ada atau bukan milik user.
    """
    transaction = get_transaction_by_id(db, user_id, transaction_id)
    db.delete(transaction)
    db.commit()
