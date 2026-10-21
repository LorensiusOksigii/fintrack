import BudgetCard from '@/components/budgets/BudgetCard'
import BudgetForm from '@/components/budgets/BudgetForm'
import { useBudgets } from '@/hooks/useBudgets'
import { useCategories } from '@/hooks/useCategories'
import { getMonthName } from '@/lib/utils'
import type { Budget } from '@/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function BudgetsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Budget | undefined>()

  const budgetsQuery = useBudgets(month, year)
  const categoriesQuery = useCategories()

  // Kategori expense yang belum punya budget di bulan ini
  const budgetCategoryIds = new Set(budgetsQuery.data?.map((b) => b.category_id) ?? [])
  const availableCategories = (categoriesQuery.data?.expense ?? []).filter(
    (c) => !budgetCategoryIds.has(c.id),
  )

  const openAdd = () => { setEditTarget(undefined); setFormOpen(true) }
  const openEdit = (b: Budget) => { setEditTarget(b); setFormOpen(true) }
  const closeForm = () => { setFormOpen(false); setEditTarget(undefined) }

  const YEARS = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)
  const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Budget</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Atur limit pengeluaran bulanan per kategori.
          </p>
        </div>
        <button
          onClick={openAdd}
          disabled={availableCategories.length === 0}
          title={availableCategories.length === 0 ? 'Semua kategori sudah punya budget' : ''}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-4 w-4" />
          Set Budget
        </button>
      </div>

      {/* Period picker */}
      <div className="flex gap-3">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="text-sm border border-input rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {MONTHS.map((m) => (
            <option key={m} value={m}>{getMonthName(m)}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="text-sm border border-input rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Loading skeleton */}
      {budgetsQuery.isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-5 space-y-4 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 w-28 bg-muted rounded" />
                <div className="h-4 w-12 bg-muted rounded" />
              </div>
              <div className="h-8 w-36 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!budgetsQuery.isLoading && budgetsQuery.data?.length === 0 && (
        <div className="text-center py-16 space-y-2">
          <p className="text-muted-foreground">
            Belum ada budget untuk {getMonthName(month)} {year}.
          </p>
          <button
            onClick={openAdd}
            className="text-sm text-primary hover:underline"
          >
            Set budget sekarang
          </button>
        </div>
      )}

      {/* Budget grid */}
      {!budgetsQuery.isLoading && budgetsQuery.data && budgetsQuery.data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetsQuery.data.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} onEdit={openEdit} />
          ))}
        </div>
      )}

      {/* Form modal */}
      <BudgetForm
        open={formOpen}
        onClose={closeForm}
        month={month}
        year={year}
        budget={editTarget}
        availableCategories={availableCategories}
      />
    </div>
  )
}
