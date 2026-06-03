import type { EnrollmentStatus } from '@/types/participant'

export function statusBadgeClass(status: string): string {
  switch (status) {
    case 'active':          return 'badge-green'
    case 'expired':         return 'badge-red'
    case 'suspended':       return 'badge-orange'
    case 'pending':         return 'badge-blue'
    case 'unenrolled':      return 'badge-gray'
    case 'no enrollments':  return 'badge-gray'
    default:                return 'badge-gray'
  }
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'active':         return 'Active'
    case 'expired':        return 'Expired'
    case 'suspended':      return 'Suspended'
    case 'pending':        return 'Pending'
    case 'unenrolled':     return 'Unenrolled'
    case 'no enrollments': return 'No Enrollments'
    default:               return status
  }
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
}
