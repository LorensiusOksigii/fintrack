import { getMonthName } from '@/lib/utils'
import { Menu } from 'lucide-react'

interface Props {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: Props) {
  const now = new Date()
  const monthLabel = `${getMonthName(now.getMonth() + 1)} ${now.getFullYear()}`

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-card">
      {/* Hamburger — hanya muncul di mobile */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-accent transition-colors"
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Spacer di desktop */}
      <div className="hidden md:block" />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        {monthLabel}
      </div>
    </header>
  )
}
