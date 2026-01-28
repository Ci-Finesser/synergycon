/**
 * Ticket Orders Schema
 * 
 * Single source of truth for ticket_orders table operations.
 * Maps application field names to database column names.
 * 
 * DATABASE COLUMNS:
 * - customer_email (not 'email')
 * - customer_name (not 'name')  
 * - customer_phone (not 'phone')
 * - order_number (not 'order_id' for the unique identifier)
 * - order_id is a UUID reference, order_number is the human-readable ID
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
  orderStatusSchema,
  fulfillmentStatusSchema,
  metadataSchema,
} from './common'

// ============================================================================
// DATABASE COLUMN SCHEMA (matches actual database structure)
// ============================================================================

/**
 * Schema for inserting a new ticket order into the database
 * Uses actual database column names
 */
export const ticketOrderInsertSchema = z.object({
  // Required fields
  order_number: z.string().min(1, 'Order number is required'),
  customer_name: nameSchema,
  customer_email: emailSchema,
  quantity: z.number().int().positive().default(1),
  total_amount: positiveAmountSchema,

  // Optional fields
  customer_phone: phoneSchema.optional().nullable(),
  currency: currencySchema.optional().default('NGN'),
  unit_price: positiveAmountSchema.optional(),
  payment_status: paymentStatusSchema.optional().default('pending'),
  fulfillment_status: fulfillmentStatusSchema.optional().default('pending'),
  
  // References
  ticket_type_id: uuidSchema.optional().nullable(),
  payment_id: uuidSchema.optional().nullable(),
  user_id: uuidSchema.optional().nullable(),
  
  // Timestamps
  paid_at: z.string().datetime().optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
  
  // Extended fields
  discount_code: z.string().optional().nullable(),
  discount_amount: positiveAmountSchema.optional().nullable(),
  original_amount: positiveAmountSchema.optional().nullable(),
  
  // Customer info fields
  organization: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  attendance_reason: z.string().optional().nullable(),
  expectations: z.string().optional().nullable(),
  dietary_requirements: z.string().optional().nullable(),
  special_needs: z.string().optional().nullable(),
  how_did_you_hear: z.string().optional().nullable(),
  
  // Metadata
  metadata: metadataSchema.optional().nullable(),
})

/**
 * Schema for updating a ticket order
 */
export const ticketOrderUpdateSchema = ticketOrderInsertSchema.partial().extend({
  updated_at: z.string().datetime().optional(),
})

/**
 * Full ticket order as returned from database
 */
export const ticketOrderSchema = ticketOrderInsertSchema.extend({
  id: uuidSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// ============================================================================
// APPLICATION INPUT SCHEMA (maps user-friendly names to DB columns)
// ============================================================================

/**
 * Schema for API input - uses friendly field names
 * Transforms to database column names
 */
export const ticketOrderInputSchema = z.object({
  // Customer info (user-friendly names)
  email: emailSchema,
  name: nameSchema,
  phone: phoneSchema.optional(),
  
  // Order info
  orderId: z.string().min(1, 'Order ID is required'),
  ticketTypeId: uuidSchema.optional(),
  quantity: z.number().int().positive().default(1),
  
  // Pricing
  unitPrice: positiveAmountSchema,
  totalAmount: positiveAmountSchema,
  currency: currencySchema,
  
  // Discount
  discountCode: z.string().optional(),
  discountAmount: positiveAmountSchema.optional(),
  
  // Metadata
  metadata: metadataSchema,
})

/**
 * Transform application input to database insert format
 */
export function toTicketOrderInsert(input: TicketOrderInput): TicketOrderInsert {
  return {
    order_number: input.orderId,
    customer_name: input.name,
    customer_email: input.email,
    customer_phone: input.phone || null,
    ticket_type_id: input.ticketTypeId || null,
    quantity: input.quantity,
    unit_price: input.unitPrice,
    total_amount: input.totalAmount,
    currency: input.currency,
    discount_code: input.discountCode || null,
    discount_amount: input.discountAmount || 0,
    metadata: input.metadata,
    payment_status: 'pending',
    fulfillment_status: 'pending',
  }
}

/**
 * Transform database row to application format
 */
export function fromTicketOrderRow(row: TicketOrder): TicketOrderOutput {
  return {
    id: row.id,
    orderId: row.order_number,
    email: row.customer_email,
    name: row.customer_name,
    phone: row.customer_phone,
    ticketTypeId: row.ticket_type_id,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    totalAmount: row.total_amount,
    currency: row.currency,
    paymentStatus: row.payment_status,
    fulfillmentStatus: row.fulfillment_status,
    discountCode: row.discount_code,
    discountAmount: row.discount_amount,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    metadata: row.metadata,
  }
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type TicketOrderInsert = z.infer<typeof ticketOrderInsertSchema>
export type TicketOrderUpdate = z.infer<typeof ticketOrderUpdateSchema>
export type TicketOrder = z.infer<typeof ticketOrderSchema>
export type TicketOrderInput = z.infer<typeof ticketOrderInputSchema>

export interface TicketOrderOutput {
  id: string
  orderId: string
  email: string
  name: string
  phone?: string | null
  ticketTypeId?: string | null
  quantity: number
  unitPrice?: number
  totalAmount: number
  currency?: string
  paymentStatus?: string
  fulfillmentStatus?: string
  discountCode?: string | null
  discountAmount?: number | null
  paidAt?: string | null
  createdAt: string
  updatedAt: string
  metadata?: Record<string, unknown> | null
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate and transform input for database insert
 */
export function validateTicketOrderInput(data: unknown): {
  success: boolean
  data?: TicketOrderInsert
  error?: z.ZodError
} {
  const result = ticketOrderInputSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true, data: toTicketOrderInsert(result.data) }
}

/**
 * Validate direct database insert
 */
export function validateTicketOrderInsert(data: unknown): {
  success: boolean
  data?: TicketOrderInsert
  error?: z.ZodError
} {
  const result = ticketOrderInsertSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return { success: true, data: result.data }
}
