import type {
  Transaction,
  TransactionCreateRequest,
  TransactionFilters,
  TransactionListResponse,
  TransactionUpdateRequest,
} from '@/types'
import { apiClient } from './client'

const BASE = '/api/v1/transactions'

export const transactionsApi = {
  list: async (filters?: TransactionFilters): Promise<TransactionListResponse> => {
    const res = await apiClient.get<TransactionListResponse>(BASE, {
      params: filters,
    })
    return res.data
  },

  getById: async (id: string): Promise<Transaction> => {
    const res = await apiClient.get<Transaction>(`${BASE}/${id}`)
    return res.data
  },

  create: async (data: TransactionCreateRequest): Promise<Transaction> => {
    const res = await apiClient.post<Transaction>(BASE, data)
    return res.data
  },

  update: async (id: string, data: TransactionUpdateRequest): Promise<Transaction> => {
    const res = await apiClient.put<Transaction>(`${BASE}/${id}`, data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`)
  },
}
