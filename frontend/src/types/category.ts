export type TransactionType = 'income' | 'expense'

export interface Category {
  id: string
  name: string
  type: TransactionType
  color: string | null
  icon: string | null
  is_default: boolean
}

export interface CategoryListResponse {
  income: Category[]
  expense: Category[]
}

export interface CategoryCreateRequest {
  name: string
  type: TransactionType
  color?: string | null
  icon?: string | null
}

export interface CategoryUpdateRequest {
  name?: string
  color?: string | null
  icon?: string | null
}
