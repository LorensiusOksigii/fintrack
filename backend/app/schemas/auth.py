"""
Pydantic schemas untuk Authentication endpoints.

Pemisahan schema per use-case (bukan per model) agar setiap endpoint
hanya expose field yang relevan — prinsip least privilege pada API contract.

Naming convention:
    <Resource><Action>Request  — body yang dikirim client
    <Resource><Action>Response — body yang dikembalikan server
"""

import uuid

from pydantic import BaseModel, EmailStr, Field, field_validator


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------

class RegisterRequest(BaseModel):
    """Body untuk POST /auth/register."""

    email: EmailStr = Field(
        description="Alamat email unik untuk akun ini.",
        examples=["user@example.com"],
    )
    full_name: str = Field(
        min_length=2,
        max_length=100,
        description="Nama lengkap pengguna.",
        examples=["Budi Santoso"],
    )
    password: str = Field(
        min_length=8,
        max_length=100,
        description="Password minimal 8 karakter.",
        examples=["s3cur3P@ssword"],
    )

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        """
        Validasi kekuatan password minimal:
        - Minimal 1 huruf besar
        - Minimal 1 huruf kecil
        - Minimal 1 angka
        """
        if not any(c.isupper() for c in v):
            raise ValueError("Password harus mengandung minimal 1 huruf kapital")
        if not any(c.islower() for c in v):
            raise ValueError("Password harus mengandung minimal 1 huruf kecil")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password harus mengandung minimal 1 angka")
        return v

    @field_validator("full_name")
    @classmethod
    def full_name_no_numbers(cls, v: str) -> str:
        """Nama tidak boleh mengandung angka."""
        if any(c.isdigit() for c in v):
            raise ValueError("Nama tidak boleh mengandung angka")
        return v.strip()


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    """
    Body untuk POST /auth/login.

    Menggunakan JSON body (bukan OAuth2 form) agar lebih fleksibel
    di frontend — React bisa kirim application/json langsung.
    Swagger UI tetap bisa test via /docs.
    """

    email: EmailStr = Field(
        examples=["user@example.com"],
    )
    password: str = Field(
        examples=["s3cur3P@ssword"],
    )


class TokenResponse(BaseModel):
    """Response untuk POST /auth/login yang berhasil."""

    access_token: str = Field(
        description="JWT access token. Sertakan di header: Authorization: Bearer <token>",
    )
    token_type: str = Field(
        default="bearer",
        description="Tipe token — selalu 'bearer'.",
    )
    expires_in: int = Field(
        description="Durasi token dalam detik.",
        examples=[86400],
    )


# ---------------------------------------------------------------------------
# User Info
# ---------------------------------------------------------------------------

class UserResponse(BaseModel):
    """
    Response untuk GET /auth/me dan endpoint lain yang mengembalikan user.

    Tidak menyertakan hashed_password — prinsip never expose sensitive fields.
    """

    id: uuid.UUID = Field(description="UUID user.")
    email: str = Field(description="Alamat email.")
    full_name: str = Field(description="Nama lengkap.")
    is_active: bool = Field(description="Status aktif akun.")

    model_config = {
        "from_attributes": True,
    }
