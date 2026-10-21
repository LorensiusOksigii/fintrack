import { budgetsApi } from '@/api'
import { QUERY_KEYS } from '@/lib/constants'
import type { BudgetCreateRequest, BudgetUpdateRequest } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useBudgets(month: number, year: number) {
  return useQuery({
    queryKey: QUERY_KEYS.budgets(month, year),
    queryFn: () => budgetsApi.list(month, year),
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BudgetCreateRequest) => budgetsApi.create(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.budgets(variables.month, variables.year),
      })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BudgetUpdateRequest }) =>
      budgetsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => budgetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}
