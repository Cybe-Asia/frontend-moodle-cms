import api from './api'
import type { LoginRequest, LoginResponse, User } from '@/types/auth'

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/auth/login', data)
    return res.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async refresh(refreshToken: string): Promise<{ access_token: string }> {
    const res = await api.post('/auth/refresh', { refresh_token: refreshToken })
    return res.data
  },

  async me(): Promise<User> {
    const res = await api.get<User>('/auth/me')
    return res.data
  },
}
