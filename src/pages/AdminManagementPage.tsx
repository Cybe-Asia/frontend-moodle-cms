import { useState } from 'react'
import { useAdmins, useCreateAdmin, useToggleAdminStatus, useResetAdminPassword } from '@/hooks/useAdmins'
import { formatDate } from '@/utils/status'
import type { AdminUser } from '@/types/admin'

// ─── Password strength ─────────────────────────────────────────────────────────
function passwordStrength(pw: string): { label: string; color: string; width: string } {
  if (pw.length < 6) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' }
  if (pw.length < 10 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { label: 'Medium', color: 'bg-yellow-500', width: 'w-2/4' }
  return { label: 'Strong', color: 'bg-green-500', width: 'w-full' }
}

function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null
  const { label, color, width } = passwordStrength(password)
  return (
    <div className="mt-1.5 space-y-1">
      <div className="h-1 bg-[#3a3d52] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color} ${width}`} />
      </div>
      <p className={`text-xs ${color.replace('bg-', 'text-')}`}>{label}</p>
    </div>
  )
}

// ─── Create Admin Modal ────────────────────────────────────────────────────────
function CreateAdminModal({ onClose }: { onClose: () => void }) {
  const { mutateAsync, isPending } = useCreateAdmin()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    setError('')
    try {
      await mutateAsync({ username: form.username, email: form.email, password: form.password })
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create admin.')
    }
  }

  return (
    <ModalShell title="Create Admin" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Username *">
          <input required minLength={3} value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="min. 3 characters" />
        </Field>
        <Field label="Email *">
          <input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="admin@example.com" />
        </Field>
        <Field label="Password *">
          <div className="relative">
            <input required type={showPass ? 'text' : 'password'} minLength={8}
              value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="min. 8 characters" />
            <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs">{showPass ? 'Hide' : 'Show'}</button>
          </div>
          <PasswordStrengthBar password={form.password} />
        </Field>
        <Field label="Confirm Password *">
          <input required type="password" value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} placeholder="Repeat password" />
        </Field>
        {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/30 rounded px-3 py-2">{error}</p>}
        <button type="submit" disabled={isPending} className="btn-primary w-full">
          {isPending ? 'Creating…' : 'Create Admin'}
        </button>
      </form>
    </ModalShell>
  )
}

// ─── Deactivate Confirm Modal ──────────────────────────────────────────────────
function ConfirmDeactivateModal({ admin, onConfirm, onClose }: { admin: AdminUser; onConfirm: () => void; onClose: () => void }) {
  return (
    <ModalShell title="Deactivate Admin" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-gray-300">
          Deactivate <span className="font-semibold text-white">{admin.username}</span>?
        </p>
        <p className="text-sm text-gray-500">This admin will lose access immediately.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} className="btn-danger flex-1">Deactivate</button>
        </div>
      </div>
    </ModalShell>
  )
}

// ─── Reset Password Modal ──────────────────────────────────────────────────────
function ResetPasswordModal({ admin, onClose }: { admin: AdminUser; onClose: () => void }) {
  const { mutateAsync, isPending } = useResetAdminPassword()
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) { setError('Passwords do not match.'); return }
    setError('')
    try {
      await mutateAsync({ id: admin.id, newPassword: form.newPassword })
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to reset password.')
    }
  }

  return (
    <ModalShell title={`Reset Password — ${admin.username}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="New Password *">
          <div className="relative">
            <input required type={showPass ? 'text' : 'password'} minLength={8}
              value={form.newPassword} onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} placeholder="min. 8 characters" />
            <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">{showPass ? 'Hide' : 'Show'}</button>
          </div>
          <PasswordStrengthBar password={form.newPassword} />
        </Field>
        <Field label="Confirm Password *">
          <input required type="password" value={form.confirmPassword}
            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} placeholder="Repeat password" />
        </Field>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={isPending} className="btn-primary w-full">
          {isPending ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>
    </ModalShell>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminManagementPage() {
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<null | 'create' | 'deactivate' | 'reset'>(null)
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null)

  const { data, isLoading } = useAdmins(page, 20)
  const { mutateAsync: toggleStatus } = useToggleAdminStatus()

  const openModal = (type: typeof modal, admin?: AdminUser) => {
    setSelectedAdmin(admin ?? null)
    setModal(type)
  }
  const closeModal = () => { setModal(null); setSelectedAdmin(null) }

  const handleToggle = async (admin: AdminUser) => {
    if (!admin.is_active) {
      await toggleStatus({ id: admin.id, isActive: true })
    } else {
      openModal('deactivate', admin)
    }
  }

  const handleConfirmDeactivate = async () => {
    if (selectedAdmin) {
      await toggleStatus({ id: selectedAdmin.id, isActive: false })
    }
    closeModal()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Manage Admins</h1>
          <p className="text-gray-500 text-sm mt-0.5">Admin accounts for this CMS panel</p>
        </div>
        <button onClick={() => openModal('create')} className="btn-primary">+ Create Admin</button>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" /></div>
        ) : !data?.data?.length ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg mb-1">No admin accounts yet</p>
            <p className="text-gray-600 text-sm">Create the first admin account to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2e3248]">
                <th className="table-header text-left px-6 py-3">Username</th>
                <th className="table-header text-left px-4 py-3">Email</th>
                <th className="table-header text-left px-4 py-3">Status</th>
                <th className="table-header text-left px-4 py-3">Created</th>
                <th className="table-header text-left px-4 py-3">Last Login</th>
                <th className="table-header text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((admin) => (
                <tr key={admin.id} className="table-row">
                  <td className="px-6 py-3 font-medium text-gray-200">{admin.username}</td>
                  <td className="px-4 py-3 text-gray-400">{admin.email}</td>
                  <td className="px-4 py-3">
                    <span className={admin.is_active ? 'badge-green' : 'badge-red'}>
                      {admin.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(admin.created_at)}</td>
                  <td className="px-4 py-3 text-gray-500">{admin.last_login_at ? formatDate(admin.last_login_at) : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggle(admin)}
                        className={`text-xs px-2 py-1 rounded border transition-colors
                          ${admin.is_active
                            ? 'border-red-800/50 text-red-400 hover:bg-red-900/20'
                            : 'border-green-800/50 text-green-400 hover:bg-green-900/20'
                          }`}
                      >
                        {admin.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => openModal('reset', admin)} className="text-xs px-2 py-1 rounded border border-[#2e3248] text-gray-400 hover:bg-[#2a2d42] hover:text-gray-200">
                        Reset PW
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data && data.total > 20 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-[#2e3248]">
            <p className="text-sm text-gray-500">{(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)} of {data.total}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary px-3 py-1 text-xs disabled:opacity-30">← Prev</button>
              <button disabled={page * 20 >= data.total} onClick={() => setPage((p) => p + 1)} className="btn-secondary px-3 py-1 text-xs disabled:opacity-30">Next →</button>
            </div>
          </div>
        )}
      </div>

      {modal === 'create' && <CreateAdminModal onClose={closeModal} />}
      {modal === 'deactivate' && selectedAdmin && <ConfirmDeactivateModal admin={selectedAdmin} onConfirm={handleConfirmDeactivate} onClose={closeModal} />}
      {modal === 'reset' && selectedAdmin && <ResetPasswordModal admin={selectedAdmin} onClose={closeModal} />}
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#212435] border border-[#2e3248] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e3248]">
          <h2 className="font-semibold text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label>{label}</label>
      {children}
    </div>
  )
}
