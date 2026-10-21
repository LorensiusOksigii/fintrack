import { useAuthStore } from '@/store/authStore'
import { Navigate, Outlet } from 'react-router-dom'

/**
 * Wrapper route yang memproteksi semua halaman di dalam AppLayout.
 * Jika user belum login (tidak ada token), redirect ke /login.
 * Jika sudah login, render children via <Outlet />.
 */
export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
