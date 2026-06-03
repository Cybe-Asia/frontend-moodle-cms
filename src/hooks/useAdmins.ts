import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import type { CreateAdminRequest } from '@/types/admin'

export function useAdmins(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['admins', page, limit],
    queryFn: () => adminService.list({ page, limit }),
  })
}

export function useCreateAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAdminRequest) => adminService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admins'] }),
  })
}

export function useToggleAdminStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminService.toggleStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admins'] }),
  })
}

export function useResetAdminPassword() {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      adminService.resetPassword(id, newPassword),
  })
}

export function useAdminCategories(adminId: string | null) {
  return useQuery({
    queryKey: ['admin-categories', adminId],
    queryFn: () => adminService.getAdminCategories(adminId!),
    enabled: !!adminId,
  })
}

export function useSetAdminCategories() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ adminId, categories }: {
      adminId: string
      categories: { category_id: number; category_name: string }[]
    }) => adminService.setAdminCategories(adminId, categories),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['admin-categories', vars.adminId] }),
  })
}

export function useMyCategories() {
  return useQuery({
    queryKey: ['my-categories'],
    queryFn: adminService.myCategories,
    staleTime: 60_000,
  })
}
