import { useQuery } from '@tanstack/react-query'
import { participantService } from '@/services/participant.service'
import type { Category } from '@/types/moodle'

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: participantService.getCategories,
    staleTime: 60_000,
  })
}
