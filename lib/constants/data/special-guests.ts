/**
 * SpecialGuest Data Constants
 * 
 * Auto-generated from database by sync-db-to-constants.ts
 * Edit this file and run db:seed to push changes back to the database.
 * 
 * Last synced: 2026-01-20T07:25:43.556Z
 */

export interface SpecialGuestData {
  id: string
  name: string
  title: string | null
  image_url: string | null
  category: string | null
  description: string | null
  social_links: Record<string, string> | null
  display_order: number
  is_featured: boolean
  created_at: string
  updated_at: string
}

export const SPECIAL_GUESTS_DATA = [
] as const

export type SpecialGuestId = typeof SPECIAL_GUESTS_DATA[number]['id']
