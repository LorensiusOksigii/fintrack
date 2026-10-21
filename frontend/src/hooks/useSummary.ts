import { summaryApi } from '@/api'
import { QUERY_KEYS } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'

export function useMonthlySummary(month: number, year: number) {
  return useQuery({
    queryKey: QUERY_KEYS.summaryMonthly(month, year),
    queryFn: () => summaryApi.monthly(month, year),
  })
}

export function useBudgetProgress(month: number, year: number) {
  return useQuery({
    queryKey: QUERY_KEYS.summaryBudgetProgress(month, year),
    queryFn: () => summaryApi.budgetProgress(month, year),
  })
}

export function useMonthlyTrends(months = 6) {
  return useQuery({
    queryKey: QUERY_KEYS.summaryTrends(months),
    queryFn: () => summaryApi.trends(months),
  })
}

export function useCategoryBreakdown(month: number, year: number) {
  return useQuery({
    queryKey: QUERY_KEYS.summaryCategoryBreakdown(month, year),
    queryFn: () => summaryApi.categoryBreakdown(month, year),
  })
}
