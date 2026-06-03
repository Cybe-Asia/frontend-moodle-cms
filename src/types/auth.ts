export type UserRole = 'admin' | 'super_admin'

export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  is_active: boolean
  last_login_at?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user: {
    id: string
    username: string
    role: UserRole
  }
}

export interface JWTClaims {
  user_id: string
  username: string
  role: UserRole
  exp: number
  iat: number
}
