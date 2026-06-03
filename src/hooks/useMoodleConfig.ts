import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { moodleService } from '@/services/moodle.service'

export function useMoodleConfig() {
  return useQuery({
    queryKey: ['moodle-config'],
    queryFn: moodleService.getConfig,
    retry: false,
  })
}

export function useUpdateMoodleConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { base_url: string; ws_token: string }) => moodleService.updateConfig(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['moodle-config'] }),
  })
}

export function useTestMoodleConfig() {
  return useMutation({
    mutationFn: moodleService.testConfig,
  })
}
