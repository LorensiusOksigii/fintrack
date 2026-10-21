import { getMonthName } from '@/lib/utils'
import type { Category, TransactionFilters, TransactionType } from '@/types'

interface Props {
  filters: TransactionFilters
  categories: Category[]
  onChange: (filters: TransactionFilters) => void
}

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: getMonthName(i + 1),
}))

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)

export default function TransactionFilters({ filters, categories, onChange }: Props) {
  const set = (patch: Partial<TransactionFilters>) =>
    onChange({ ...filters, ...patch, page: 1 })

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Bulan */}
      <select
        value={filters.month ?? ''}
        onChange={(e) => set({ month: e.target.value ? Number(e.target.value) : undefined })}
        className="text-sm border border-input rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Semua Bulan</option>
        {MONTHS.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>

      {/* Tahun */}
      <select
        value={filters.year ?? ''}
        onChange={(e) => set({ year: e.target.value ? Number(e.target.value) : undefined })}
        className="text-sm border border-input rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Semua Tahun</option>
        {YEARS.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {/* Tipe */}
      <select
        value={filters.type ?? ''}
        onChange={(e) =>
          set({ type: (e.target.value as TransactionType) || undefined })
        }
        className="text-sm border border-input rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Semua Tipe</option>
        <option value="income">Pemasukan</option>
        <option value="expense">Pengeluaran</option>
      </select>

      {/* Kategori */}
      <select
        value={filters.category_id ?? ''}
        onChange={(e) => set({ category_id: e.target.value || undefined })}
        className="text-sm border border-input rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Semua Kategori</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* Reset */}
      {(filters.month || filters.year || filters.type || filters.category_id) && (
        <button
          onClick={() => onChange({ page: 1, limit: filters.limit })}
          className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
        >
          Reset filter
        </button>
      )}
    </div>
  )
}
