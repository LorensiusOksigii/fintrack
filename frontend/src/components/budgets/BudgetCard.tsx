import { useDeleteBudget } from '@/hooks/useBudgets'
import { DEFAULT_CATEGORY_COLOR } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import type { Budget } from '@/types'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface Props {
  budget: Budget
  onEdit: (budget: Budget) => void
}

export default function BudgetCard({ budget, onEdit }: Props) {
  const deleteMutation = useDeleteBudget()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const amount = parseFloat(budget.amount)
  const color = budget.category_color ?? DEFAULT_CATEGORY_COLOR

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(budget.id)
    setConfirmDelete(false)
  }

  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-4">
      {/* Category header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="font-medium text-foreground">{budget.category_name}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-destructive">Hapus?</span>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="text-xs text-destructive hover:underline font-medium"
              >
                Ya
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-muted-foreground hover:underline"
              >
                Tidak
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onEdit(budget)}
                className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Hapus"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Budget amount */}
      <div className="text-2xl font-bold text-foreground">
        {formatCurrency(amount)}
      </div>

      <p className="text-xs text-muted-foreground">Limit per bulan</p>
    </div>
  )
}
