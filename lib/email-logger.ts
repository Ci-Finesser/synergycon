/**
 * Email Logger Utility
 * 
 * Handles database logging for all transactional email sends.
 * Integrates with the email_logs table to track send status, errors, and metadata.
 */

import { createServerClient } from '@/lib/supabase/server'
import type { 
  EmailType, 
  EmailLog, 
  CreateEmailLogInput, 
  EmailLogResult,
  EmailLogFilters,
  EmailAnalytics 
} from '@/types/email'

/**
 * Log an email send attempt to the database
 * 
 * @param input - Email log data including type, recipient, subject, and status
 * @returns Result with log_id on success or error message on failure
 * 
 * @example
 * // Log a successful email send
 * await logEmailSend({
 *   email_type: 'welcome',
 *   recipient: 'user@example.com',
 *   recipient_name: 'John Doe',
 *   subject: 'Welcome to SynergyCon!',
 *   resend_message_id: 'msg_123abc',
 *   sent_at: new Date(),
 *   metadata: { user_id: 'usr_456' }
 * })
 * 
 * @example
 * // Log a failed email send
 * await logEmailSend({
 *   email_type: 'otp_verification',
 *   recipient: 'user@example.com',
 *   subject: 'Your Login Code',
 *   error_message: 'Invalid email address',
 *   metadata: { ip_address: '192.168.1.1' }
 * })
 */
export async function logEmailSend(input: CreateEmailLogInput): Promise<EmailLogResult> {
  try {
    const supabase = await createServerClient()
    
    const { data, error } = await supabase
      .from('email_logs')
      .insert({
        email_type: input.email_type,
        recipient: input.recipient,
        recipient_name: input.recipient_name || null,
        subject: input.subject,
        resend_message_id: input.resend_message_id || null,
        sent_at: input.sent_at 
          ? (input.sent_at instanceof Date ? input.sent_at.toISOString() : input.sent_at)
          : null,
        error_message: input.error_message || null,
        metadata: input.metadata || {},
      })
      .select('id')
      .single()

    if (error) {
      console.error('[EmailLogger] Failed to log email:', error.message)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      log_id: data.id,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[EmailLogger] Unexpected error:', message)
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Helper to log a successful email send
 */
export async function logEmailSuccess(
  emailType: EmailType,
  recipient: string,
  subject: string,
  messageId: string,
  metadata?: CreateEmailLogInput['metadata']
): Promise<EmailLogResult> {
  return logEmailSend({
    email_type: emailType,
    recipient,
    subject,
    resend_message_id: messageId,
    sent_at: new Date(),
    metadata,
  })
}

/**
 * Helper to log a failed email send
 */
export async function logEmailFailure(
  emailType: EmailType,
  recipient: string,
  subject: string,
  errorMessage: string,
  metadata?: CreateEmailLogInput['metadata']
): Promise<EmailLogResult> {
  return logEmailSend({
    email_type: emailType,
    recipient,
    subject,
    error_message: errorMessage,
    metadata,
  })
}

/**
 * Get email logs with optional filtering
 */
export async function getEmailLogs(filters?: EmailLogFilters): Promise<EmailLog[]> {
  try {
    const supabase = await createServerClient()
    
    let query = supabase
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.email_type) {
      query = query.eq('email_type', filters.email_type)
    }

    if (filters?.recipient) {
      query = query.eq('recipient', filters.recipient)
    }

    if (filters?.sent_only) {
      query = query.not('sent_at', 'is', null)
    }

    if (filters?.failed_only) {
      query = query.is('sent_at', null)
    }

    if (filters?.start_date) {
      const startDate = filters.start_date instanceof Date 
        ? filters.start_date.toISOString() 
        : filters.start_date
      query = query.gte('created_at', startDate)
    }

    if (filters?.end_date) {
      const endDate = filters.end_date instanceof Date 
        ? filters.end_date.toISOString() 
        : filters.end_date
      query = query.lte('created_at', endDate)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('[EmailLogger] Failed to fetch logs:', error.message)
      return []
    }

    return data as EmailLog[]
  } catch (error) {
    console.error('[EmailLogger] Unexpected error fetching logs:', error)
    return []
  }
}

/**
 * Get email analytics summary
 */
export async function getEmailAnalytics(
  startDate?: Date,
  endDate?: Date
): Promise<EmailAnalytics | null> {
  try {
    const supabase = await createServerClient()
    
    let query = supabase
      .from('email_logs')
      .select('email_type, sent_at, error_message, created_at')

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('[EmailLogger] Failed to fetch analytics:', error.message)
      return null
    }

    // Calculate analytics
    const logs = data as Pick<EmailLog, 'email_type' | 'sent_at' | 'error_message' | 'created_at'>[]
    
    const total_sent = logs.filter(l => l.sent_at !== null).length
    const total_failed = logs.filter(l => l.sent_at === null).length
    const success_rate = logs.length > 0 
      ? Math.round((total_sent / logs.length) * 100) 
      : 0

    // Group by type
    const by_type: EmailAnalytics['by_type'] = {} as EmailAnalytics['by_type']
    for (const log of logs) {
      if (!by_type[log.email_type]) {
        by_type[log.email_type] = { sent: 0, failed: 0 }
      }
      if (log.sent_at) {
        by_type[log.email_type].sent++
      } else {
        by_type[log.email_type].failed++
      }
    }

    // Get recent failures
    const recentFailures = await getEmailLogs({
      failed_only: true,
      limit: 10,
    })

    return {
      total_sent,
      total_failed,
      success_rate,
      by_type,
      recent_failures: recentFailures,
    }
  } catch (error) {
    console.error('[EmailLogger] Unexpected error calculating analytics:', error)
    return null
  }
}

/**
 * Get email log by ID
 */
export async function getEmailLogById(id: string): Promise<EmailLog | null> {
  try {
    const supabase = await createServerClient()
    
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('[EmailLogger] Failed to fetch log:', error.message)
      return null
    }

    return data as EmailLog
  } catch (error) {
    console.error('[EmailLogger] Unexpected error fetching log:', error)
    return null
  }
}

/**
 * Get email logs for a specific recipient
 */
export async function getEmailLogsByRecipient(
  recipient: string,
  limit: number = 50
): Promise<EmailLog[]> {
  return getEmailLogs({ recipient, limit })
}

/**
 * Get failed email logs (for retry/monitoring)
 */
export async function getFailedEmails(limit: number = 100): Promise<EmailLog[]> {
  return getEmailLogs({ failed_only: true, limit })
}
