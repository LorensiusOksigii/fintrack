import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

/**
 * Shell layout untuk semua halaman yang butuh autentikasi.
 *
 * Desktop: Sidebar permanen di kiri + konten di kanan
 * Mobile:  Sidebar jadi drawer (slide dari kiri), toggle via hamburger di Topbar
 */
export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">

      {/* ------------------------------------------------------------------ */}
      {/* Desktop sidebar — hidden di mobile                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="hidden md:flex md:w-60 md:min-h-screen md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Mobile drawer                                                        */}
      {/* ------------------------------------------------------------------ */}

      {/* Backdrop — klik untuk tutup */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-60 flex flex-col
          transform transition-transform duration-300 ease-in-out
          md:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Konten utama                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

    </div>
  )
}
