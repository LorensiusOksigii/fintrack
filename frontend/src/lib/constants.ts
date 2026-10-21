/**
 * Query keys untuk TanStack Query.
 *
 * Menggunakan array-based keys agar:
 * 1. Invalidasi bisa dilakukan secara granular (misal: invalidate semua
 *    transactions tanpa peduli filternya).
 * 2. Konsisten di seluruh aplikasi — tidak ada magic string berulang.
 *
 * Konvensi: ['resource', ...params]
 */

export const QUERY_KEYS = {
  // Auth
  me: ['me'] as const,

  // Categories
  categories: ['categories'] as const,

  // Transactions
  transactions: (filters?: object) =>
    filters ? ['transactions', filters] : ['transactions'],

  // Budgets
  budgets: (month: number, year: number) => ['budgets', month, year] as const,

  // Summary
  summaryMonthly: (month: number, year: number) =>
    ['summary', 'monthly', month, year] as const,
  summaryBudgetProgress: (month: number, year: number) =>
    ['summary', 'budget-progress', month, year] as const,
  summaryTrends: (months: number) =>
    ['summary', 'trends', months] as const,
  summaryCategoryBreakdown: (month: number, year: number) =>
    ['summary', 'category-breakdown', month, year] as const,
} as const

/**
 * Warna default untuk kategori yang belum punya warna.
 */
export const DEFAULT_CATEGORY_COLOR = '#94a3b8'

/**
 * Warna chart untuk income dan expense.
 */
export const CHART_COLORS = {
  income: '#22c55e',
  expense: '#ef4444',
  balance: '#3b82f6',
} as const
