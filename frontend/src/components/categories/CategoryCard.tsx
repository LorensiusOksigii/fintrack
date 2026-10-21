import { useDeleteCategory } from '@/hooks/useCategories'
import { DEFAULT_CATEGORY_COLOR } from '@/lib/constants'
import type { Category } from '@/types'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface Props {
  category: Category
  onEdit: (category: Category) => void
}

export default function CategoryCard({ category, onEdit }: Props) {
  const deleteMutation = useDeleteCategory()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const color = category.color ?? DEFAULT_CATEGORY_COLOR

  const handleDelete = async () => {
    setDeleteError(null)
    try {
      await deleteMutation.mutateAsync(category.id)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? 'Gagal menghapus kategori'
      setDeleteError(msg)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg px-4 py-3 flex items-center justify-between gap-3">
      {/* Left — color dot + name */}
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium text-foreground truncate">
          {category.name}
        </span>
        {category.is_default && (
          <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5 shrink-0">
            default
          </span>
        )}
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1 shrink-0">
        {deleteError && (
          <span className="text-xs text-destructive mr-2">{deleteError}</span>
        )}
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
              onClick={() => onEdit(category)}
              className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            {!category.is_default && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Hapus"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
