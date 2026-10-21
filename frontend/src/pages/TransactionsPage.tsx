import TransactionFilters from '@/components/transactions/TransactionFilters'
import TransactionForm from '@/components/transactions/TransactionForm'
import TransactionTable from '@/components/transactions/TransactionTable'
import { useCategories } from '@/hooks/useCategories'
import { useTransactions } from '@/hooks/useTransactions'
import type { Transaction, TransactionFilters as TFilters } from '@/types'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export default function TransactionsPage() {
  const now = new Date()

  const [filters, setFilters] = useState<TFilters>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    page: 1,
    limit: 20,
  })
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Transaction | undefined>()

  const transactionsQuery = useTransactions(filters)
  const categoriesQuery = useCategories()

  const allCategories = [
    ...(categoriesQuery.data?.income ?? []),
    ...(categoriesQuery.data?.expense ?? []),
  ]

  const openAdd = () => {
    setEditTarget(undefined)
    setFormOpen(true)
  }

  const openEdit = (t: Transaction) => {
    setEditTarget(t)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditTarget(undefined)
  }

  return (
    <div className="p-6 space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transaksi</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {transactionsQuery.data?.meta.total ?? 0} transaksi ditemukan
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

      {/* Filters */}
      <TransactionFilters
        filters={filters}
        categories={allCategories}
        onChange={setFilters}
      />

      {/* Table */}
      <TransactionTable
        data={transactionsQuery.data?.data ?? []}
        meta={transactionsQuery.data?.meta}
        isLoading={transactionsQuery.isLoading}
        page={filters.page ?? 1}
        onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
        onEdit={openEdit}
      />

      {/* Form Modal */}
      <TransactionForm
        open={formOpen}
        onClose={closeForm}
        transaction={editTarget}
        categories={categoriesQuery.data ?? { income: [], expense: [] }}
      />
    </div>
  )
}
