"""
FastAPI dependencies untuk FinTrack API.

Dependencies di-inject via Depends() di setiap router yang membutuhkannya.
Pendekatan ini memisahkan concern: router hanya handle HTTP layer,
logic autentikasi ada di sini.

Pola penggunaan di router:
    from app.core.dependencies import get_current_user

    @router.get("/me")
    def get_me(current_user: User = Depends(get_current_user)):
        return current_user
"""

import uuid

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.exceptions import credentials_exception, inactive_user_exception
from app.core.security import decode_access_token
from app.database import get_db
from app.models.user import User

# OAuth2PasswordBearer:
# - Mendefinisikan bahwa token diambil dari header "Authorization: Bearer <token>"
# - tokenUrl adalah endpoint untuk mendapatkan token (dipakai Swagger UI)
# - auto_error=True: FastAPI otomatis return 401 jika header tidak ada
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency utama untuk protected endpoints.

    Alur:
    1. Ambil JWT token dari Authorization header.
    2. Decode token → dapatkan user_id (subject).
    3. Query user dari database berdasarkan user_id.
    4. Verifikasi user aktif.
    5. Return user object ke route handler.

    Raises:
        HTTPException 401: Token invalid/expired atau user tidak ditemukan.
        HTTPException 400: User account tidak aktif.
    """
    try:
        user_id_str = decode_access_token(token)
        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        # ValueError: user_id_str bukan UUID valid
        raise credentials_exception()

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception()

    if not user.is_active:
        raise inactive_user_exception()

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Alias eksplisit untuk get_current_user.
    Dipakai di endpoint yang ingin lebih deskriptif tentang requirement-nya.
    Logika is_active sudah ada di get_current_user, ini hanya readability.
    """
    return current_user
