import CategoryCard from '@/components/categories/CategoryCard'
import CategoryForm from '@/components/categories/CategoryForm'
import { useCategories } from '@/hooks/useCategories'
import type { Category } from '@/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3 animate-pulse">
      <div className="w-3 h-3 rounded-full bg-muted shrink-0" />
      <div className="h-4 w-32 bg-muted rounded" />
    </div>
  )
}

function CategorySection({
  title,
  categories,
  onEdit,
}: {
  title: string
  categories: Category[]
  onEdit: (c: Category) => void
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
        <span className="ml-2 text-xs font-normal normal-case">
          ({categories.length})
        </span>
      </h2>
      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground px-1">Belum ada kategori.</p>
      ) : (
        <div className="space-y-2">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CategoriesPage() {
  const categoriesQuery = useCategories()
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | undefined>()

  const openAdd = () => { setEditTarget(undefined); setFormOpen(true) }
  const openEdit = (c: Category) => { setEditTarget(c); setFormOpen(true) }
  const closeForm = () => { setFormOpen(false); setEditTarget(undefined) }

  const income = categoriesQuery.data?.income ?? []
  const expense = categoriesQuery.data?.expense ?? []

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kategori</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola kategori untuk pemasukan dan pengeluaran.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tambah
        </button>
      </div>

      {/* Loading */}
      {categoriesQuery.isLoading && (
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      )}

      {/* Content */}
      {!categoriesQuery.isLoading && (
        <div className="space-y-8">
          <CategorySection
            title="Pemasukan"
            categories={income}
            onEdit={openEdit}
          />
          <CategorySection
            title="Pengeluaran"
            categories={expense}
            onEdit={openEdit}
          />
        </div>
      )}

      {/* Form modal */}
      <CategoryForm
        open={formOpen}
        onClose={closeForm}
        category={editTarget}
      />
    </div>
  )
}
