import { formatCurrency } from '@/lib/utils'
import { DEFAULT_CATEGORY_COLOR } from '@/lib/constants'
import type { BudgetProgressResponse } from '@/types'

interface Props {
  data: BudgetProgressResponse | undefined
  isLoading: boolean
}

function SkeletonRow() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 w-28 bg-muted rounded" />
        <div className="h-4 w-20 bg-muted rounded" />
      </div>
      <div className="h-2 w-full bg-muted rounded-full" />
    </div>
  )
}

export default function BudgetProgressList({ data, isLoading }: Props) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h2 className="text-sm font-semibold text-foreground mb-4">Progress Budget</h2>

      {isLoading && (
        <div className="space-y-5">
          {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      )}

      {!isLoading && (!data || data.items.length === 0) && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Belum ada budget yang ditetapkan bulan ini.
        </p>
      )}

      {!isLoading && data && data.items.length > 0 && (
        <div className="space-y-5">
          {data.items.map((item) => {
            const pct = Math.min(item.percentage_used, 100)
            const color = item.category_color ?? DEFAULT_CATEGORY_COLOR

            return (
              <div key={item.category_id} className="space-y-1.5">
                {/* Label row */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium text-foreground">
                      {item.category_name}
                    </span>
                    {item.is_over_budget && (
                      <span className="text-xs text-destructive font-medium">Over!</span>
                    )}
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {formatCurrency(parseFloat(item.spent_amount))}
                    {' / '}
                    {formatCurrency(parseFloat(item.budget_amount))}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: item.is_over_budget ? '#ef4444' : color,
                    }}
                  />
                </div>

                {/* Percentage */}
                <p className="text-xs text-muted-foreground text-right">
                  {item.percentage_used.toFixed(0)}%
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
