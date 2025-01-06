import type { TrainingType } from '../enums.types'

export interface TrainingsTable {
  Row: {
    created_at: string
    date: string
    end_time: string
    id: string
    other_type_details: string | null
    start_time: string
    type: TrainingType
    notification_week_before: string | null
    notification_missing_players: string | null
    notification_day_before: string | null
  }
  Insert: {
    created_at?: string
    date: string
    end_time: string
    id?: string
    other_type_details?: string | null
    start_time: string
    type: TrainingType
    notification_week_before?: string | null
    notification_missing_players?: string | null
    notification_day_before?: string | null
  }
  Update: {
    created_at?: string
    date?: string
    end_time?: string
    id?: string
    other_type_details?: string | null
    start_time?: string
    type?: TrainingType
    notification_week_before?: string | null
    notification_missing_players?: string | null
    notification_day_before?: string | null
  }
}