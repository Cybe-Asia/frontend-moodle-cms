export type EnrollmentStatus = 'active' | 'expired' | 'suspended' | 'pending' | 'unenrolled'

export interface EnrollmentSummary {
  total: number
  active: number
  pending: number
  expired: number
  suspended: number
  unenrolled: number
  overall: string // 'active' | 'expired' | 'suspended' | 'pending' | 'unenrolled' | 'no enrollments'
}

export interface Participant {
  id: string
  moodle_user_id: number
  username: string
  firstname: string
  lastname: string
  email: string
  idnumber?: string
  moodle_login_url?: string
  created_by?: string
  created_at: string
  enrollment_summary?: EnrollmentSummary
}

export interface Enrollment {
  id: string
  participant_id: string
  moodle_user_id: number
  course_id: number
  course_name: string
  category_id: number
  category_name: string
  role_id: number
  start_date: string
  end_date?: string
  timestart: number
  timeend: number
  status: EnrollmentStatus
  suspend: boolean
  enrolled_by?: string
  created_at: string
  updated_at: string
}

export interface EnrollmentStatus_Response {
  participant: Participant
  enrollments: Array<Enrollment & { computed_status: EnrollmentStatus }>
  live_courses: Array<{ id: number; fullname: string }>
}

export interface RegisterEnrollRequest {
  username: string
  password: string
  firstname: string
  lastname: string
  email: string
  category_ids: number[]
  role_id: number
  start_date: string
  end_date?: string
  idnumber?: string
  force_password_reset?: boolean
  suspend?: boolean
}

export interface RegisterEnrollResponse {
  participant_id: string
  moodle_user_id: number
  username: string
  email: string
  courses_enrolled: number
  enrollments: Array<{
    course_id: number
    course_name: string
    category_id: number
    category_name: string
  }>
}
