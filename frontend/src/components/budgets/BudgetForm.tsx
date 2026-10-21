import { getErrorMessage } from '@/api/client'
import { useCreateBudget, useUpdateBudget } from '@/hooks/useBudgets'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Budget, Category } from '@/types'
import { Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  category_id: z.string().min(1, 'Pilih kategori'),
  amount: z
    .string()
    .min(1, 'Nominal wajib diisi')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Nominal harus lebih dari 0'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  month: number
  year: number
  /** Jika diisi → mode edit */
  budget?: Budget
  /** Kategori expense yang belum punya budget bulan ini */
  availableCategories: Category[]
}

export default function BudgetForm({
  open, onClose, month, year, budget, availableCategories,
}: Props) {
  const isEdit = !!budget
  const createMutation = useCreateBudget()
  const updateMutation = useUpdateBudget()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category_id: budget?.category_id ?? '',
      amount: budget ? String(parseFloat(budget.amount)) : '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        category_id: budget?.category_id ?? '',
        amount: budget ? String(parseFloat(budget.amount)) : '',
      })
      setServerError(null)
    }
  }, [open, budget, reset])

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    try {
      if (isEdit && budget) {
        await updateMutation.mutateAsync({
          id: budget.id,
          data: { amount: parseFloat(data.amount) },
        })
      } else {
        await createMutation.mutateAsync({
          category_id: data.category_id,
          amount: parseFloat(data.amount),
          month,
          year,
        })
      }
      onClose()
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border rounded-lg w-full max-w-sm shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">
            {isEdit ? 'Edit Budget' : 'Set Budget'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {serverError && (
            <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-md">
              {serverError}
            </div>
          )}

          {/* Kategori — readonly saat edit */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Kategori</label>
            {isEdit ? (
              <div className="w-full text-sm border border-input rounded-md px-3 py-2 bg-muted text-muted-foreground">
                {budget?.category_name}
              </div>
            ) : (
              <select
                {...register('category_id')}
                className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Pilih kategori...</option>
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            {errors.category_id && (
              <p className="text-xs text-destructive">{errors.category_id.message}</p>
            )}
          </div>

          {/* Nominal */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Limit Budget (Rp)</label>
            <input
              type="number"
              min="1"
              step="1000"
              placeholder="500000"
              className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              {...register('amount')}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-md text-sm font-medium border border-input text-muted-foreground hover:bg-accent transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Simpan' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
