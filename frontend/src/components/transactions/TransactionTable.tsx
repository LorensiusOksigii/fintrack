import { useDeleteTransaction } from '@/hooks/useTransactions'
import { DEFAULT_CATEGORY_COLOR } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PaginationMeta, Transaction } from '@/types'
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface Props {
  data: Transaction[]
  meta: PaginationMeta | undefined
  isLoading: boolean
  page: number
  onPageChange: (page: number) => void
  onEdit: (transaction: Transaction) => void
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-muted rounded w-full" />
        </td>
      ))}
    </tr>
  )
}

export default function TransactionTable({
  data,
  meta,
  isLoading,
  page,
  onPageChange,
  onEdit,
}: Props) {
  const deleteMutation = useDeleteTransaction()
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id)
    setConfirmId(null)
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tanggal</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kategori</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Catatan</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Nominal</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && [...Array(5)].map((_, i) => <SkeletonRow key={i} />)}

            {!isLoading && data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  Tidak ada transaksi ditemukan.
                </td>
              </tr>
            )}

            {!isLoading && data.map((t) => (
              <tr
                key={t.id}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
              >
                {/* Tanggal */}
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatDate(t.date)}
                </td>

                {/* Kategori */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: t.category.color ?? DEFAULT_CATEGORY_COLOR }}
                    />
                    <span className="text-foreground">{t.category.name}</span>
                  </div>
                </td>

                {/* Catatan */}
                <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                  {t.description ?? <span className="italic">—</span>}
                </td>

                {/* Nominal */}
                <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
                  t.type === 'income' ? 'text-green-600' : 'text-red-500'
                }`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(t.amount))}
                </td>

                {/* Aksi */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {confirmId === t.id ? (
                      // Konfirmasi delete inline
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-destructive">Hapus?</span>
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={deleteMutation.isPending}
                          className="text-xs text-destructive hover:underline font-medium"
                        >
                          Ya
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          Tidak
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => onEdit(t)}
                          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmId(t.id)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.total_pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {meta.total} transaksi · Halaman {meta.page} dari {meta.total_pages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="p-1.5 rounded border border-input text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === meta.total_pages}
              className="p-1.5 rounded border border-input text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
