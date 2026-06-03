import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'

const navItems = [
  { label: 'Participants', path: '/dashboard/participants', roles: ['admin', 'super_admin'], icon: '👥' },
  { label: 'Manage Admins', path: '/dashboard/admins', roles: ['super_admin'], icon: '🛡️' },
  { label: 'Moodle Settings', path: '/dashboard/moodle-settings', roles: ['super_admin'], icon: '⚙️' },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, clearUser } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authService.logout() } catch { /* ignore */ }
    clearUser()
    navigate('/login')
  }

  const filteredNav = navItems.filter((item) => user && item.roles.includes(user.role))

  return (
    <div className="flex h-screen bg-[#1a1d2e] text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#212435] border-r border-[#2e3248] flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[#2e3248]">
          <h1 className="text-lg font-bold text-indigo-400">CMS Admin</h1>
          <p className="text-xs text-gray-500 mt-0.5">Moodle Integration</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {filteredNav.map((item) => {
            const active = location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30'
                    : 'text-gray-400 hover:bg-[#2a2d42] hover:text-gray-200'
                  }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-[#2e3248]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-sm font-bold text-indigo-400">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{user?.username}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-gray-400 hover:text-red-400 transition-colors px-2 py-1.5 rounded hover:bg-red-900/10"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
