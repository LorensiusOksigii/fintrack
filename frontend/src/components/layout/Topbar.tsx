import { getMonthName } from '@/lib/utils'

/**
 * Topbar menampilkan heading halaman dan periode bulan berjalan.
 * Akan dikembangkan di milestone berikutnya dengan month picker.
 */
export default function Topbar() {
  const now = new Date()
  const monthLabel = `${getMonthName(now.getMonth() + 1)} ${now.getFullYear()}`

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card">
      <div />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        {monthLabel}
      </div>
    </header>
  )
}
