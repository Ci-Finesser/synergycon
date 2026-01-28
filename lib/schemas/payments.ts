/**
 * Payments Schema
 * 
 * Single source of truth for payments table operations.
 * 
 * Note: payments uses customer_* prefix (like ticket_orders):
 * - customer_email
 * - customer_name
 * - customer_phone
 */

import { z } from 'zod'
import {
  emailSchema,
  phoneSchema,
  nameSchema,
  uuidSchema,
  currencySchema,
  positiveAmountSchema,
  paymentStatusSchema,
  metadataSchema,
} from './common'

// ============================================================================
// DATABASE COLUMN SCHEMA
// ============================================================================

/**
 * Schema for inserting a payment record
 */
export const paymentInsertSchema = z.object({
  // Required fields
  order_id: z.string().min(1, 'Order ID is required'),
  tx_ref: z.string().min(1, 'Transaction reference is required'),
  amount: positiveAmountSchema,
  customer_email: emailSchema,
  customer_name: nameSchema,
  customer_phone: phoneSchema,

  // Optional fields
  flw_ref: z.string().optional().nullable(),
  currency: currencySchema.optional().default('NGN'),
  status: paymentStatusSchema.default('pending'),
  payment_method: z.string().optional().nullable(),
  payment_type: z.string().optional().nullable(),
  session_id: z.string().optional().nullable(),
  coupon_code: z.string().optional().nullable(),
  discount_amount: positiveAmountSchema.optional().nullable(),
  original_amount: positiveAmountSchema.optional().nullable(),
  
  // Processor info
  processor_ref: z.string().optional().nullable(),
  processor_response: z.record(z.unknown()).optional().nullable(),
  failure_reason: z.string().optional().nullable(),
  retry_count: z.number().int().optional().default(0),
  
  // Tracking
  ip_address: z.string().optional().nullable(),
  user_agent: z.string().optional().nullable(),
  
  // Metadata
  meta: metadataSchema.optional().nullable(),
  
  // Timestamps
  verified_at: z.string().datetime().optional().nullable(),
  refunded_at: z.string().datetime().optional().nullable(),
})

/**
 * Schema for updating a payment record
 */
export const paymentUpdateSchema = z.object({
  status: paymentStatusSchema.optional(),
  flw_ref: z.string().optional().nullable(),
  verified_at: z.string().datetime().optional().nullable(),
  updated_at: z.string().datetime().optional(),
  payment_method: z.string().optional().nullable(),
  meta: metadataSchema.optional(),
})

/**
 * Full payment record from database
 */
export const paymentSchema = paymentInsertSchema.extend({
  id: uuidSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type PaymentInsert = z.infer<typeof paymentInsertSchema>
export type PaymentUpdate = z.infer<typeof paymentUpdateSchema>
export type Payment = z.infer<typeof paymentSchema>

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validatePaymentInsert(data: unknown): {
  success: boolean
  data?: PaymentInsert
  error?: z.ZodError
} {
  const result = paymentInsertSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true, data: result.data }
}

export function validatePaymentUpdate(data: unknown): {
  success: boolean
  data?: PaymentUpdate
  error?: z.ZodError
} {
  const result = paymentUpdateSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true, data: result.data }
}
