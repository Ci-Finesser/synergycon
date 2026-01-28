/**
 * Tickets Schema
 * 
 * Single source of truth for tickets table operations.
 * 
 * Note: Unlike ticket_orders (customer_*), tickets uses:
 * - attendee_email (not customer_email)
 * - attendee_name (not customer_name)
 */

import { z } from 'zod'
import {
  emailSchema,
  nameSchema,
  uuidSchema,
  positiveAmountSchema,
  ticketStatusSchema,
  metadataSchema,
} from './common'

// ============================================================================
// DATABASE COLUMN SCHEMA
// ============================================================================

/**
 * Schema for inserting a ticket
 */
export const ticketInsertSchema = z.object({
  // Required fields
  ticket_number: z.string().min(1, 'Ticket number is required'),
  attendee_name: nameSchema,
  attendee_email: emailSchema,
  order_id: z.string().min(1, 'Order ID is required'),
  ticket_type: z.string().min(1, 'Ticket type is required'),
  event_date: z.string().min(1, 'Event date is required'),
  price: positiveAmountSchema,
  
  // Optional fields
  user_id: uuidSchema.optional().nullable(),
  ticket_name: z.string().optional().nullable(),
  ticket_tier: z.enum(['vip', 'vip-plus', 'vvip', 'priority']).optional().nullable(),
  ticket_duration: z.enum(['single-day', 'multi-day', 'full-event']).optional().nullable(),
  valid_for_day: z.string().optional().nullable(),
  quantity: z.number().int().positive().optional().default(1),
  subtotal: positiveAmountSchema.optional().nullable(),
  seat_number: z.string().optional().nullable(),
  
  // Status
  status: ticketStatusSchema.default('active'),
  checked_in: z.boolean().optional().default(false),
  checked_in_at: z.string().datetime().optional().nullable(),
  checked_in_by: uuidSchema.optional().nullable(),
  validated_at: z.string().datetime().optional().nullable(),
  validated_by: uuidSchema.optional().nullable(),
  
  // QR Code
  qr_code: z.string().optional().nullable(),
  
  // Transfer
  transferred_at: z.string().datetime().optional().nullable(),
  transferred_from: uuidSchema.optional().nullable(),
  
  // Metadata
  metadata: metadataSchema.optional().nullable(),
})

/**
 * Schema for updating a ticket
 */
export const ticketUpdateSchema = ticketInsertSchema.partial().extend({
  updated_at: z.string().datetime().optional(),
})

/**
 * Full ticket from database
 */
export const ticketSchema = ticketInsertSchema.extend({
  id: uuidSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type TicketInsert = z.infer<typeof ticketInsertSchema>
export type TicketUpdate = z.infer<typeof ticketUpdateSchema>
export type Ticket = z.infer<typeof ticketSchema>

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateTicketInsert(data: unknown): {
  success: boolean
  data?: TicketInsert
  error?: z.ZodError
} {
  const result = ticketInsertSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true, data: result.data }
}

export function validateTicketUpdate(data: unknown): {
  success: boolean
  data?: TicketUpdate
  error?: z.ZodError
} {
  const result = ticketUpdateSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true, data: result.data }
}
