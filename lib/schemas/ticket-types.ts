/**
 * Ticket Types Schema
 * 
 * Single source of truth for ticket_types table operations.
 */

import { z } from 'zod'
import {
  uuidSchema,
  positiveAmountSchema,
  metadataSchema,
} from './common'

// ============================================================================
// DATABASE COLUMN SCHEMA
// ============================================================================

export const ticketCategorySchema = z.enum([
  'vip',
  'vip-plus',
  'vvip',
  'priority',
])

export const ticketDurationSchema = z.enum([
  'day',
  'full-event',
])

export const ticketAccessTypeSchema = z.enum([
  'day',
  'full',
])

/**
 * Schema for inserting a ticket type
 */
export const ticketTypeInsertSchema = z.object({
  // Required fields
  name: z.string().min(1, 'Name is required').max(255),
  price: positiveAmountSchema,
  
  // Optional fields
  description: z.string().optional().nullable(),
  category: ticketCategorySchema.optional().default('vip'),
  ticket_id: z.string().optional().nullable(), // Human-readable ID
  duration: ticketDurationSchema.optional().default('day'),
  access_type: ticketAccessTypeSchema.optional().default('day'),
  
  // Availability
  available_quantity: z.number().int().nonnegative().default(100),
  sold_quantity: z.number().int().nonnegative().default(0),
  max_per_order: z.number().int().positive().default(10),
  
  // Status
  is_active: z.boolean().default(true),
  
  // Display
  display_order: z.number().int().default(0),
  
  // Dates
  sale_start: z.string().datetime().optional().nullable(),
  sale_end: z.string().datetime().optional().nullable(),
  valid_from: z.string().datetime().optional().nullable(),
  valid_until: z.string().datetime().optional().nullable(),
  
  // Features
  features: metadataSchema,
  metadata: metadataSchema,
})

/**
 * Schema for updating a ticket type
 */
export const ticketTypeUpdateSchema = ticketTypeInsertSchema.partial().extend({
  updated_at: z.string().datetime().optional(),
})

/**
 * Full ticket type from database
 */
export const ticketTypeSchema = ticketTypeInsertSchema.extend({
  id: uuidSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// ============================================================================
// PUBLIC TICKET TYPE (for frontend display)
// ============================================================================

export const publicTicketTypeSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  category: ticketCategorySchema,
  available_quantity: z.number(),
  sold_quantity: z.number(),
  max_per_order: z.number(),
  is_active: z.boolean(),
  display_order: z.number(),
  features: metadataSchema,
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type TicketTypeInsert = z.infer<typeof ticketTypeInsertSchema>
export type TicketTypeUpdate = z.infer<typeof ticketTypeUpdateSchema>
export type TicketType = z.infer<typeof ticketTypeSchema>
export type PublicTicketType = z.infer<typeof publicTicketTypeSchema>
export type TicketCategory = z.infer<typeof ticketCategorySchema>
export type TicketDuration = z.infer<typeof ticketDurationSchema>
export type TicketAccessType = z.infer<typeof ticketAccessTypeSchema>

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateTicketTypeInsert(data: unknown): {
  success: boolean
  data?: TicketTypeInsert
  error?: z.ZodError
} {
  const result = ticketTypeInsertSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true, data: result.data }
}

export function validateTicketTypeUpdate(data: unknown): {
  success: boolean
  data?: TicketTypeUpdate
  error?: z.ZodError
} {
  const result = ticketTypeUpdateSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true, data: result.data }
}
