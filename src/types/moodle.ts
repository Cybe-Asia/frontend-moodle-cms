export interface MoodleConfig {
  base_url: string
  ws_token_masked: string
  is_active: boolean
  updated_by?: string
  updated_at: string
  configured?: boolean
}

export interface Category {
  id: number
  name: string
  parent: number
  coursecount: number
}

export interface MoodleTestResult {
  success: boolean
  moodle_base_url?: string
  categories_found?: number
  error?: string
}
