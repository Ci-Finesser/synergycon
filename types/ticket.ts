/**
 * Ticket Type Definitions
 * Centralized types for ticket management system
 */

/**
 * Base ticket type from database
 */
export interface TicketType {
  id: string
  ticket_id: string
  name: string
  description: string | null
  price: number
  benefits: string[]
  available_quantity: number | null
  sold_quantity: number
  is_active: boolean
  category: string | null
  duration: string | null
  display_order: number
  valid_from: string | null
  valid_until: string | null
  created_at: string
  updated_at: string
}

/**
 * Public ticket view (without sensitive data)
 */
export interface PublicTicket {
  id: string
  ticket_id: string
  name: string
  description: string | null
  price: number
  benefits: string[]
  available_quantity: number | null
  sold_quantity: number
  category: string | null
  duration: string | null
  display_order: number
  is_available: boolean
}

/**
 * Ticket creation request
 */
export interface TicketCreateRequest {
  ticket_id: string
  name: string
  description?: string
  price: number
  benefits?: string[]
  available_quantity?: number
  category?: string
  duration?: string
  display_order?: number
  valid_from?: string
  valid_until?: string
}

/**
 * Ticket update request
 */
export interface TicketUpdateRequest {
  id: string
  name?: string
  description?: string
  price?: number
  benefits?: string[]
  available_quantity?: number
  is_active?: boolean
  category?: string
  duration?: string
  display_order?: number
  valid_from?: string
  valid_until?: string
}

/**
 * Ticket delete request
 */
export interface TicketDeleteRequest {
  id: string
}

/**
 * Admin ticket list response
 */
export interface AdminTicketListResponse {
  success: boolean
  tickets: TicketType[]
  total: number
}

/**
 * Admin ticket response
 */
export interface AdminTicketResponse {
  success: boolean
  ticket?: TicketType
  error?: string
}

/**
 * Ticket statistics
 */
export interface TicketStats {
  total_tickets: number
  active_tickets: number
  inactive_tickets: number
  total_revenue_potential: number
  total_sold: number
  total_available: number
}

/**
 * Ticket query parameters
 */
export interface TicketQueryParams {
  category?: string
  duration?: string
  is_active?: boolean
  search?: string
}

/**
 * Ticket Validation
 */
export interface TicketValidation {
  id: string
  ticket_number: string
  order_id: string | null
  ticket_type_id: string | null
  attendee_name: string | null
  attendee_email: string | null
  validated_at: string
  validated_by: string | null
  validation_location: string | null
  validation_notes: string | null
  is_valid: boolean
  check_in_time: string | null
  check_out_time: string | null
  created_at: string
}

/**
 * Ticket validation request
 */
export interface TicketValidationRequest {
  ticket_number: string
  order_id?: string
  attendee_name?: string
  attendee_email?: string
  validation_location?: string
  validation_notes?: string
}

/**
 * Ticket validation response
 */
export interface TicketValidationResponse {
  success: boolean
  validation?: TicketValidation
  ticket_info?: {
    ticket_type: string
    attendee_name: string
    order_id: string
    already_validated: boolean
    validation_count: number
  }
  error?: string
  message?: string
}

/**
 * Validation statistics
 */
export interface ValidationStats {
  ticket_type_id: string
  ticket_type_name: string
  ticket_id: string
  total_validations: number
  unique_tickets_validated: number
  validations_today: number
  last_validation: string | null
}

/**
 * Ticket check request
 */
export interface TicketCheckRequest {
  ticket_number: string
}

/**
 * Ticket check response
 */
export interface TicketCheckResponse {
  success: boolean
  valid: boolean
  ticket_info?: {
    ticket_number: string
    order_id: string
    ticket_type: string
    attendee_name: string
    attendee_email: string
    already_validated: boolean
    validation_count: number
    last_validated_at?: string
  }
  error?: string
}
