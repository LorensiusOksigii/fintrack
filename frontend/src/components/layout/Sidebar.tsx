import { cn } from '@/lib/utils'
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Tag,
  Wallet,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/transactions', label: 'Transaksi',  icon: BarChart3 },
  { to: '/budgets',      label: 'Budget',     icon: Wallet },
  { to: '/categories',   label: 'Kategori',   icon: Tag },
]

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-card border-r border-border">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <span className="text-xl font-bold text-foreground">💰 FinTrack</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        {user && (
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-foreground truncate">{user.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Keluar
        </button>
      </div>
    </aside>
  )
}
