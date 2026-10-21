import type {
  Category,
  CategoryCreateRequest,
  CategoryListResponse,
  CategoryUpdateRequest,
} from '@/types'
import { apiClient } from './client'

const BASE = '/api/v1/categories'

export const categoriesApi = {
  list: async (): Promise<CategoryListResponse> => {
    const res = await apiClient.get<CategoryListResponse>(BASE)
    return res.data
  },

  create: async (data: CategoryCreateRequest): Promise<Category> => {
    const res = await apiClient.post<Category>(BASE, data)
    return res.data
  },

  update: async (id: string, data: CategoryUpdateRequest): Promise<Category> => {
    const res = await apiClient.put<Category>(`${BASE}/${id}`, data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`)
  },
}
