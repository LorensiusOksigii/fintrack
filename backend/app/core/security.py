"""
Security utilities — password hashing dan JWT token management.

Semua operasi kriptografi dikumpulkan di sini agar:
1. Mudah di-test secara terisolasi.
2. Mudah diganti implementasinya tanpa menyentuh business logic.
3. Tidak ada logic kriptografi yang tersebar di berbagai file.
"""

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

# ---------------------------------------------------------------------------
# Password Hashing (bcrypt)
# ---------------------------------------------------------------------------

# CryptContext menggunakan bcrypt dengan auto-upgrade scheme.
# deprecated="auto" berarti hash lama akan di-upgrade saat user login berikutnya.
# truncate_error=False: nonaktifkan error passlib terbaru soal password > 72 bytes.
# bcrypt memang truncate password di 72 bytes secara by design — ini bukan bug,
# tapi batasan algoritma bcrypt itu sendiri. Untuk app personal ini sudah cukup aman.
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
    truncate_error=False,
)


def hash_password(plain_password: str) -> str:
    """
    Hash plain text password menggunakan bcrypt.

    bcrypt dipilih karena:
    - Secara by design lambat (cost factor), memperlambat brute-force.
    - Otomatis menyertakan salt — tidak perlu generate manual.
    - Widely adopted dan well-audited.

    Args:
        plain_password: Password dalam bentuk plain text.

    Returns:
        Hashed password string (mengandung algoritma + salt + hash).
    """
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifikasi plain text password terhadap hashed password.

    Args:
        plain_password: Password yang dikirim user saat login.
        hashed_password: Hash yang tersimpan di database.

    Returns:
        True jika cocok, False jika tidak.
    """
    return pwd_context.verify(plain_password, hashed_password)


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
