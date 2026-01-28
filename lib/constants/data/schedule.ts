/**
 * ScheduleItem Data Constants
 * 
 * Auto-generated from database by sync-db-to-constants.ts
 * Edit this file and run db:seed to push changes back to the database.
 * 
 * Last synced: 2026-01-20T07:25:43.569Z
 */

export interface ScheduleItemData {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  day: number
  track: string | null
  location: string | null
  speaker_ids: string[] | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export const SCHEDULE_ITEMS_DATA = [] as const

export type ScheduleItemId = typeof SCHEDULE_ITEMS_DATA[number]['id']
