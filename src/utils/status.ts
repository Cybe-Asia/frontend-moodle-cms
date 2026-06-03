import type { EnrollmentStatus } from '@/types/participant'

export function statusBadgeClass(status: EnrollmentStatus): string {
  switch (status) {
    case 'active':    return 'badge-green'
    case 'expired':   return 'badge-red'
    case 'suspended': return 'badge-orange'
    case 'pending':   return 'badge-blue'
    default:          return 'badge-gray'
  }
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
}
