"""
Seed data untuk default categories.

Berisi:
1. DEFAULT_CATEGORIES — daftar kategori bawaan sistem.
2. seed_default_categories() — fungsi yang dipanggil saat user baru register.
3. __main__ block — bisa dijalankan manual untuk keperluan development.

Cara pakai:
    # Dipanggil otomatis dari auth_service saat register (Milestone 3)
    from app.seeds.categories import seed_default_categories
    seed_default_categories(db=db, user_id=new_user.id)

    # Atau jalankan manual (dari folder backend/ dengan venv aktif):
    python -m app.seeds.categories
"""

import uuid
from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.models.category import Category, TransactionType


# ---------------------------------------------------------------------------
# Data default categories
# ---------------------------------------------------------------------------

@dataclass
class CategorySeed:
    name: str
    type: TransactionType
    color: str   # hex color
    icon: str    # nama icon lucide-react


DEFAULT_CATEGORIES: list[CategorySeed] = [
    # --- Pemasukan ---
    CategorySeed(name="Gaji",          type=TransactionType.INCOME,  color="#22c55e", icon="wallet"),
    CategorySeed(name="Freelance",     type=TransactionType.INCOME,  color="#10b981", icon="laptop"),
    CategorySeed(name="Investasi",     type=TransactionType.INCOME,  color="#14b8a6", icon="trending-up"),
    CategorySeed(name="Hadiah",        type=TransactionType.INCOME,  color="#06b6d4", icon="gift"),
    CategorySeed(name="Lainnya",       type=TransactionType.INCOME,  color="#6366f1", icon="plus-circle"),

    # --- Pengeluaran: Kebutuhan Pokok ---
    CategorySeed(name="Makanan",       type=TransactionType.EXPENSE, color="#f97316", icon="utensils"),
    CategorySeed(name="Transport",     type=TransactionType.EXPENSE, color="#eab308", icon="car"),
    CategorySeed(name="Belanja",       type=TransactionType.EXPENSE, color="#ec4899", icon="shopping-bag"),
    CategorySeed(name="Kesehatan",     type=TransactionType.EXPENSE, color="#ef4444", icon="heart-pulse"),
    CategorySeed(name="Tagihan",       type=TransactionType.EXPENSE, color="#8b5cf6", icon="file-text"),

    # --- Pengeluaran: Gaya Hidup ---
    CategorySeed(name="Hiburan",       type=TransactionType.EXPENSE, color="#f43f5e", icon="tv"),
    CategorySeed(name="Pendidikan",    type=TransactionType.EXPENSE, color="#3b82f6", icon="book-open"),
    CategorySeed(name="Olahraga",      type=TransactionType.EXPENSE, color="#84cc16", icon="dumbbell"),
    CategorySeed(name="Pakaian",       type=TransactionType.EXPENSE, color="#d946ef", icon="shirt"),
    CategorySeed(name="Kecantikan",    type=TransactionType.EXPENSE, color="#fb7185", icon="sparkles"),

    # --- Pengeluaran: Lain-lain ---
    CategorySeed(name="Tabungan",      type=TransactionType.EXPENSE, color="#0ea5e9", icon="piggy-bank"),
    CategorySeed(name="Donasi",        type=TransactionType.EXPENSE, color="#a78bfa", icon="hand-heart"),
    CategorySeed(name="Lainnya",       type=TransactionType.EXPENSE, color="#94a3b8", icon="more-horizontal"),
]


# ---------------------------------------------------------------------------
# Fungsi seed
# ---------------------------------------------------------------------------

def seed_default_categories(db: Session, user_id: uuid.UUID) -> list[Category]:
    """
    Buat default categories untuk user baru.

    Dipanggil sekali saat user register. Jika kategori dengan nama + type
    yang sama sudah ada (idempotent), lewati — tidak duplikasi.

    Args:
        db: SQLAlchemy session aktif.
        user_id: UUID user yang baru dibuat.

    Returns:
        List kategori yang berhasil dibuat.
    """
    created: list[Category] = []

    for seed in DEFAULT_CATEGORIES:
        # Cek apakah kategori sudah ada (idempotent)
        existing = (
            db.query(Category)
            .filter(
                Category.user_id == user_id,
                Category.name == seed.name,
                Category.type == seed.type,
            )
            .first()
        )
        if existing:
            continue

        category = Category(
            user_id=user_id,
            name=seed.name,
            type=seed.type,
            color=seed.color,
            icon=seed.icon,
            is_default=True,
        )
        db.add(category)
        created.append(category)

    db.flush()  # Assign IDs tanpa commit — commit dilakukan oleh caller
    return created


# ---------------------------------------------------------------------------
# Manual runner (development only)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    """
    Jalankan seed untuk user tertentu secara manual.
    Berguna saat development atau reset data.

    Usage:
        cd backend
        python -m app.seeds.categories <user_id>

    Contoh:
        python -m app.seeds.categories 550e8400-e29b-41d4-a716-446655440000
    """
    import sys

    from app.database import SessionLocal

    if len(sys.argv) != 2:
        print("Usage: python -m app.seeds.categories <user_uuid>")
        print("Contoh: python -m app.seeds.categories 550e8400-e29b-41d4-a716-446655440000")
        sys.exit(1)

    user_uuid = uuid.UUID(sys.argv[1])

    with SessionLocal() as session:
        categories = seed_default_categories(db=session, user_id=user_uuid)
        session.commit()
        print(f"✅ Berhasil membuat {len(categories)} default categories untuk user {user_uuid}")
        for cat in categories:
            print(f"   - [{cat.type}] {cat.name} ({cat.icon})")
