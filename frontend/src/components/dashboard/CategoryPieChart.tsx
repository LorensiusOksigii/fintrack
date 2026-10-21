import { DEFAULT_CATEGORY_COLOR } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import type { CategoryBreakdownResponse } from '@/types'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface Props {
  data: CategoryBreakdownResponse | undefined
  isLoading: boolean
}

function CustomTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { color: string | null } }>
}) {
  if (!active || !payload?.length) return null
  const item = payload[0]

  return (
    <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-md text-sm space-y-1">
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: item.payload.color ?? DEFAULT_CATEGORY_COLOR }}
        />
        <span className="font-semibold text-foreground">{item.name}</span>
      </div>
      <p className="text-muted-foreground">{formatCurrency(item.value)}</p>
    </div>
  )
}

// Legend custom di bawah chart — lebih fleksibel dari Recharts default
function ChartLegend({ items }: { items: CategoryBreakdownResponse['items'] }) {
  return (
    <div className="mt-4 space-y-1.5 max-h-36 overflow-y-auto pr-1">
      {items.map((item) => (
        <div key={item.category_id} className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.category_color ?? DEFAULT_CATEGORY_COLOR }}
            />
            <span className="text-foreground truncate">{item.category_name}</span>
          </div>
          <span className="text-muted-foreground ml-2 shrink-0">{item.percentage.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  )
}

export default function CategoryPieChart({ data, isLoading }: Props) {
  const chartData = data?.items.map((item) => ({
    name: item.category_name,
    value: parseFloat(item.total_amount),
    color: item.category_color,
  })) ?? []

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h2 className="text-sm font-semibold text-foreground mb-2">
        Pengeluaran per Kategori
      </h2>

      {isLoading && (
        <div className="h-48 flex items-center justify-center">
          <div className="h-40 w-40 bg-muted rounded-full animate-pulse" />
        </div>
      )}

      {!isLoading && chartData.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-10">
          Belum ada pengeluaran bulan ini.
        </p>
      )}

      {!isLoading && chartData.length > 0 && (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}   // donut style
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color ?? DEFAULT_CATEGORY_COLOR}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {data && <ChartLegend items={data.items} />}
        </>
      )}
    </div>
  )
}
