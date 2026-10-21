import type { LoginRequest, RegisterRequest, TokenResponse, User } from '@/types'
import { apiClient } from './client'

const BASE = '/api/v1/auth'

export const authApi = {
  register: async (data: RegisterRequest): Promise<User> => {
    const res = await apiClient.post<User>(`${BASE}/register`, data)
    return res.data
  },

  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>(`${BASE}/login`, data)
    return res.data
  },

  me: async (): Promise<User> => {
    const res = await apiClient.get<User>(`${BASE}/me`)
    return res.data
  },
}
