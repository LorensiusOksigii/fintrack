/**
 * Zustand store untuk auth state.
 *
 * Menyimpan:
 * - token: JWT string (di-persist ke localStorage)
 * - user: data user yang sedang login
 * - isAuthenticated: derived boolean dari token
 *
 * Actions:
 * - login(token, user): simpan token ke localStorage + update store
 * - logout(): hapus token dari localStorage + reset store
 * - setUser(user): update data user (setelah GET /me)
 */

import { TOKEN_KEY } from '@/api/client'
import type { User } from '@/types'
import { create } from 'zustand'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean

  login: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  // Inisialisasi dari localStorage agar state survive page refresh
  token: localStorage.getItem(TOKEN_KEY),
  user: null,
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),

  login: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token)
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ token: null, user: null, isAuthenticated: false })
  },

  setUser: (user) => {
    set({ user })
  },
}))
