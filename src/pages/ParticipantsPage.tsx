import { useState, useCallback } from 'react'
import { useParticipants, useEnrollmentStatus, useRegisterEnroll, useUpdateEnrollment, useUnenroll } from '@/hooks/useParticipants'
import { useCategories } from '@/hooks/useCategories'
import { useMyCategories } from '@/hooks/useAdmins'
import { useAuthStore } from '@/store/auth.store'
import { statusBadgeClass, statusLabel, formatDate } from '@/utils/status'
import type { Participant, RegisterEnrollRequest } from '@/types/participant'
import type { Category } from '@/types/moodle'

// ─── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  return <span className={statusBadgeClass(status as any)}>{status}</span>
}

// ─── Register Modal ────────────────────────────────────────────────────────────
function RegisterModal({ categories, onClose }: { categories: Category[]; onClose: () => void }) {
  const { user } = useAuthStore()
  const isSuperAdmin = user?.role === 'super_admin'
  const { data: myCategories = [] } = useMyCategories()
  const { mutateAsync, isPending } = useRegisterEnroll()
  const [form, setForm] = useState<RegisterEnrollRequest>({
    username: '', password: '', firstname: '', lastname: '', email: '',
    category_ids: [], role_id: 5, start_date: '', end_date: '',
    idnumber: '', force_password_reset: true, suspend: false,
  })
  const [showPass, setShowPass] = useState(false)
  const [noExpiry, setNoExpiry] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<any>(null)
  const [step, setStep] = useState('')

  const toggleCategory = (id: number) => {
    setForm((f) => ({
      ...f,
      category_ids: f.category_ids.includes(id)
        ? f.category_ids.filter((c) => c !== id)
        : [...f.category_ids, id],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setStep('Creating user in Moodle…')
    try {
      const payload = { ...form, end_date: noExpiry ? '' : form.end_date }
      setStep('Fetching courses…')
      const res = await mutateAsync(payload)
      setStep('Enrolling…')
      setSuccess(res)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed.')
    } finally {
      setStep('')
    }
  }

  if (success) {
    return (
      <ModalShell title="Registration Successful" onClose={onClose}>
        <div className="space-y-4">
          <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-4">
            <p className="text-green-400 font-semibold mb-2">✓ User registered successfully</p>
            <p className="text-sm text-gray-300">Username: <span className="text-white font-medium">{success.username}</span></p>
            <p className="text-sm text-gray-300">Moodle ID: <span className="text-white font-medium">{success.moodle_user_id}</span></p>
            <p className="text-sm text-gray-300 mt-2">Courses enrolled: <span className="text-white font-bold">{success.courses_enrolled}</span></p>
          </div>
          {success.enrollments?.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {success.enrollments.map((e: any) => (
                <div key={e.course_id} className="flex justify-between text-sm text-gray-400 py-1 border-b border-[#2e3248]">
                  <span>{e.course_name}</span>
                  <span className="text-gray-500">{e.category_name}</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={onClose} className="btn-primary w-full">Done</button>
        </div>
      </ModalShell>
    )
  }

  return (
    <ModalShell title="Register New Participant" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name *">
            <input required value={form.firstname} onChange={(e) => setForm((f) => ({ ...f, firstname: e.target.value }))} placeholder="First name" />
          </Field>
          <Field label="Last Name *">
            <input required value={form.lastname} onChange={(e) => setForm((f) => ({ ...f, lastname: e.target.value }))} placeholder="Last name" />
          </Field>
        </div>
        <Field label="Username *">
          <input required value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="moodle_username" />
        </Field>
        <Field label="Email *">
          <input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="user@example.com" />
        </Field>
        <Field label="Password *">
          <div className="relative">
            <input required type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Password" />
            <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs">{showPass ? 'Hide' : 'Show'}</button>
          </div>
        </Field>
        <Field label="ID Number (optional)" tooltip="External CMS ID for cross-reference">
          <input value={form.idnumber} onChange={(e) => setForm((f) => ({ ...f, idnumber: e.target.value }))} placeholder="EMP-001" />
        </Field>

        {/* Categories — Super Admin: manual pick | Admin: read-only assigned list */}
        {isSuperAdmin ? (
          <div>
            <label>Categories *</label>
            <div className="bg-[#2a2d42] border border-[#2e3248] rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
              {categories.filter(c => c.id !== 1).map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer mb-0">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-indigo-500"
                    checked={form.category_ids.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                  />
                  <span className="text-sm text-gray-200">{cat.name}</span>
                  <span className="text-xs text-gray-500 ml-auto">{cat.coursecount} courses</span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label>Enrolled to Categories (assigned by Super Admin)</label>
            {myCategories.length === 0 ? (
              <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3 text-sm text-yellow-400">
                ⚠️ Belum ada kategori yang diassign ke akunmu. Hubungi Super Admin.
              </div>
            ) : (
              <div className="bg-[#2a2d42] border border-[#2e3248] rounded-lg p-3 space-y-2">
                {myCategories.map(cat => (
                  <div key={cat.category_id} className="flex items-center gap-2 text-sm">
                    <span className="text-indigo-400">✓</span>
                    <span className="text-gray-200">{cat.category_name}</span>
                  </div>
                ))}
                <p className="text-xs text-gray-500 pt-1">Peserta akan di-enroll ke semua kategori di atas secara otomatis.</p>
              </div>
            )}
          </div>
        )}

        {/* Role */}
        <Field label="Role *">
          <select value={form.role_id} onChange={(e) => setForm((f) => ({ ...f, role_id: Number(e.target.value) }))}>
            <option value={5}>Student (5)</option>
            <option value={3}>Teacher (3)</option>
            <option value={4}>Non-editing Teacher (4)</option>
          </select>
        </Field>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date *">
            <input required type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} />
          </Field>
          <Field label="End Date">
            <input type="date" disabled={noExpiry} value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} />
          </Field>
        </div>
        <label className="flex items-center gap-2 cursor-pointer mb-0">
          <input type="checkbox" className="w-4 h-4 accent-indigo-500" checked={noExpiry} onChange={(e) => setNoExpiry(e.target.checked)} />
          <span className="text-sm text-gray-300">No expiry date</span>
        </label>

        {/* Toggles */}
        <div className="flex gap-6">
          <Toggle label="Force password reset" value={form.force_password_reset ?? true} onChange={(v) => setForm((f) => ({ ...f, force_password_reset: v }))} />
          <Toggle label="Suspend on creation" value={form.suspend ?? false} onChange={(v) => setForm((f) => ({ ...f, suspend: v }))} />
        </div>

        {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/40 rounded px-3 py-2">{error}</p>}

        {step && (
          <div className="flex items-center gap-2 text-sm text-indigo-400">
            <span className="animate-spin h-4 w-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full" />
            {step}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || (isSuperAdmin && form.category_ids.length === 0) || (!isSuperAdmin && myCategories.length === 0)}
          className="btn-primary w-full"
        >
          {isPending ? 'Processing…' : 'Register & Enroll'}
        </button>
      </form>
    </ModalShell>
  )
}

// ─── Enrollment Status Modal ───────────────────────────────────────────────────
function EnrollmentStatusModal({ participant, onClose }: { participant: Participant; onClose: () => void }) {
  const { data, isLoading } = useEnrollmentStatus(participant.moodle_user_id)

  return (
    <ModalShell title={`Enrollments — ${participant.firstname} ${participant.lastname}`} onClose={onClose}>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            {(['active', 'pending', 'expired'] as const).map((s) => {
              const count = data?.enrollments?.filter((e) => (e.computed_status || e.status) === s).length ?? 0
              return (
                <div key={s} className="bg-[#2a2d42] rounded-lg p-3">
                  <p className="text-xl font-bold text-gray-100">{count}</p>
                  <p className="text-xs text-gray-400 capitalize">{s}</p>
                </div>
              )
            })}
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#2e3248]">
                <th className="table-header text-left py-2">Course</th>
                <th className="table-header text-left py-2">Category</th>
                <th className="table-header text-left py-2">Period</th>
                <th className="table-header text-left py-2">Status</th>
              </tr></thead>
              <tbody>
                {data?.enrollments?.map((e) => (
                  <tr key={e.id} className="table-row">
                    <td className="py-2 pr-3 text-gray-200">{e.course_name}</td>
                    <td className="py-2 pr-3 text-gray-400">{e.category_name}</td>
                    <td className="py-2 pr-3 text-gray-400 text-xs">
                      {formatDate(e.start_date)} → {e.end_date ? formatDate(e.end_date) : '∞'}
                    </td>
                    <td className="py-2"><StatusBadge status={e.computed_status || e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={onClose} className="btn-secondary w-full">Close</button>
        </div>
      )}
    </ModalShell>
  )
}

// ─── Update Enrollment Modal ───────────────────────────────────────────────────
function UpdateEnrollmentModal({ participant, onClose }: { participant: Participant; onClose: () => void }) {
  const { data, isLoading } = useEnrollmentStatus(participant.moodle_user_id)
  const { mutateAsync, isPending } = useUpdateEnrollment()
  const [selectedCourses, setSelectedCourses] = useState<number[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [suspend, setSuspend] = useState(false)
  const [roleID, setRoleID] = useState(5)
  const [error, setError] = useState('')

  const toggleCourse = (id: number) => {
    setSelectedCourses((cs) => cs.includes(id) ? cs.filter((c) => c !== id) : [...cs, id])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await mutateAsync({ moodleUserID: participant.moodle_user_id, data: {
        course_ids: selectedCourses, start_date: startDate, end_date: endDate || undefined,
        suspend, role_id: roleID,
      }})
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Update failed.')
    }
  }

  return (
    <ModalShell title={`Update Enrollment — ${participant.firstname} ${participant.lastname}`} onClose={onClose}>
      {isLoading ? <Spinner /> : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Select Courses to Update</label>
            <div className="bg-[#2a2d42] border border-[#2e3248] rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
              {data?.enrollments?.map((e) => (
                <label key={e.id} className="flex items-center gap-2 cursor-pointer mb-0">
                  <input type="checkbox" className="w-4 h-4 accent-indigo-500"
                    checked={selectedCourses.includes(e.course_id)}
                    onChange={() => toggleCourse(e.course_id)} />
                  <span className="text-sm text-gray-200">{e.course_name}</span>
                  <StatusBadge status={e.status} />
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="New Start Date *">
              <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <Field label="New End Date">
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Field>
          </div>
          <Field label="Role">
            <select value={roleID} onChange={(e) => setRoleID(Number(e.target.value))}>
              <option value={5}>Student (5)</option>
              <option value={3}>Teacher (3)</option>
              <option value={4}>Non-editing Teacher (4)</option>
            </select>
          </Field>
          <Toggle label="Suspend enrollments" value={suspend} onChange={setSuspend} />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={isPending || selectedCourses.length === 0} className="btn-primary w-full">
            {isPending ? 'Updating…' : 'Update Enrollment'}
          </button>
        </form>
      )}
    </ModalShell>
  )
}

// ─── Unenroll Modal ────────────────────────────────────────────────────────────
function UnenrollModal({ participant, onClose }: { participant: Participant; onClose: () => void }) {
  const { data, isLoading } = useEnrollmentStatus(participant.moodle_user_id)
  const { mutateAsync, isPending } = useUnenroll()
  const [selectedCourses, setSelectedCourses] = useState<number[]>([])
  const [unenrollAll, setUnenrollAll] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')

  const toggleCourse = (id: number) => {
    setSelectedCourses((cs) => cs.includes(id) ? cs.filter((c) => c !== id) : [...cs, id])
  }

  const handleSubmit = async () => {
    setError('')
    try {
      await mutateAsync({
        moodleUserID: participant.moodle_user_id,
        data: unenrollAll ? { unenroll_all: true } : { course_ids: selectedCourses },
      })
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Unenroll failed.')
    }
  }

  return (
    <ModalShell title={`Unenroll — ${participant.firstname} ${participant.lastname}`} onClose={onClose}>
      {isLoading ? <Spinner /> : (
        <div className="space-y-4">
          <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3 text-sm text-yellow-400">
            ⚠️ Unenrolling removes grades. Consider suspending instead.
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input type="checkbox" className="w-4 h-4 accent-red-500" checked={unenrollAll} onChange={(e) => { setUnenrollAll(e.target.checked); setSelectedCourses([]) }} />
              <span className="text-sm font-medium text-red-400">Unenroll from ALL courses</span>
            </label>
          </div>

          {!unenrollAll && (
            <div>
              <label>Select Courses</label>
              <div className="bg-[#2a2d42] border border-[#2e3248] rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                {data?.enrollments?.map((e) => (
                  <label key={e.id} className="flex items-center gap-2 cursor-pointer mb-0">
                    <input type="checkbox" className="w-4 h-4 accent-indigo-500"
                      checked={selectedCourses.includes(e.course_id)}
                      onChange={() => toggleCourse(e.course_id)} />
                    <span className="text-sm text-gray-200">{e.course_name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {!confirmed ? (
            <button
              disabled={!unenrollAll && selectedCourses.length === 0}
              onClick={() => setConfirmed(true)}
              className="btn-danger w-full"
            >
              Continue
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-400 text-center">Are you sure? This action cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmed(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSubmit} disabled={isPending} className="btn-danger flex-1">
                  {isPending ? 'Unenrolling…' : 'Confirm Unenroll'}
                </button>
              </div>
            </div>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      )}
    </ModalShell>
  )
}

// ─── Participants Page (main) ──────────────────────────────────────────────────
export default function ParticipantsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modal, setModal] = useState<null | 'register' | 'status' | 'update' | 'unenroll'>(null)
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)

  const { data, isLoading } = useParticipants({ page, limit: 20, search: search || undefined, status: statusFilter || undefined })
  const { data: categories = [] } = useCategories()

  const openModal = useCallback((type: typeof modal, p?: Participant) => {
    setSelectedParticipant(p ?? null)
    setModal(type)
  }, [])

  const closeModal = () => { setModal(null); setSelectedParticipant(null) }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Participants</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage Moodle user registrations and enrollments</p>
        </div>
        <button onClick={() => openModal('register')} className="btn-primary">
          + Register Participant
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <input
          className="max-w-xs"
          placeholder="Search name, email, username…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
        <select
          className="max-w-[180px]"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="expired">Expired</option>
          <option value="suspended">Suspended</option>
          <option value="unenrolled">Unenrolled</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center"><Spinner /></div>
        ) : !data?.data?.length ? (
          <div className="p-12 text-center text-gray-500">No participants found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2e3248]">
                <th className="table-header text-left px-6 py-3">Name</th>
                <th className="table-header text-left px-4 py-3">Username</th>
                <th className="table-header text-left px-4 py-3">Email</th>
                <th className="table-header text-left px-4 py-3">Status</th>
                <th className="table-header text-left px-4 py-3">Courses</th>
                <th className="table-header text-left px-4 py-3">Registered</th>
                <th className="table-header text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((p) => {
                const summary = p.enrollment_summary
                const overall = summary?.overall || 'no enrollments'
                return (
                <tr key={p.id} className="table-row">
                  <td className="px-6 py-3 font-medium text-gray-200">{p.firstname} {p.lastname}</td>
                  <td className="px-4 py-3 text-gray-400">{p.username}</td>
                  <td className="px-4 py-3 text-gray-400">{p.email}</td>
                  <td className="px-4 py-3">
                    <span className={statusBadgeClass(overall)}>{statusLabel(overall)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {summary && summary.total > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {summary.active > 0 && <span className="badge-green text-xs">{summary.active} active</span>}
                        {summary.pending > 0 && <span className="badge-blue text-xs">{summary.pending} pending</span>}
                        {summary.expired > 0 && <span className="badge-red text-xs">{summary.expired} expired</span>}
                        {summary.suspended > 0 && <span className="badge-orange text-xs">{summary.suspended} suspended</span>}
                        {summary.unenrolled > 0 && <span className="badge-gray text-xs">{summary.unenrolled} unenrolled</span>}
                      </div>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ActionBtn label="View" onClick={() => openModal('status', p)} />
                      <ActionBtn label="Update" onClick={() => openModal('update', p)} />
                      <ActionBtn label="Unenroll" onClick={() => openModal('unenroll', p)} danger />
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {data && data.total > 20 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-[#2e3248]">
            <p className="text-sm text-gray-500">
              {(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)} of {data.total}
            </p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary px-3 py-1 text-xs disabled:opacity-30">← Prev</button>
              <button disabled={page * 20 >= data.total} onClick={() => setPage((p) => p + 1)} className="btn-secondary px-3 py-1 text-xs disabled:opacity-30">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === 'register' && <RegisterModal categories={categories} onClose={closeModal} />}
      {modal === 'status' && selectedParticipant && <EnrollmentStatusModal participant={selectedParticipant} onClose={closeModal} />}
      {modal === 'update' && selectedParticipant && <UpdateEnrollmentModal participant={selectedParticipant} onClose={closeModal} />}
      {modal === 'unenroll' && selectedParticipant && <UnenrollModal participant={selectedParticipant} onClose={closeModal} />}
    </div>
  )
}

// ─── Shared helpers ────────────────────────────────────────────────────────────
function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#212435] border border-[#2e3248] rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e3248]">
          <h2 className="font-semibold text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, tooltip, children }: { label: string; tooltip?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1">
        {label}
        {tooltip && <span title={tooltip} className="text-gray-500 cursor-help text-xs">ⓘ</span>}
      </label>
      {children}
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer mb-0">
      <div
        onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${value ? 'bg-indigo-600' : 'bg-[#3a3d52]'} relative`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-sm text-gray-300">{label}</span>
    </label>
  )
}

function ActionBtn({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2 py-1 rounded border transition-colors
        ${danger
          ? 'border-red-800/50 text-red-400 hover:bg-red-900/20'
          : 'border-[#2e3248] text-gray-400 hover:bg-[#2a2d42] hover:text-gray-200'
        }`}
    >
      {label}
    </button>
  )
}

function Spinner() {
  return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto" />
}
