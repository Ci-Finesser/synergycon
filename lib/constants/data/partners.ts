/**
 * Partner Data Constants
 * 
 * Auto-generated from database by sync-db-to-constants.ts
 * Edit this file and run db:seed to push changes back to the database.
 * 
 * Last synced: 2026-01-20T07:25:43.563Z
 */

export interface PartnerData {
  id: string
  name: string
  logo_url: string | null
  website_url: string | null
  category: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export const PARTNERS_DATA = [] as const

export type PartnerId = typeof PARTNERS_DATA[number]['id']
