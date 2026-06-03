import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { SuperAdminRoute } from '@/components/SuperAdminRoute'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import LoginPage from '@/pages/LoginPage'
import ParticipantsPage from '@/pages/ParticipantsPage'
import AdminManagementPage from '@/pages/AdminManagementPage'
import MoodleSettingsPage from '@/pages/MoodleSettingsPage'

function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-400 mb-2">403</h1>
        <p className="text-gray-400">You don't have permission to access this page.</p>
      </div>
    </div>
  )
}

export default function App() {
  const { setUser, clearUser, setLoading } = useAuthStore()

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    authService.me()
      .then(setUser)
      .catch(() => {
        clearUser()
      })
  }, [setUser, clearUser, setLoading])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Navigate to="/dashboard/participants" replace />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/participants"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ParticipantsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admins"
          element={
            <ProtectedRoute>
              <SuperAdminRoute>
                <DashboardLayout>
                  <AdminManagementPage />
                </DashboardLayout>
              </SuperAdminRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/moodle-settings"
          element={
            <ProtectedRoute>
              <SuperAdminRoute>
                <DashboardLayout>
                  <MoodleSettingsPage />
                </DashboardLayout>
              </SuperAdminRoute>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard/participants" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
