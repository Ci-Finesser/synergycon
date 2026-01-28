/**
 * Security Logger
 * 
 * Centralized logging for security events with database persistence
 * and batched dispatch for performance optimization.
 */

import type { SecurityEvent } from '@/types/utils'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'

// Re-export for backward compatibility
export type { SecurityEvent }

// ================================
// CONFIGURATION
// ================================

const CONFIG = {
  /** Maximum events to hold in memory before forced flush */
  BATCH_SIZE: 50,
  /** Interval in ms to flush events to database */
  FLUSH_INTERVAL_MS: 30_000, // 30 seconds
  /** Maximum events to keep in fallback memory storage */
  MAX_MEMORY_LOGS: 1000,
  /** Whether to log to console in development */
  CONSOLE_LOG_ENABLED: process.env.NODE_ENV !== 'production',
  /** Retry attempts for failed database writes */
  MAX_RETRY_ATTEMPTS: 3,
  /** Delay between retry attempts in ms */
  RETRY_DELAY_MS: 1000,
}

// ================================
// INTERNAL STATE
// ================================

/** Queue of events pending database insertion */
const eventQueue: SecurityEvent[] = []

/** Fallback in-memory storage when database is unavailable */
const fallbackLogs: SecurityEvent[] = []

/** Timer reference for interval-based flushing */
let flushTimer: NodeJS.Timeout | null = null

/** Flag to prevent concurrent flushes */
let isFlushing = false

/** Track consecutive flush failures for circuit breaker */
let consecutiveFailures = 0
const MAX_CONSECUTIVE_FAILURES = 5

// ================================
// PUBLIC API
// ================================

/**
 * Log a security event
 * Events are queued and batched for efficient database writes
 */
export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
  const logEntry: SecurityEvent = {
    ...event,
    timestamp: Date.now(),
  }

  // Add to queue
  eventQueue.push(logEntry)

  // Console logging for development/debugging
  if (CONFIG.CONSOLE_LOG_ENABLED) {
    const logLevel = getLogLevel(event.type)
    console[logLevel](`[Security] ${event.type}: ${event.endpoint} - ${event.details || 'No details'}`)
  }

  // Check if we should flush immediately (batch size reached)
  if (eventQueue.length >= CONFIG.BATCH_SIZE) {
    flushToDatabase()
  }

  // Ensure interval timer is running
  ensureFlushTimer()
}

/**
 * Force flush all pending events to database
 * Useful before shutdown or when immediate persistence is needed
 */
export async function flushToDatabase(): Promise<{ success: boolean; count: number; errors?: string[] }> {
  if (isFlushing || eventQueue.length === 0) {
    return { success: true, count: 0 }
  }

  isFlushing = true
  const eventsToFlush = [...eventQueue]
  eventQueue.length = 0

  try {
    const result = await writeToDatabase(eventsToFlush)
    
    if (result.success) {
      consecutiveFailures = 0
      return { success: true, count: eventsToFlush.length }
    } else {
      // Database write failed, store in fallback
      handleFlushFailure(eventsToFlush, result.error)
      return { success: false, count: 0, errors: [result.error || 'Unknown error'] }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    handleFlushFailure(eventsToFlush, errorMessage)
    return { success: false, count: 0, errors: [errorMessage] }
  } finally {
    isFlushing = false
  }
}

/**
 * Get security logs with optional filtering
 * Fetches from database, with fallback to memory if unavailable
 */
export async function getSecurityLogs(filter?: {
  type?: SecurityEvent['type']
  endpoint?: string
  since?: number
  limit?: number
}): Promise<SecurityEvent[]> {
  try {
    const supabase = await createServerClient()
    
    let query = supabase
      .from('security_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter?.type) {
      query = query.eq('event_type', filter.type)
    }

    if (filter?.endpoint) {
      query = query.ilike('endpoint', `%${filter.endpoint}%`)
    }

    if (filter?.since !== undefined) {
      const sinceDate = new Date(filter.since).toISOString()
      query = query.gte('created_at', sinceDate)
    }

    if (filter?.limit) {
      query = query.limit(filter.limit)
    } else {
      query = query.limit(100) // Default limit
    }

    const { data, error } = await query

    if (error) {
      console.error('[Security Logger] Database query error:', error)
      return getFromFallback(filter)
    }

    return (data || []).map(mapDbToEvent)
  } catch (error) {
    console.error('[Security Logger] Error fetching logs:', error)
    return getFromFallback(filter)
  }
}

/**
 * Get security statistics for monitoring
 */
export async function getSecurityStats(timeWindowMs: number = 60 * 60 * 1000): Promise<{
  total: number
  byType: Record<string, number>
  byEndpoint: Record<string, number>
  recentViolations: number
}> {
  const timeWindowHours = Math.ceil(timeWindowMs / (60 * 60 * 1000))

  try {
    const supabase = await createServerClient()
    
    const { data, error } = await supabase.rpc('get_security_stats', {
      time_window_hours: timeWindowHours
    })

    if (error) {
      console.error('[Security Logger] Stats query error:', error)
      return getStatsFromFallback(timeWindowMs)
    }

    const stats = {
      total: 0,
      byType: {} as Record<string, number>,
      byEndpoint: {} as Record<string, number>,
      recentViolations: 0,
    }

    for (const row of data || []) {
      stats.total += Number(row.event_count)
      stats.byType[row.event_type] = Number(row.event_count)
      
      if (!isSuccessEvent(row.event_type)) {
        stats.recentViolations += Number(row.event_count)
      }
    }

    return stats
  } catch (error) {
    console.error('[Security Logger] Error getting stats:', error)
    return getStatsFromFallback(timeWindowMs)
  }
}

/**
 * Clear old logs from database
 */
export async function clearOldLogs(daysToKeep: number = 30): Promise<number> {
  try {
    const supabase = await createServerClient()
    
    const { data, error } = await supabase.rpc('cleanup_old_security_logs', {
      days_to_keep: daysToKeep
    })

    if (error) {
      console.error('[Security Logger] Cleanup error:', error)
      return 0
    }

    return data || 0
  } catch (error) {
    console.error('[Security Logger] Error clearing logs:', error)
    return 0
  }
}

/**
 * Export logs for analysis
 */
export async function exportSecurityLogs(format: 'json' | 'csv' = 'json'): Promise<string> {
  const logs = await getSecurityLogs({ limit: 10000 })

  if (format === 'csv') {
    const headers = ['Timestamp', 'Type', 'Endpoint', 'Client ID', 'User Agent', 'Details']
    const rows = logs.map(log => [
      new Date(log.timestamp).toISOString(),
      log.type,
      log.endpoint,
      log.clientId || '',
      log.userAgent || '',
      log.details || '',
    ])

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')
  }

  return JSON.stringify(logs, null, 2)
}

/**
 * Get queue status for monitoring
 */
export function getQueueStatus(): {
  queueSize: number
  fallbackSize: number
  isFlushing: boolean
  consecutiveFailures: number
  isCircuitOpen: boolean
} {
  return {
    queueSize: eventQueue.length,
    fallbackSize: fallbackLogs.length,
    isFlushing,
    consecutiveFailures,
    isCircuitOpen: consecutiveFailures >= MAX_CONSECUTIVE_FAILURES,
  }
}

// ================================
// INTERNAL FUNCTIONS
// ================================

/**
 * Write events to database with retry logic
 * Uses admin client (service role) to bypass RLS for system-level logging
 */
async function writeToDatabase(events: SecurityEvent[], attempt: number = 1): Promise<{ success: boolean; error?: string }> {
  // Circuit breaker: if too many consecutive failures, skip database writes
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    // Store in fallback and return
    for (const event of events) {
      addToFallback(event)
    }
    return { success: false, error: 'Circuit breaker open - too many failures' }
  }

  try {
    // Use admin client to bypass RLS - security logging is a system operation
    const supabase = createAdminClient()
    
    const records = events.map(event => ({
      event_type: event.type,
      endpoint: event.endpoint,
      client_id: event.clientId || null,
      user_agent: event.userAgent || null,
      details: event.details || null,
      metadata: {},
      created_at: new Date(event.timestamp).toISOString(),
    }))

    const { error } = await supabase
      .from('security_logs')
      .insert(records)

    if (error) {
      if (attempt < CONFIG.MAX_RETRY_ATTEMPTS) {
        await delay(CONFIG.RETRY_DELAY_MS * attempt)
        return writeToDatabase(events, attempt + 1)
      }
      consecutiveFailures++
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    if (attempt < CONFIG.MAX_RETRY_ATTEMPTS) {
      await delay(CONFIG.RETRY_DELAY_MS * attempt)
      return writeToDatabase(events, attempt + 1)
    }
    consecutiveFailures++
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Handle flush failure by storing events in fallback
 */
function handleFlushFailure(events: SecurityEvent[], error?: string): void {
  console.error('[Security Logger] Flush failed:', error)
  consecutiveFailures++

  for (const event of events) {
    addToFallback(event)
  }
}

/**
 * Add event to fallback in-memory storage
 */
function addToFallback(event: SecurityEvent): void {
  fallbackLogs.unshift(event)
  
  if (fallbackLogs.length > CONFIG.MAX_MEMORY_LOGS) {
    fallbackLogs.length = CONFIG.MAX_MEMORY_LOGS
  }
}

/**
 * Get logs from fallback storage
 */
function getFromFallback(filter?: {
  type?: SecurityEvent['type']
  endpoint?: string
  since?: number
  limit?: number
}): SecurityEvent[] {
  let filtered = [...fallbackLogs]

  if (filter?.type) {
    filtered = filtered.filter(log => log.type === filter.type)
  }

  if (filter?.endpoint) {
    filtered = filtered.filter(log => log.endpoint.includes(filter.endpoint!))
  }

  if (filter?.since !== undefined) {
    filtered = filtered.filter(log => log.timestamp >= filter.since!)
  }

  if (filter?.limit) {
    filtered = filtered.slice(0, filter.limit)
  }

  return filtered
}

/**
 * Get stats from fallback storage
 */
function getStatsFromFallback(timeWindowMs: number): {
  total: number
  byType: Record<string, number>
  byEndpoint: Record<string, number>
  recentViolations: number
} {
  const since = Date.now() - timeWindowMs
  const recentLogs = getFromFallback({ since })

  const stats = {
    total: recentLogs.length,
    byType: {} as Record<string, number>,
    byEndpoint: {} as Record<string, number>,
    recentViolations: 0,
  }

  for (const log of recentLogs) {
    stats.byType[log.type] = (stats.byType[log.type] || 0) + 1
    stats.byEndpoint[log.endpoint] = (stats.byEndpoint[log.endpoint] || 0) + 1

    if (!isSuccessEvent(log.type)) {
      stats.recentViolations++
    }
  }

  return stats
}

/**
 * Map database record to SecurityEvent
 */
function mapDbToEvent(record: {
  event_type: string
  endpoint: string
  client_id: string | null
  user_agent: string | null
  details: string | null
  created_at: string
}): SecurityEvent {
  return {
    type: record.event_type as SecurityEvent['type'],
    endpoint: record.endpoint,
    clientId: record.client_id || undefined,
    userAgent: record.user_agent || undefined,
    details: record.details || undefined,
    timestamp: new Date(record.created_at).getTime(),
  }
}

/**
 * Get appropriate log level for event type
 */
function getLogLevel(type: SecurityEvent['type']): 'log' | 'warn' | 'error' {
  const errorEvents = ['csrf_violation', 'rate_limit_exceeded', 'api_handler_exception', 'api_error']
  const successEvents = ['successful_submission', 'successful_login', 'email_sent', 'registration_submitted', 'security_check_passed', 'api_success']
  
  if (errorEvents.includes(type)) return 'error'
  if (successEvents.includes(type)) return 'log'
  return 'warn'
}

/**
 * Check if event type represents success
 */
function isSuccessEvent(type: string): boolean {
  return [
    'successful_submission',
    'successful_login',
    'successful_logout',
    'email_sent',
    'otp_email_sent',
    'session_created',
    'registration_submitted',
    'speaker_application_submitted',
    'newsletter_subscribed',
    '2fa_enabled',
    'payment_verified_success',
    'webhook_processed',
    'security_check_passed',
    'api_success',
  ].includes(type)
}

/**
 * Ensure flush timer is running
 */
function ensureFlushTimer(): void {
  if (flushTimer) return

  flushTimer = setInterval(async () => {
    if (eventQueue.length > 0) {
      await flushToDatabase()
    }

    // Attempt to recover from circuit breaker
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      consecutiveFailures = Math.max(0, consecutiveFailures - 1)
    }
  }, CONFIG.FLUSH_INTERVAL_MS)

  // Unref to prevent keeping the process alive
  if (flushTimer.unref) {
    flushTimer.unref()
  }
}

/**
 * Delay utility
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ================================
// LIFECYCLE
// ================================

/**
 * Graceful shutdown - flush remaining events
 */
export async function shutdown(): Promise<void> {
  if (flushTimer) {
    clearInterval(flushTimer)
    flushTimer = null
  }

  if (eventQueue.length > 0) {
    console.log(`[Security Logger] Flushing ${eventQueue.length} events before shutdown...`)
    await flushToDatabase()
  }
}

// Handle process shutdown
if (typeof process !== 'undefined') {
  const handleShutdown = async () => {
    await shutdown()
  }

  process.on('beforeExit', handleShutdown)
  process.on('SIGINT', handleShutdown)
  process.on('SIGTERM', handleShutdown)
}
