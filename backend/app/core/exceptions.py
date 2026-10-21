"""
Custom HTTP exceptions untuk FinTrack API.

Menggunakan HTTPException dari FastAPI dengan pesan error yang konsisten.
Semua exception didefinisikan sebagai fungsi factory (bukan class) agar
mudah dipakai di mana saja tanpa perlu import HTTPException langsung.

Keuntungan pendekatan ini:
- Error message konsisten di seluruh aplikasi.
- Mudah diubah pesan/status code di satu tempat.
- Caller cukup: raise credentials_exception()
"""

from fastapi import HTTPException, status


def credentials_exception() -> HTTPException:
    """
    401 Unauthorized — token tidak ada, invalid, atau expired.
    Header WWW-Authenticate wajib ada sesuai RFC 6750 (Bearer token).
    """
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


def not_found_exception(resource: str = "Resource") -> HTTPException:
    """404 Not Found — resource tidak ditemukan."""
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"{resource} not found",
    )


def already_exists_exception(resource: str = "Resource") -> HTTPException:
    """409 Conflict — resource sudah ada (misal: email sudah terdaftar)."""
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=f"{resource} already exists",
    )


def forbidden_exception() -> HTTPException:
    """403 Forbidden — user tidak punya akses ke resource ini."""
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Not enough permissions",
    )


def bad_request_exception(detail: str = "Bad request") -> HTTPException:
    """400 Bad Request — input tidak valid secara bisnis."""
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=detail,
    )


def inactive_user_exception() -> HTTPException:
    """400 Bad Request — user account tidak aktif."""
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Inactive user account",
    )
