/**
 * Common Schema Validators
 * Shared validation rules used across multiple schemas
 */

import { z } from 'zod'

// ============================================================================
// PRIMITIVE VALIDATORS
// ============================================================================

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(5)
  .max(255)
  .transform((val) => val.toLowerCase().trim())

export const phoneSchema = z
  .string()
  .min(10, 'Phone number too short')
  .max(20, 'Phone number too long')
  .regex(/^[+]?[\d\s-()]+$/, 'Invalid phone number format')
  .transform((val) => val.replace(/\s+/g, ''))

export const nameSchema = z
  .string()
  .min(2, 'Name too short')
  .max(255, 'Name too long')
  .transform((val) => val.trim())

export const uuidSchema = z.string().uuid('Invalid UUID format')

export const currencySchema = z.enum(['NGN', 'USD', 'EUR', 'GBP']).default('NGN')

export const positiveAmountSchema = z
  .number()
  .positive('Amount must be positive')
  .max(100_000_000, 'Amount exceeds maximum')

export const timestampSchema = z.string().datetime().or(z.date())

export const metadataSchema = z.record(z.unknown()).default({})

// ============================================================================
// STATUS ENUMS
// ============================================================================

export const paymentStatusSchema = z.enum([
  'pending',
  'successful',
  'failed',
  'refunded',
  'cancelled',
])

export const orderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'cancelled',
  'refunded',
  'expired',
])

export const ticketStatusSchema = z.enum([
  'active',
  'used',
  'cancelled',
  'transferred',
  'expired',
])

export const fulfillmentStatusSchema = z.enum([
  'pending',
  'processing',
  'fulfilled',
  'failed',
])

// ============================================================================
// HELPER TYPES
// ============================================================================

export type Email = z.infer<typeof emailSchema>
export type Phone = z.infer<typeof phoneSchema>
export type UUID = z.infer<typeof uuidSchema>
export type Currency = z.infer<typeof currencySchema>
export type PaymentStatus = z.infer<typeof paymentStatusSchema>
export type OrderStatus = z.infer<typeof orderStatusSchema>
export type TicketStatus = z.infer<typeof ticketStatusSchema>
export type FulfillmentStatus = z.infer<typeof fulfillmentStatusSchema>
