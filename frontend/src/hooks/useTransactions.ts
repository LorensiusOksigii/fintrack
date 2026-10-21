import { transactionsApi } from '@/api'
import { QUERY_KEYS } from '@/lib/constants'
import type { TransactionCreateRequest, TransactionFilters, TransactionUpdateRequest } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.transactions(filters),
    queryFn: () => transactionsApi.list(filters),
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TransactionCreateRequest) => transactionsApi.create(data),
    onSuccess: () => {
      // Invalidate semua query transactions + summary agar data fresh
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransactionUpdateRequest }) =>
      transactionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}
