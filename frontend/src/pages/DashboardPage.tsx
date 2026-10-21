import BudgetProgressList from '@/components/dashboard/BudgetProgressList'
import CategoryPieChart from '@/components/dashboard/CategoryPieChart'
import SummaryCards from '@/components/dashboard/SummaryCards'
import TrendChart from '@/components/dashboard/TrendChart'
import {
  useBudgetProgress,
  useCategoryBreakdown,
  useMonthlySummary,
  useMonthlyTrends,
} from '@/hooks/useSummary'
import { getMonthName } from '@/lib/utils'

export default function DashboardPage() {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  // Semua query berjalan paralel — TanStack Query handle concurrency otomatis
  const summaryQuery       = useMonthlySummary(month, year)
  const budgetProgressQuery = useBudgetProgress(month, year)
  const trendsQuery        = useMonthlyTrends(6)
  const breakdownQuery     = useCategoryBreakdown(month, year)

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {getMonthName(month)} {year}
        </p>
      </div>

      {/* Row 1 — Summary Cards */}
      <SummaryCards
        data={summaryQuery.data}
        isLoading={summaryQuery.isLoading}
      />

      {/* Row 2 — Trend Chart (full width) */}
      <TrendChart
        data={trendsQuery.data}
        isLoading={trendsQuery.isLoading}
      />

      {/* Row 3 — Budget Progress + Pie Chart (side by side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetProgressList
          data={budgetProgressQuery.data}
          isLoading={budgetProgressQuery.isLoading}
        />
        <CategoryPieChart
          data={breakdownQuery.data}
          isLoading={breakdownQuery.isLoading}
        />
      </div>

      {/* Error states */}
      {summaryQuery.isError && (
        <p className="text-sm text-destructive">
          Gagal memuat ringkasan. Coba refresh halaman.
        </p>
      )}
    </div>
  )
}
