import { categoriesApi } from '@/api'
import { QUERY_KEYS } from '@/lib/constants'
import type { CategoryCreateRequest, CategoryUpdateRequest } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: categoriesApi.list,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CategoryCreateRequest) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryUpdateRequest }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories })
    },
  })
}
