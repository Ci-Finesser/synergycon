/**
 * Email Types
 * 
 * Type definitions for email logging and tracking system
 */

/**
 * Email type enum matching the database email_type enum
 * Used to categorize transactional emails
 */
export type EmailType =
  | 'welcome'
  | 'otp_verification'
  | 'ticket_confirmation'
  | 'ticket_transfer'
  | 'team_ticket_assignment'
  | 'speaker_application'
  | 'partner_confirmation'
  | 'password_reset'
  | 'newsletter_welcome'
  | 'admin_notification'
  | 'general'

/**
 * Email log record as stored in the database
 */
export interface EmailLog {
  id: string
  email_type: EmailType
  recipient: string
  recipient_name: string | null
  subject: string
  resend_message_id: string | null
  sent_at: string | null // ISO timestamp or null if failed
  error_message: string | null
  metadata: EmailLogMetadata
  created_at: string
  updated_at: string
}

/**
 * Metadata stored with email logs for additional context
 */
export interface EmailLogMetadata {
  user_id?: string
  order_id?: string
  ticket_id?: string
  template_id?: string
  campaign_id?: string
  application_id?: string
  ip_address?: string
  user_agent?: string
  [key: string]: string | number | boolean | undefined
}

/**
 * Input for creating a new email log entry
 */
export interface CreateEmailLogInput {
  email_type: EmailType
  recipient: string
  recipient_name?: string
  subject: string
  resend_message_id?: string
  sent_at?: Date | string
  error_message?: string
  metadata?: EmailLogMetadata
}

/**
 * Result of logging an email send attempt
 */
export interface EmailLogResult {
  success: boolean
  log_id?: string
  error?: string
}

/**
 * Email analytics summary
 */
export interface EmailAnalytics {
  total_sent: number
  total_failed: number
  success_rate: number
  by_type: Record<EmailType, { sent: number; failed: number }>
  recent_failures: EmailLog[]
}

/**
 * Filter options for querying email logs
 */
export interface EmailLogFilters {
  email_type?: EmailType
  recipient?: string
  sent_only?: boolean
  failed_only?: boolean
  start_date?: Date | string
  end_date?: Date | string
  limit?: number
  offset?: number
}
