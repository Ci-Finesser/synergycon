/**
 * Registrations Schema
 * 
 * Single source of truth for registrations table operations.
 * 
 * Note: Unlike ticket_orders (customer_*), registrations uses:
 * - email (not customer_email)
 * - full_name (not customer_name)
 * - phone_number (not customer_phone)
 */

import { z } from 'zod'
import {
  emailSchema,
  phoneSchema,
  nameSchema,
  uuidSchema,
  positiveAmountSchema,
  paymentStatusSchema,
} from './common'

// ============================================================================
// DATABASE COLUMN SCHEMA
// ============================================================================

export const registrationStatusSchema = z.enum([
  'pending',
  'confirmed',
  'waitlist',
  'cancelled',
  'refunded',
])

/**
 * Schema for inserting a registration
 * Database columns: email, full_name, phone_number (not customer_* prefixed)
 */
export const registrationInsertSchema = z.object({
  // Required fields
  email: emailSchema,
  full_name: nameSchema,
  
  // Optional customer info
  phone_number: phoneSchema.optional().nullable(),
  organization: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  
  // Order reference
  order_id: z.string().optional().nullable(),
  
  // Status
  status: registrationStatusSchema.default('pending'),
  payment_status: paymentStatusSchema.default('pending'),
  
  // Pricing
  total_amount: positiveAmountSchema.optional().default(0),
  
  // References
  user_id: uuidSchema.optional().nullable(),
  
  // Extended info
  attendance_reason: z.string().optional().nullable(),
  why_attend: z.string().optional().nullable(),
  expectations: z.string().optional().nullable(),
  dietary_requirements: z.string().optional().nullable(),
  special_needs: z.string().optional().nullable(),
  how_did_you_hear: z.string().optional().nullable(),
  
  // Tickets JSON
  tickets: z.record(z.unknown()).optional().nullable(),
})

/**
 * Schema for updating a registration
 */
export const registrationUpdateSchema = registrationInsertSchema.partial().extend({
  updated_at: z.string().datetime().optional(),
})

/**
 * Full registration from database
 */
export const registrationSchema = registrationInsertSchema.extend({
  id: uuidSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type RegistrationInsert = z.infer<typeof registrationInsertSchema>
export type RegistrationUpdate = z.infer<typeof registrationUpdateSchema>
export type Registration = z.infer<typeof registrationSchema>
export type RegistrationStatus = z.infer<typeof registrationStatusSchema>

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateRegistrationInsert(data: unknown): {
  success: boolean
  data?: RegistrationInsert
  error?: z.ZodError
} {
  const result = registrationInsertSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true, data: result.data }
}

export function validateRegistrationUpdate(data: unknown): {
  success: boolean
  data?: RegistrationUpdate
  error?: z.ZodError
} {
  const result = registrationUpdateSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true, data: result.data }
}
