import api from './api'
import type {
  Participant,
  RegisterEnrollRequest,
  RegisterEnrollResponse,
  EnrollmentStatus_Response,
} from '@/types/participant'

export const participantService = {
  async list(params: { page?: number; limit?: number; search?: string; status?: string }) {
    const res = await api.get<{ data: Participant[]; total: number; page: number; limit: number }>(
      '/participants',
      { params },
    )
    return res.data
  },

  async registerEnroll(data: RegisterEnrollRequest): Promise<RegisterEnrollResponse> {
    const res = await api.post<RegisterEnrollResponse>('/participants/register-enroll', data)
    return res.data
  },

  async updateEnrollment(
    moodleUserID: number,
    data: { course_ids: number[]; start_date: string; end_date?: string; suspend: boolean; role_id: number },
  ) {
    const res = await api.put(`/participants/${moodleUserID}/enrollment`, data)
    return res.data
  },

  async unenroll(
    moodleUserID: number,
    data: { course_ids?: number[]; category_ids?: number[]; unenroll_all?: boolean },
  ) {
    const res = await api.delete(`/participants/${moodleUserID}/enrollment`, { data })
    return res.data
  },

  async getEnrollmentStatus(moodleUserID: number): Promise<EnrollmentStatus_Response> {
    const res = await api.get<EnrollmentStatus_Response>(`/participants/${moodleUserID}/enrollment`)
    return res.data
  },

  async getCategories() {
    const res = await api.get('/categories')
    return res.data
  },
}
