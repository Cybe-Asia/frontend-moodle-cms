export interface AdminUser {
  id: string
  username: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  last_login_at?: string
}

export interface CreateAdminRequest {
  username: string
  email: string
  password: string
}

export interface AdminListResponse {
  data: AdminUser[]
  total: number
  page: number
  limit: number
}

export interface AdminCategoryAssignment {
  id: string
  admin_id: string
  category_id: number
  category_name: string
  assigned_by?: string
}
