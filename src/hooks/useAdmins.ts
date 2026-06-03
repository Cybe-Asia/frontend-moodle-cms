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
