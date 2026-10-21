import type {
  BudgetProgressResponse,
  CategoryBreakdownResponse,
  MonthlySummary,
  TrendResponse,
} from '@/types'
import { apiClient } from './client'

const BASE = '/api/v1/summary'

export const summaryApi = {
  monthly: async (month: number, year: number): Promise<MonthlySummary> => {
    const res = await apiClient.get<MonthlySummary>(`${BASE}/monthly`, {
      params: { month, year },
    })
    return res.data
  },

  budgetProgress: async (month: number, year: number): Promise<BudgetProgressResponse> => {
    const res = await apiClient.get<BudgetProgressResponse>(`${BASE}/budget-progress`, {
      params: { month, year },
    })
    return res.data
  },

  trends: async (months = 6): Promise<TrendResponse> => {
    const res = await apiClient.get<TrendResponse>(`${BASE}/trends`, {
      params: { months },
    })
    return res.data
  },

  categoryBreakdown: async (month: number, year: number): Promise<CategoryBreakdownResponse> => {
    const res = await apiClient.get<CategoryBreakdownResponse>(`${BASE}/category-breakdown`, {
      params: { month, year },
    })
    return res.data
  },
}
