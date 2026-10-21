export interface Budget {
  id: string
  category_id: string
  amount: string        // Decimal as string
  month: number
  year: number
  category_name: string
  category_color: string | null
  category_icon: string | null
}

export interface BudgetCreateRequest {
  category_id: string
  amount: number
  month: number
  year: number
}

export interface BudgetUpdateRequest {
  amount: number
}
