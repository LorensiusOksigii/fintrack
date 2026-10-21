import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

/**
 * Shell layout untuk semua halaman yang butuh autentikasi.
 * Struktur: Sidebar (kiri) | Topbar + konten halaman (kanan)
 *
 * <Outlet /> akan diisi oleh halaman aktif (Dashboard, Transactions, dll)
 * berdasarkan route yang cocok di App.tsx.
 */
export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
