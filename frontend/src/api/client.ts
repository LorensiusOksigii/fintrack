/**
 * Axios instance terpusat untuk semua request ke FinTrack API.
 *
 * Interceptors yang dikonfigurasi:
 * 1. Request: attach JWT token dari localStorage ke setiap request.
 * 2. Response: jika 401, hapus token dan redirect ke /login.
 *
 * Semua API functions di file lain import instance ini — tidak perlu
 * repeat logic auth di mana-mana.
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

// Key localStorage untuk menyimpan JWT token
export const TOKEN_KEY = 'fintrack_access_token'

export const apiClient = axios.create({
  // Saat development, BASE_URL kosong karena Vite proxy handle /api/*
  // Saat production, BASE_URL diisi URL Railway dari .env.production
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ---------------------------------------------------------------------------
// Request Interceptor — attach Bearer token
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ---------------------------------------------------------------------------
// Response Interceptor — handle 401
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid — bersihkan state dan redirect ke login
      localStorage.removeItem(TOKEN_KEY)
      // Reload paksa agar Zustand store ikut reset
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

/**
 * Helper untuk ekstrak pesan error dari axios error object.
 * Mengikuti format error FastAPI: { detail: string | array }
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail.length > 0) {
      return detail[0]?.msg ?? 'Terjadi kesalahan'
    }
    return error.message
  }
  return 'Terjadi kesalahan yang tidak diketahui'
}
