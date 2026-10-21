"""
Transactions Router — CRUD endpoints untuk transaksi keuangan.

Endpoints:
    GET    /api/v1/transactions           — list transaksi (filter + pagination)
    POST   /api/v1/transactions           — catat transaksi baru
    GET    /api/v1/transactions/{id}      — detail satu transaksi
    PUT    /api/v1/transactions/{id}      — update transaksi
    DELETE /api/v1/transactions/{id}      — hapus transaksi
"""

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.exceptions import bad_request_exception, not_found_exception
from app.database import get_db
from app.models.category import TransactionType
from app.models.user import User
from app.schemas.transaction import (
    TransactionCreateRequest,
    TransactionFilterParams,
    TransactionListResponse,
    TransactionResponse,
    TransactionUpdateRequest,
)
from app.services import transaction_service

router = APIRouter()


@router.get(
    "",
    response_model=TransactionListResponse,
    summary="List transaksi",
    description="Daftar transaksi dengan filter opsional (bulan, tahun, tipe, kategori) dan pagination.",
)
def get_transactions(
    # Query params didefinisikan manual agar Swagger UI bisa render dengan benar
    month: int | None = Query(default=None, ge=1, le=12, description="Filter bulan (1-12)"),
    year: int | None = Query(default=None, ge=2000, description="Filter tahun"),
    type: TransactionType | None = Query(default=None, description="Filter tipe: income/expense"),
    category_id: uuid.UUID | None = Query(default=None, description="Filter kategori"),
    page: int = Query(default=1, ge=1, description="Nomor halaman"),
    limit: int = Query(default=20, ge=1, le=100, description="Item per halaman"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TransactionListResponse:
    filters = TransactionFilterParams(
        month=month,
        year=year,
        type=type,
        category_id=category_id,
        page=page,
        limit=limit,
    )
    return transaction_service.get_transactions(
        db=db,
        user_id=current_user.id,
        filters=filters,
    )


@router.post(
    "",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Catat transaksi baru",
)
def create_transaction(
    payload: TransactionCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TransactionResponse:
    try:
        return transaction_service.create_transaction(
            db=db,
            user_id=current_user.id,
            payload=payload,
        )
    except ValueError as e:
        err = str(e)
        if "category_not_found" in err:
            raise not_found_exception("Category")
        if "type_mismatch" in err:
            raise bad_request_exception(
                "Tipe transaksi tidak sesuai dengan tipe kategori yang dipilih"
            )
        raise bad_request_exception(err)


@router.get(
    "/{transaction_id}",
    response_model=TransactionResponse,
    summary="Detail transaksi",
)
def get_transaction(
    transaction_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TransactionResponse:
    try:
        transaction = transaction_service.get_transaction_by_id(
            db=db,
            user_id=current_user.id,
            transaction_id=transaction_id,
        )
        return TransactionResponse.model_validate(transaction)
    except ValueError:
        raise not_found_exception("Transaction")


@router.put(
    "/{transaction_id}",
    response_model=TransactionResponse,
    summary="Update transaksi",
)
def update_transaction(
    transaction_id: uuid.UUID,
    payload: TransactionUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TransactionResponse:
    try:
        return transaction_service.update_transaction(
            db=db,
            user_id=current_user.id,
            transaction_id=transaction_id,
            payload=payload,
        )
    except ValueError as e:
        err = str(e)
        if "not_found" in err:
            raise not_found_exception("Transaction")
        if "category_not_found" in err:
            raise not_found_exception("Category")
        if "type_mismatch" in err:
            raise bad_request_exception(
                "Tipe transaksi tidak sesuai dengan tipe kategori yang dipilih"
            )
        raise bad_request_exception(err)


@router.delete(
    "/{transaction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Hapus transaksi",
)
def delete_transaction(
    transaction_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    try:
        transaction_service.delete_transaction(
            db=db,
            user_id=current_user.id,
            transaction_id=transaction_id,
        )
    except ValueError:
        raise not_found_exception("Transaction")
