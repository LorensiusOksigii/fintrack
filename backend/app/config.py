from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Konfigurasi aplikasi dibaca dari environment variables / file .env.
    pydantic-settings otomatis memvalidasi tipe dan raise error
    saat startup jika ada variable wajib yang tidak diset.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # --- App ---
    app_name: str = "FinTrack API"
    app_version: str = "0.1.0"
    debug: bool = False

    # --- Database ---
    # Format: postgresql://user:password@host:port/dbname
    database_url: str

    # --- JWT ---
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 jam

    # --- CORS ---
    # Origins yang diizinkan mengakses API (pisahkan dengan koma)
    # Contoh: "http://localhost:5173,https://fintrack.vercel.app"
    allowed_origins: str = "http://localhost:5173"

    @property
    def allowed_origins_list(self) -> list[str]:
        """Parse allowed_origins string menjadi list."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]


# Singleton instance — digunakan di seluruh aplikasi via dependency injection
settings = Settings()  # type: ignore[call-arg]
