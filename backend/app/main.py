from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, budgets, categories, summary, transactions

# ---------------------------------------------------------------------------
# App Factory
# ---------------------------------------------------------------------------

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="REST API untuk FinTrack — Personal Finance Tracker",
    # Swagger UI selalu aktif — kontrol akses via CORS dan network policy
    # Di production, pastikan /docs tidak publicly accessible jika tidak perlu
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

# Auth — Milestone 3
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

# Categories — Milestone 4
app.include_router(categories.router, prefix="/api/v1/categories", tags=["categories"])

# Transactions — Milestone 4
app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["transactions"])

# Budgets — Milestone 5
app.include_router(budgets.router, prefix="/api/v1/budgets", tags=["budgets"])

# Summary / Analytics — Milestone 5
app.include_router(summary.router, prefix="/api/v1/summary", tags=["summary"])

# ---------------------------------------------------------------------------
# Health Check Endpoints
# ---------------------------------------------------------------------------


@app.get("/", tags=["health"])
def root() -> dict[str, str]:
    """Root endpoint — konfirmasi API berjalan."""
    return {"message": f"Welcome to {settings.app_name} v{settings.app_version}"}


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    """
    Health check endpoint.
    Digunakan oleh Railway untuk memverifikasi service aktif.
    """
    return {"status": "healthy", "version": settings.app_version}
