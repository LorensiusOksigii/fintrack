import { getErrorMessage } from '@/api/client'
import { useCreateCategory, useUpdateCategory } from '@/hooks/useCategories'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Category } from '@/types'
import { Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Palet warna preset agar user tidak harus isi hex manual
const COLOR_PRESETS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#8b5cf6', '#ec4899', '#94a3b8', '#0ea5e9',
]

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(100).trim(),
  type: z.enum(['income', 'expense']),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Format warna tidak valid')
    .optional()
    .or(z.literal('')),
  icon: z.string().max(50).optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  /** Jika diisi → mode edit */
  category?: Category
}

export default function CategoryForm({ open, onClose, category }: Props) {
  const isEdit = !!category
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
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
      name: category?.name ?? '',
      type: category?.type ?? 'expense',
      color: category?.color ?? '#94a3b8',
      icon: category?.icon ?? '',
    },
  })

  const selectedColor = watch('color')

  useEffect(() => {
    if (open) {
      reset({
        name: category?.name ?? '',
        type: category?.type ?? 'expense',
        color: category?.color ?? '#94a3b8',
        icon: category?.icon ?? '',
      })
      setServerError(null)
    }
  }, [open, category, reset])

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    try {
      if (isEdit && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          data: {
            name: data.name,
            color: data.color || null,
            icon: data.icon || null,
          },
        })
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          type: data.type,
          color: data.color || null,
          icon: data.icon || null,
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">
            {isEdit ? 'Edit Kategori' : 'Tambah Kategori'}
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

          {/* Nama */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Nama Kategori</label>
            <input
              type="text"
              placeholder="cth. Makan Siang"
              className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Tipe — readonly saat edit (type immutable) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Tipe</label>
            {isEdit ? (
              <div className="w-full text-sm border border-input rounded-md px-3 py-2 bg-muted text-muted-foreground capitalize">
                {category?.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
              </div>
            ) : (
              <select
                {...register('type')}
                className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </select>
            )}
          </div>

          {/* Warna */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Warna</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                    selectedColor === color ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-7 h-7 rounded-full border border-input shrink-0"
                style={{ backgroundColor: selectedColor || '#94a3b8' }}
              />
              <input
                type="text"
                placeholder="#f97316"
                className="flex-1 text-sm border border-input rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                {...register('color')}
              />
            </div>
            {errors.color && <p className="text-xs text-destructive">{errors.color.message}</p>}
          </div>

          {/* Icon (nama lucide-react) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Icon{' '}
              <span className="text-muted-foreground font-normal text-xs">
                (nama dari lucide.dev, opsional)
              </span>
            </label>
            <input
              type="text"
              placeholder="cth. utensils, car, wallet"
              className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              {...register('icon')}
            />
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
              {isEdit ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
