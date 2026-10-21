export interface MonthlySummary {
  month: number
  year: number
  total_income: string
  total_expense: string
  balance: string
}

export interface BudgetProgressItem {
  category_id: string
  category_name: string
  category_color: string | null
  category_icon: string | null
  budget_amount: string
  spent_amount: string
  remaining_amount: string
  percentage_used: number
  is_over_budget: boolean
}

export interface BudgetProgressResponse {
  month: number
  year: number
  items: BudgetProgressItem[]
}

export interface MonthlyTrendItem {
  month: number
  year: number
  month_label: string
  total_income: string
  total_expense: string
  balance: string
}

export interface TrendResponse {
  items: MonthlyTrendItem[]
}

export interface CategoryBreakdownItem {
  category_id: string
  category_name: string
  category_color: string | null
  category_icon: string | null
  total_amount: string
  percentage: number
}

export interface CategoryBreakdownResponse {
  month: number
  year: number
  total_expense: string
  items: CategoryBreakdownItem[]
}
