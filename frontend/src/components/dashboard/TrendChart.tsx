import { CHART_COLORS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import type { TrendResponse } from '@/types'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface Props {
  data: TrendResponse | undefined
  isLoading: boolean
}

// Custom tooltip agar format angka pakai Rupiah
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-md text-sm space-y-1">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function TrendChart({ data, isLoading }: Props) {
  const chartData = data?.items.map((item) => ({
    name: item.month_label,
    Pemasukan: parseFloat(item.total_income),
    Pengeluaran: parseFloat(item.total_expense),
  })) ?? []

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h2 className="text-sm font-semibold text-foreground mb-4">Tren 6 Bulan Terakhir</h2>

      {isLoading && (
        <div className="h-56 flex items-center justify-center">
          <div className="h-full w-full bg-muted rounded animate-pulse" />
        </div>
      )}

      {!isLoading && chartData.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-10">
          Belum ada data transaksi.
        </p>
      )}

      {!isLoading && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) =>
                v >= 1_000_000
                  ? `${(v / 1_000_000).toFixed(1)}jt`
                  : v >= 1_000
                  ? `${(v / 1_000).toFixed(0)}rb`
                  : String(v)
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
            />
            <Line
              type="monotone"
              dataKey="Pemasukan"
              stroke={CHART_COLORS.income}
              strokeWidth={2}
              dot={{ r: 3, fill: CHART_COLORS.income }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Pengeluaran"
              stroke={CHART_COLORS.expense}
              strokeWidth={2}
              dot={{ r: 3, fill: CHART_COLORS.expense }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
