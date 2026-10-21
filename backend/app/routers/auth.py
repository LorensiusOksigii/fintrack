"""
Auth Router — HTTP endpoints untuk authentication.

Endpoints:
    POST /api/v1/auth/register  — daftar user baru
    POST /api/v1/auth/login     — login, dapat JWT token
    GET  /api/v1/auth/me        — info user yang sedang login (protected)

Desain:
- Router hanya bertanggung jawab pada HTTP layer:
  validasi request (Pydantic), panggil service, return response.
- Business logic ada di services/auth_service.py.
- Error mapping: ValueError dari service → HTTPException yang tepat.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.exceptions import already_exists_exception, bad_request_exception
from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services import auth_service

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Daftar akun baru",
    description="Membuat akun user baru dan menginisialisasi kategori default.",
)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
) -> UserResponse:
    try:
        return auth_service.register_user(db=db, payload=payload)
    except ValueError as e:
        if "already registered" in str(e):
            raise already_exists_exception("Email")
        raise bad_request_exception(str(e))


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Login dan dapatkan JWT token",
    description=(
        "Autentikasi dengan email dan password. "
        "Kembalikan JWT access token yang harus disertakan "
        "di header Authorization: Bearer <token> untuk semua request berikutnya."
    ),
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    try:
        return auth_service.login_user(db=db, payload=payload)
    except ValueError as e:
        # Gunakan 401 untuk invalid credentials agar konsisten dengan standar HTTP
        raise bad_request_exception(str(e))


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Info user yang sedang login",
    description="Mengembalikan data profil user berdasarkan JWT token yang dikirim.",
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    # get_current_user sudah handle validasi token dan keberadaan user.
    # Router hanya perlu serialize dan return.
    return UserResponse.model_validate(current_user)
