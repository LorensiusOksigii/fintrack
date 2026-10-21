"""
Auth Service — business logic untuk register dan login.

Prinsip desain:
- Service tidak tahu soal HTTP (tidak ada HTTPException di sini).
- Service hanya raise ValueError/Exception jika ada error bisnis.
- Router yang menangkap exception dan mengubahnya ke HTTPException.
- Memudahkan unit testing tanpa perlu mock HTTP layer.
"""

from datetime import datetime

from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.seeds.categories import seed_default_categories


def register_user(db: Session, payload: RegisterRequest) -> UserResponse:
    """
    Daftarkan user baru.

    Alur:
    1. Cek apakah email sudah terdaftar.
    2. Hash password.
    3. Simpan user baru ke database.
    4. Seed default categories untuk user baru.
    5. Commit dan return UserResponse.

    Args:
        db: SQLAlchemy session.
        payload: Data register dari client.

    Returns:
        UserResponse berisi data user yang baru dibuat.

    Raises:
        ValueError: Jika email sudah terdaftar.
    """
    # 1. Cek duplikasi email — case-insensitive
    existing = db.query(User).filter(
        User.email == payload.email.lower()
    ).first()
    if existing:
        raise ValueError("Email already registered")

    # 2. Buat user baru
    user = User(
        email=payload.email.lower(),
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        is_active=True,
    )
    db.add(user)
    db.flush()  # Dapatkan user.id tanpa commit dulu

    # 3. Seed default categories untuk user baru
    seed_default_categories(db=db, user_id=user.id)

    # 4. Commit semua (user + categories) dalam satu transaction
    db.commit()
    db.refresh(user)

    return UserResponse.model_validate(user)


def login_user(db: Session, payload: LoginRequest) -> TokenResponse:
    """
    Login user dan kembalikan JWT access token.

    Alur:
    1. Cari user berdasarkan email.
    2. Verifikasi password.
    3. Cek user aktif.
    4. Generate JWT token.
    5. Return TokenResponse.

    Catatan keamanan:
    - Pesan error dibuat generik ("Invalid credentials") untuk mencegah
      user enumeration attack — attacker tidak tahu apakah email ada atau tidak.

    Args:
        db: SQLAlchemy session.
        payload: Data login dari client.

    Returns:
        TokenResponse berisi access_token dan metadata.

    Raises:
        ValueError: Jika credentials tidak valid atau user tidak aktif.
    """
    # 1. Cari user (case-insensitive email)
    user = db.query(User).filter(
        User.email == payload.email.lower()
    ).first()

    # 2. Verifikasi — pesan error SENGAJA generik
    if not user or not verify_password(payload.password, user.hashed_password):
        raise ValueError("Invalid email or password")

    # 3. Cek aktif
    if not user.is_active:
        raise ValueError("Account is inactive")

    # 4. Generate token
    token, expires_at = create_access_token(subject=str(user.id))

    # 5. Hitung expires_in dalam detik
    now = datetime.utcnow()
    expires_in = int((expires_at.replace(tzinfo=None) - now).total_seconds())

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=expires_in,
    )
