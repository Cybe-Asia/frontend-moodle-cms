import api from './api'
import type { MoodleConfig, MoodleTestResult } from '@/types/moodle'

export const moodleService = {
  async getConfig(): Promise<MoodleConfig> {
    const res = await api.get<MoodleConfig>('/super-admin/moodle-config')
    return res.data
  },

  async updateConfig(data: { base_url: string; ws_token: string }): Promise<MoodleConfig & { categories_found: number }> {
    const res = await api.put('/super-admin/moodle-config', data)
    return res.data
  },

  async testConfig(): Promise<MoodleTestResult> {
    const res = await api.post<MoodleTestResult>('/super-admin/moodle-config/test')
    return res.data
  },
}
