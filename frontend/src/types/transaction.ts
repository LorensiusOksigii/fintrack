import type { Category, TransactionType } from './category'

export interface Transaction {
  id: string
  type: TransactionType
  amount: string        // Decimal comes as string from Python
  description: string | null
  date: string          // ISO date: YYYY-MM-DD
  category: Category
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface TransactionListResponse {
  data: Transaction[]
  meta: PaginationMeta
}

export interface TransactionCreateRequest {
  category_id: string
  type: TransactionType
  amount: number
  description?: string | null
  date: string
}

export interface TransactionUpdateRequest {
  category_id?: string
  type?: TransactionType
  amount?: number
  description?: string | null
  date?: string
}

export interface TransactionFilters {
  month?: number
  year?: number
  type?: TransactionType
  category_id?: string
  page?: number
  limit?: number
}
