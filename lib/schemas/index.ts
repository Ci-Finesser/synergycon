/**
 * Database Schemas - Central Export
 * 
 * This directory serves as the SINGLE SOURCE OF TRUTH for all database schemas.
 * 
 * ## Architecture
 * 
 * Each schema file contains:
 * 1. **Database Column Schema** - Matches actual PostgreSQL column names
 * 2. **Application Input Schema** - User-friendly field names for API input
 * 3. **Transform Functions** - Maps between application and database formats
 * 4. **Validation Helpers** - Ready-to-use validation functions
 * 
 * ## Usage
 * 
 * ```typescript
 * import { 
 *   validateTicketOrderInput,
 *   toTicketOrderInsert,
 *   type TicketOrder 
 * } from '@/lib/schemas'
 * 
 * // Validate API input
 * const result = validateTicketOrderInput(body)
 * if (!result.success) {
 *   return { error: result.error }
 * }
 * 
 * // Insert into database
 * await supabase.from('ticket_orders').insert(result.data)
 * ```
 * 
 * ## Column Mapping
 * 
 * Some tables use prefixed column names in the database:
 * - `ticket_orders`: `customer_email` (not `email`)
 * - `tickets`: `attendee_email` (not `email`)
 * - `payments`: `customer_email` (not `email`)
 * 
 * The schema files handle this mapping transparently.
 */

// Common validators
export * from './common'

// Table-specific schemas
export * from './ticket-orders'
export * from './tickets'
export * from './payments'
export * from './registrations'
export * from './ticket-types'

// Re-export commonly used types
export type {
  TicketOrder,
  TicketOrderInsert,
  TicketOrderUpdate,
  TicketOrderInput,
  TicketOrderOutput,
} from './ticket-orders'

export type {
  Ticket,
  TicketInsert,
  TicketUpdate,
} from './tickets'

export type {
  Payment,
  PaymentInsert,
  PaymentUpdate,
} from './payments'

export type {
  Registration,
  RegistrationInsert,
  RegistrationUpdate,
} from './registrations'

export type {
  TicketType,
  TicketTypeInsert,
  TicketTypeUpdate,
  PublicTicketType,
} from './ticket-types'
