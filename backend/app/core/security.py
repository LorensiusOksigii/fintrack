"""
Security utilities — password hashing dan JWT token management.

Semua operasi kriptografi dikumpulkan di sini agar:
1. Mudah di-test secara terisolasi.
2. Mudah diganti implementasinya tanpa menyentuh business logic.
3. Tidak ada logic kriptografi yang tersebar di berbagai file.
"""

from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.config import settings

# ---------------------------------------------------------------------------
# Password Hashing (bcrypt langsung, tanpa passlib)
# ---------------------------------------------------------------------------
# Menggunakan bcrypt library langsung karena passlib 1.7.4 + bcrypt 4.x+
# tidak kompatibel untuk parameter truncate_error.


def hash_password(plain_password: str) -> str:
    """Hash plain text password menggunakan bcrypt."""
    pwd_bytes = plain_password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifikasi plain text password terhadap hashed password."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


# ---------------------------------------------------------------------------
# JWT Token
# ---------------------------------------------------------------------------

def create_access_token(subject: str) -> tuple[str, datetime]:
    """
    Buat JWT access token untuk user.

    Payload JWT berisi:
    - sub (subject): user ID dalam bentuk string.
    - exp (expiration): waktu kedaluwarsa token.
    - iat (issued at): waktu token dibuat.

    Args:
        subject: Identifier unik user (biasanya UUID string).

    Returns:
        Tuple (token_string, expiry_datetime).
    """
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.access_token_expire_minutes)

    payload = {
        "sub": subject,
        "exp": expire,
        "iat": now,
    }

    token = jwt.encode(
        payload,
        settings.secret_key,
        algorithm=settings.algorithm,
    )

    return token, expire


def decode_access_token(token: str) -> str:
    """
    Decode dan validasi JWT access token.

    Validasi yang dilakukan oleh jose secara otomatis:
    - Signature valid (secret key cocok).
    - Token belum expired (exp claim).

    Args:
        token: JWT string dari Authorization header.

    Returns:
        Subject (user ID) dari token payload.

    Raises:
        JWTError: Jika token invalid, expired, atau signature tidak cocok.
    """
    payload = jwt.decode(
        token,
        settings.secret_key,
        algorithms=[settings.algorithm],
    )

    subject: str | None = payload.get("sub")
    if subject is None:
        raise JWTError("Token payload missing 'sub' claim")

    return subject
