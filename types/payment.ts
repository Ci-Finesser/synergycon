/**
 * SynergyCon 2.0 Payment Types
 * 
 * Comprehensive type definitions for payment processing,
 * including Flutterwave integration and order management
 */

import type { TicketTier, PassDuration } from './user'

/* ================================
   PAYMENT CONFIGURATION TYPES
   ================================ */

/**
 * Payment provider configuration
 */
export type PaymentProvider = 'flutterwave' | 'stripe' | 'paystack'

/**
 * Supported payment currencies
 */
export type PaymentCurrency = 'NGN' | 'USD' | 'GBP' | 'EUR'

/**
 * Payment environment
 */
export type PaymentEnvironment = 'test' | 'production'

/* ================================
   PAYMENT REQUEST/RESPONSE TYPES
   ================================ */

/**
 * Customer information for payment
 */
export interface PaymentCustomer {
  email: string
  name: string
  phone: string
}

/**
 * Ticket item included in payment
 */
export interface TicketItem {
  ticket_id: string
  ticket_name: string
  ticket_tier: TicketTier
  ticket_duration: PassDuration
  quantity: number
  unit_price: number
  subtotal: number
}

/**
 * Payment metadata containing order and ticket information
 */
export interface PaymentMetadata {
  order_id: string
  tickets: TicketItem[]
  total_quantity: number
  user_id?: string
  session_id?: string
  coupon_code?: string
}

/**
 * Request to initialize a payment
 */
export interface PaymentInitRequest {
  orderId: string
  amount: number
  customer: PaymentCustomer
  meta?: PaymentMetadata
  _csrf?: string
  _formStartTime?: number
}

/**
 * Response from payment initialization
 */
export interface PaymentInitResponse {
  success: boolean
  payment_link?: string
  tx_ref?: string
  error?: string
}

/**
 * Request to verify a payment
 */
export interface PaymentVerifyRequest {
  transactionId: string
  txRef: string
  _csrf?: string
  _formStartTime?: number
}

/**
 * Response from payment verification
 */
export interface PaymentVerifyResponse {
  success: boolean
  verified: boolean
  status?: PaymentStatus
  amount?: number
  currency?: PaymentCurrency
  tx_ref?: string
  order_id?: string
  message?: string
  error?: string
}

/**
 * Payment status check response
 */
export interface PaymentStatusResponse {
  success: boolean
  payment?: PaymentRecord
  error?: string
}

/* ================================
   PAYMENT STATUS TYPES
   ================================ */

/**
 * Payment processing status
 */
export type PaymentStatus = 'pending' | 'processing' | 'successful' | 'failed' | 'cancelled' | 'refunded'

/**
 * Order payment status
 */
export type OrderPaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded'

/**
 * Order fulfillment status
 */
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'

/* ================================
   PAYMENT RECORD TYPES
   ================================ */

/**
 * Payment record stored in database
 */
export interface PaymentRecord {
  id?: string
  order_id: string
  tx_ref: string
  flw_ref?: string
  amount: number
  currency: PaymentCurrency
  status: PaymentStatus
  payment_type?: string
  customer_email: string
  customer_name: string
  customer_phone: string
  meta?: Partial<PaymentMetadata>
  created_at?: string
  updated_at?: string
  verified_at?: string
}

/**
 * Detailed payment record with customer information
 */
export interface PaymentRecordDetail extends PaymentRecord {
  customer_id?: string
  order_items?: TicketItem[]
  payment_method?: string
  processor_ref?: string
  processor_response?: string
}

/* ================================
   ORDER TYPES
   ================================ */

/**
 * Ticket order record
 */
export interface TicketOrder {
  id?: string
  order_id: string
  user_id: string
  total_amount: number
  currency: PaymentCurrency
  quantity: number
  status: OrderStatus
  payment_status: OrderPaymentStatus
  payment_method?: PaymentProvider
  created_at?: string
  updated_at?: string
  paid_at?: string
  fulfilled_at?: string
  cancelled_at?: string
}

/**
 * Ticket order with associated tickets
 */
export interface TicketOrderDetail extends TicketOrder {
  tickets?: TicketItem[]
  payment_records?: PaymentRecord[]
  customer?: PaymentCustomer
}

/* ================================
   FLUTTERWAVE SPECIFIC TYPES
   ================================ */

/**
 * Flutterwave API request body
 */
export interface FlutterwavePaymentRequest {
  tx_ref: string
  amount: number
  currency: PaymentCurrency
  redirect_url: string
  customer: {
    email: string
    name: string
    phonenumber: string
  }
  customizations?: {
    title?: string
    description?: string
    logo?: string
  }
  meta?: Partial<PaymentMetadata>
  payment_options?: string
}

/**
 * Flutterwave API response
 */
export interface FlutterwaveResponse {
  status: 'success' | 'error'
  message: string
  data?: Record<string, any>
}

/**
 * Flutterwave payment initialization response
 */
export interface FlutterwaveInitResponse extends FlutterwaveResponse {
  data?: {
    link: string
    tx_ref: string
    flw_ref: string
  }
}

/**
 * Flutterwave transaction details
 */
export interface FlutterwaveTransaction {
  id: number
  tx_ref: string
  flw_ref: string
  amount: number
  currency: PaymentCurrency
  charged_amount: number
  status: 'successful' | 'failed' | 'pending'
  payment_type: string
  created_at: string
  customer: {
    id: number
    email: string
    name: string
    phone_number: string
  }
  card?: {
    first_6digits: string
    last_4digits: string
    issuer: string
    country: string
    type: string
    token: string
    expiry: string
  }
}

/**
 * Flutterwave webhook event
 */
export type FlutterwaveWebhookEvent = 'charge.completed' | 'transfer.completed' | 'transfer.failed'

/**
 * Flutterwave webhook payload
 */
export interface FlutterwaveWebhookPayload {
  event: FlutterwaveWebhookEvent
  data: {
    id: number
    tx_ref: string
    flw_ref: string
    amount: number
    currency: PaymentCurrency
    status: 'successful' | 'failed'
    customer: {
      email: string
      name: string
    }
    meta?: Partial<PaymentMetadata>
    created_at: string
  }
}

/* ================================
   PAYMENT HOOK STATE TYPES
   ================================ */

/**
 * State for payment hook
 */
export interface PaymentHookState {
  isInitializing: boolean
  isVerifying: boolean
  isSuccess: boolean
  isError: boolean
  errorMessage: string | null
  paymentLink: string | null
  txRef: string | null
}

/**
 * Result of payment initialization
 */
export interface PaymentInitResult {
  success: boolean
  paymentLink?: string
  txRef?: string
  error?: string
}

/**
 * Result of payment verification
 */
export interface PaymentVerifyResult {
  success: boolean
  verified: boolean
  status?: PaymentStatus
  amount?: number
  currency?: PaymentCurrency
  tx_ref?: string
  order_id?: string
  orderId?: string
  error?: string
}

/**
 * Result of payment status check
 */
export interface PaymentStatusResult {
  success: boolean
  payment?: PaymentRecord
  error?: string
}

/* ================================
   REFUND TYPES
   ================================ */

/**
 * Refund status
 */
export type RefundStatus = 'pending' | 'successful' | 'failed' | 'cancelled'

/**
 * Refund request
 */
export interface RefundRequest {
  payment_id: string
  order_id: string
  amount?: number
  reason?: string
  notes?: string
}

/**
 * Refund record
 */
export interface RefundRecord {
  id?: string
  payment_id: string
  order_id: string
  amount: number
  currency: PaymentCurrency
  status: RefundStatus
  reason?: string
  processor_ref?: string
  created_at?: string
  updated_at?: string
}

/* ================================
   ANALYTICS/REPORTING TYPES
   ================================ */

/**
 * Payment summary statistics
 */
export interface PaymentSummary {
  total_payments: number
  total_amount: number
  currency: PaymentCurrency
  successful_count: number
  failed_count: number
  pending_count: number
  average_amount: number
  period_start: string
  period_end: string
}

/**
 * Payment transaction report
 */
export interface PaymentTransactionReport {
  total_transactions: number
  total_revenue: number
  by_status: Record<PaymentStatus, number>
  by_currency: Record<PaymentCurrency, number>
  by_payment_method: Record<string, number>
  top_transactions: PaymentRecord[]
}

/* ================================
   ADMIN OPERATIONS TYPES
   ================================ */

/**
 * Admin payment update request
 */
export interface AdminPaymentUpdateRequest {
  paymentId: string
  status?: PaymentStatus
  notes?: string
  adminId?: string
  reason?: string
}

/**
 * Admin payment query parameters
 */
export interface AdminPaymentQueryParams {
  paymentId?: string
  txRef?: string
  orderId?: string
  status?: PaymentStatus
  limit?: number
  offset?: number
  startDate?: string
  endDate?: string
}

/**
 * Admin payment list response
 */
export interface AdminPaymentListResponse {
  success: boolean
  payments: PaymentRecord[]
  pagination: {
    total: number
    limit: number
    offset: number
    pages: number
  }
}

/**
 * Admin payment update response
 */
export interface AdminPaymentUpdateResponse {
  success: boolean
  payment?: PaymentRecord
  error?: string
}

/**
 * Payment stats for admin dashboard
 */
export interface PaymentStats {
  totalRevenue: number
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  pendingTransactions: number
  averageTransactionValue: number
  successRate: number
}

/**
 * Ticket statistics for admin
 */
export interface TicketStats {
  ticketType: string
  ticketTier: TicketTier
  quantity: number
  revenue: number
  percentage: number
}

/**
 * Daily revenue data
 */
export interface DailyRevenue {
  date: string
  revenue: number
  count: number
  successfulCount: number
}

/**
 * Payment method statistics
 */
export interface PaymentMethodStats {
  paymentType: string
  count: number
  totalAmount: number
  percentage: number
}

/**
 * Comprehensive payment analytics
 */
export interface PaymentAnalytics {
  success: boolean
  metric: 'overview' | 'daily' | 'tickets' | 'methods' | 'tiers'
  data: PaymentStats | DailyRevenue[] | TicketStats[] | PaymentMethodStats[] | Record<string, any>
  period: {
    startDate?: string
    endDate?: string
  }
}

/**
 * Admin payment export request
 */
export interface AdminPaymentExportRequest {
  format: 'csv' | 'json' | 'pdf'
  startDate?: string
  endDate?: string
  status?: PaymentStatus
  currency?: PaymentCurrency
  fields?: string[]
}

/**
 * Admin payment export response
 */
export interface AdminPaymentExportResponse {
  success: boolean
  url?: string
  filename?: string
  recordCount?: number
  error?: string
}

/**
 * Admin refund request
 */
export interface AdminRefundRequest {
  paymentId: string
  orderId: string
  amount?: number
  reason: string
  adminNotes?: string
  adminId: string
}

/**
 * Admin refund response
 */
export interface AdminRefundResponse {
  success: boolean
  refund?: RefundRecord
  payment?: PaymentRecord
  error?: string
}

/**
 * Admin payment action audit log
 */
export interface AdminPaymentAuditLog {
  id?: string
  paymentId: string
  orderId: string
  action: 'status_update' | 'refund' | 'manual_verification' | 'note_added' | 'dispute_opened'
  adminId: string
  adminEmail: string
  details: Record<string, any>
  timestamp: string
}

/**
 * Admin dashboard filter options
 */
export interface AdminPaymentFilterOptions {
  statuses: PaymentStatus[]
  currencies: PaymentCurrency[]
  providers: PaymentProvider[]
  dateRange: {
    start?: string
    end?: string
  }
  searchQuery?: string
}
