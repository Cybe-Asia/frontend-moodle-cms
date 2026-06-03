import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

interface Props {
  children: React.ReactNode
}

export function SuperAdminRoute({ children }: Props) {
  const { user } = useAuthStore()

  if (user?.role !== 'super_admin') {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
