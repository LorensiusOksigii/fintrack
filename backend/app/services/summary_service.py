"""
Summary Service — analytics dan agregasi data keuangan.

Semua query menggunakan SQL aggregate (SUM, GROUP BY) langsung di database
agar tidak perlu fetch ribuan baris transaksi ke memory Python.

Endpoints yang didukung:
1. monthly_summary     — total income, expense, balance bulan ini
2. budget_progress     — budget vs aktual per kategori
3. monthly_trends      — tren income/expense N bulan terakhir
4. category_breakdown  — breakdown pengeluaran per kategori (pie chart)
"""

import uuid
from datetime import date
from decimal import Decimal

from dateutil.relativedelta import relativedelta
from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.models.category import Category, TransactionType
from app.models.transaction import Transaction
from app.schemas.summary import (
    BudgetProgressItem,
    BudgetProgressResponse,
    CategoryBreakdownItem,
    CategoryBreakdownResponse,
    MonthlyTrendItem,
    MonthlySummaryResponse,
    TrendResponse,
)

# Nama bulan singkat untuk label chart
_MONTH_LABELS = {
    1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr",
    5: "Mei", 6: "Jun", 7: "Jul", 8: "Agu",
    9: "Sep", 10: "Okt", 11: "Nov", 12: "Des",
}


def get_monthly_summary(
    db: Session,
    user_id: uuid.UUID,
    month: int,
    year: int,
) -> MonthlySummaryResponse:
    """
    Hitung total income, expense, dan balance untuk bulan tertentu.

    Query: SUM(amount) GROUP BY type, filter bulan + tahun + user.
    """
    rows = (
        db.query(
            Transaction.type,
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
        )
        .filter(
            Transaction.user_id == user_id,
            extract("month", Transaction.date) == month,
            extract("year", Transaction.date) == year,
        )
        .group_by(Transaction.type)
        .all()
    )

    totals: dict[str, Decimal] = {row.type: Decimal(str(row.total)) for row in rows}
    total_income = totals.get(TransactionType.INCOME, Decimal("0"))
    total_expense = totals.get(TransactionType.EXPENSE, Decimal("0"))

    return MonthlySummaryResponse(
        month=month,
        year=year,
        total_income=total_income,
        total_expense=total_expense,
        balance=total_income - total_expense,
    )


def get_budget_progress(
    db: Session,
    user_id: uuid.UUID,
    month: int,
    year: int,
) -> BudgetProgressResponse:
    """
    Hitung progress budget vs aktual per kategori untuk bulan tertentu.

    Query: JOIN budgets + SUM(transactions) per kategori.
    Hanya kategori yang punya budget yang ditampilkan.
    """
    # Subquery: total pengeluaran per kategori bulan ini
    spent_subquery = (
        db.query(
            Transaction.category_id,
            func.coalesce(func.sum(Transaction.amount), 0).label("spent"),
        )
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.EXPENSE,
            extract("month", Transaction.date) == month,
            extract("year", Transaction.date) == year,
        )
        .group_by(Transaction.category_id)
        .subquery()
    )

    # Join budgets + kategori + spent
    rows = (
        db.query(
            Budget,
            Category,
            func.coalesce(spent_subquery.c.spent, 0).label("spent"),
        )
        .join(Category, Budget.category_id == Category.id)
        .outerjoin(spent_subquery, Budget.category_id == spent_subquery.c.category_id)
        .filter(
            Budget.user_id == user_id,
            Budget.month == month,
            Budget.year == year,
        )
        .order_by(Category.name)
        .all()
    )

    items: list[BudgetProgressItem] = []
    for budget, category, spent_raw in rows:
        budget_amount = Decimal(str(budget.amount))
        spent_amount = Decimal(str(spent_raw))
        remaining = budget_amount - spent_amount
        percentage = float((spent_amount / budget_amount * 100)) if budget_amount > 0 else 0.0

        items.append(BudgetProgressItem(
            category_id=str(category.id),
            category_name=category.name,
            category_color=category.color,
            category_icon=category.icon,
            budget_amount=budget_amount,
            spent_amount=spent_amount,
            remaining_amount=remaining,
            percentage_used=round(percentage, 1),
            is_over_budget=spent_amount > budget_amount,
        ))

    return BudgetProgressResponse(month=month, year=year, items=items)


def get_monthly_trends(
    db: Session,
    user_id: uuid.UUID,
    months: int = 6,
) -> TrendResponse:
    """
    Tren income vs expense untuk N bulan terakhir (default 6).

    Mulai dari bulan saat ini mundur ke belakang.
    Bulan yang tidak punya transaksi tetap muncul dengan nilai 0
    agar chart line tidak putus.
    """
    today = date.today()

    # Generate daftar bulan yang akan di-query (termasuk bulan ini)
    periods: list[tuple[int, int]] = []
    for i in range(months - 1, -1, -1):
        d = today - relativedelta(months=i)
        periods.append((d.month, d.year))

    # Query semua aggregate sekaligus untuk menghindari N query
    rows = (
        db.query(
            extract("month", Transaction.date).label("month"),
            extract("year", Transaction.date).label("year"),
            Transaction.type,
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
        )
        .filter(
            Transaction.user_id == user_id,
            # Filter hanya periode yang relevan
            func.make_date(
                extract("year", Transaction.date).cast(int),
                extract("month", Transaction.date).cast(int),
                1,
            ).in_([
                func.make_date(year, month, 1)
                for month, year in periods
            ]),
        )
        .group_by(
            extract("year", Transaction.date),
            extract("month", Transaction.date),
            Transaction.type,
        )
        .all()
    )

    # Susun data ke dict untuk lookup O(1)
    data: dict[tuple[int, int], dict[str, Decimal]] = {p: {} for p in periods}
    for row in rows:
        key = (int(row.month), int(row.year))
        if key in data:
            data[key][row.type] = Decimal(str(row.total))

    # Build response — semua periode harus ada (0 jika tidak ada transaksi)
    items: list[MonthlyTrendItem] = []
    for month, year in periods:
        period_data = data[(month, year)]
        income = period_data.get(TransactionType.INCOME, Decimal("0"))
        expense = period_data.get(TransactionType.EXPENSE, Decimal("0"))
        items.append(MonthlyTrendItem(
            month=month,
            year=year,
            month_label=f"{_MONTH_LABELS[month]} {str(year)[-2:]}",
            total_income=income,
            total_expense=expense,
            balance=income - expense,
        ))

    return TrendResponse(items=items)


def get_category_breakdown(
    db: Session,
    user_id: uuid.UUID,
    month: int,
    year: int,
) -> CategoryBreakdownResponse:
    """
    Breakdown pengeluaran per kategori untuk pie chart.

    Hanya menampilkan kategori yang punya transaksi expense di bulan ini.
    Diurutkan dari pengeluaran terbesar.
    """
    rows = (
        db.query(
            Category,
            func.sum(Transaction.amount).label("total"),
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.EXPENSE,
            extract("month", Transaction.date) == month,
            extract("year", Transaction.date) == year,
        )
        .group_by(Category.id)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )

    total_expense = sum(Decimal(str(row.total)) for row in rows)

    items: list[CategoryBreakdownItem] = []
    for category, total_raw in rows:
        total = Decimal(str(total_raw))
        percentage = float(total / total_expense * 100) if total_expense > 0 else 0.0
        items.append(CategoryBreakdownItem(
            category_id=str(category.id),
            category_name=category.name,
            category_color=category.color,
            category_icon=category.icon,
            total_amount=total,
            percentage=round(percentage, 1),
        ))

    return CategoryBreakdownResponse(
        month=month,
        year=year,
        total_expense=total_expense,
        items=items,
    )
