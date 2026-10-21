import { getErrorMessage } from '@/api/client'
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Category, Transaction } from '@/types'
import { Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  type: z.enum(['income', 'expense']),
  category_id: z.string().min(1, 'Pilih kategori'),
  amount: z
    .string()
    .min(1, 'Nominal wajib diisi')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Nominal harus lebih dari 0'),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  description: z.string().max(500).optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  /** Jika diisi → mode edit, kosong → mode tambah */
  transaction?: Transaction
  categories: { income: Category[]; expense: Category[] }
}

export default function TransactionForm({ open, onClose, transaction, categories }: Props) {
  const isEdit = !!transaction
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: transaction?.type ?? 'expense',
      category_id: transaction?.category.id ?? '',
      amount: transaction ? String(parseFloat(transaction.amount)) : '',
      date: transaction?.date ?? new Date().toISOString().split('T')[0],
      description: transaction?.description ?? '',
    },
  })

  const selectedType = watch('type')

  // Reset form saat modal dibuka ulang
  useEffect(() => {
    if (open) {
      reset({
        type: transaction?.type ?? 'expense',
        category_id: transaction?.category.id ?? '',
        amount: transaction ? String(parseFloat(transaction.amount)) : '',
        date: transaction?.date ?? new Date().toISOString().split('T')[0],
        description: transaction?.description ?? '',
      })
      setServerError(null)
    }
  }, [open, transaction, reset])

  // Reset category saat tipe berubah
  useEffect(() => {
    if (!isEdit) setValue('category_id', '')
  }, [selectedType, isEdit, setValue])

  const filteredCategories =
    selectedType === 'income' ? categories.income : categories.expense

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    try {
      const payload = {
        type: data.type,
        category_id: data.category_id,
        amount: parseFloat(data.amount),
        date: data.date,
        description: data.description || null,
      }

      if (isEdit && transaction) {
        await updateMutation.mutateAsync({ id: transaction.id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      onClose()
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  if (!open) return null

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border rounded-lg w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">
            {isEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {serverError && (
            <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-md">
              {serverError}
            </div>
          )}

          {/* Tipe */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Tipe</label>
            <div className="flex gap-2">
              {(['expense', 'income'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue('type', t, { shouldValidate: true })}
                  className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                    selectedType === t
                      ? t === 'income'
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-red-500 text-white border-red-500'
                      : 'border-input text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {t === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </button>
              ))}
            </div>
          </div>

          {/* Kategori */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Kategori</label>
            <select
              {...register('category_id')}
              className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Pilih kategori...</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-xs text-destructive">{errors.category_id.message}</p>
            )}
          </div>

          {/* Nominal */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Nominal (Rp)</label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="50000"
              className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              {...register('amount')}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Tanggal */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Tanggal</label>
            <input
              type="date"
              max={new Date().toISOString().split('T')[0]}
              className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              {...register('date')}
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Catatan */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Catatan <span className="text-muted-foreground font-normal">(opsional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Tambahkan catatan..."
              className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              {...register('description')}
            />
          </div>

          {/* Actions */}
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
              {isEdit ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
