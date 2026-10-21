import type { Budget, BudgetCreateRequest, BudgetUpdateRequest } from '@/types'
import { apiClient } from './client'

const BASE = '/api/v1/budgets'

export const budgetsApi = {
  list: async (month: number, year: number): Promise<Budget[]> => {
    const res = await apiClient.get<Budget[]>(BASE, { params: { month, year } })
    return res.data
  },

  create: async (data: BudgetCreateRequest): Promise<Budget> => {
    const res = await apiClient.post<Budget>(BASE, data)
    return res.data
  },

  update: async (id: string, data: BudgetUpdateRequest): Promise<Budget> => {
    const res = await apiClient.put<Budget>(`${BASE}/${id}`, data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`)
  },
}
