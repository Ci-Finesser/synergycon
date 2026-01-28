/**
 * FAQ Data Constants
 * 
 * Auto-generated from database by sync-db-to-constants.ts
 * Edit this file and run db:seed to push changes back to the database.
 * 
 * Last synced: 2026-01-20T07:25:43.572Z
 */

export interface FAQData {
  id: string
  question: string
  answer: string
  category: string | null
  display_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export const FAQS_DATA = [] as const

export type FAQId = typeof FAQS_DATA[number]['id']
