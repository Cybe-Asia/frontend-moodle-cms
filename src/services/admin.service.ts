import api from './api'
import type { AdminUser, AdminListResponse, CreateAdminRequest, AdminCategoryAssignment } from '@/types/admin'

export const adminService = {
  async list(params: { page?: number; limit?: number }): Promise<AdminListResponse> {
    const res = await api.get<AdminListResponse>('/super-admin/admins', { params })
    return res.data
  },

  async create(data: CreateAdminRequest): Promise<AdminUser> {
    const res = await api.post<AdminUser>('/super-admin/admins', data)
    return res.data
  },

  async toggleStatus(id: string, isActive: boolean) {
    const res = await api.patch(`/super-admin/admins/${id}/status`, { is_active: isActive })
    return res.data
  },

  async resetPassword(id: string, newPassword: string) {
    const res = await api.patch(`/super-admin/admins/${id}/reset-password`, { new_password: newPassword })
    return res.data
  },

  // Category assignments
  async getAdminCategories(adminId: string): Promise<AdminCategoryAssignment[]> {
    const res = await api.get<{ data: AdminCategoryAssignment[] }>(`/super-admin/admins/${adminId}/categories`)
    return res.data.data
  },

  async setAdminCategories(adminId: string, categories: { category_id: number; category_name: string }[]) {
    const res = await api.put(`/super-admin/admins/${adminId}/categories`, { categories })
    return res.data
  },

  // For logged-in admin: get their own assigned categories
  async myCategories(): Promise<AdminCategoryAssignment[]> {
    const res = await api.get<AdminCategoryAssignment[]>('/my-categories')
    return res.data
  },
}
