import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { participantService } from '@/services/participant.service'
import type { RegisterEnrollRequest } from '@/types/participant'

interface ListParams {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export function useParticipants(params: ListParams = {}) {
  return useQuery({
    queryKey: ['participants', params],
    queryFn: () => participantService.list(params),
  })
}

export function useRegisterEnroll() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RegisterEnrollRequest) => participantService.registerEnroll(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['participants'] }),
  })
}

export function useEnrollmentStatus(moodleUserID: number | null) {
  return useQuery({
    queryKey: ['enrollment-status', moodleUserID],
    queryFn: () => participantService.getEnrollmentStatus(moodleUserID!),
    enabled: moodleUserID !== null,
  })
}

export function useUpdateEnrollment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ moodleUserID, data }: {
      moodleUserID: number
      data: { course_ids: number[]; start_date: string; end_date?: string; suspend: boolean; role_id: number }
    }) => participantService.updateEnrollment(moodleUserID, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['enrollment-status', vars.moodleUserID] })
      qc.invalidateQueries({ queryKey: ['participants'] })
    },
  })
}

export function useUnenroll() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ moodleUserID, data }: {
      moodleUserID: number
      data: { course_ids?: number[]; category_ids?: number[]; unenroll_all?: boolean }
    }) => participantService.unenroll(moodleUserID, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['enrollment-status', vars.moodleUserID] })
      qc.invalidateQueries({ queryKey: ['participants'] })
    },
  })
}
