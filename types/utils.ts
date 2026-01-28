/**
 * Utility & Infrastructure Types
 * Centralized type definitions for utilities, security, and infrastructure
 */

/* ================================
   SESSION TRACKING TYPES
   ================================ */

export interface SessionInfo {
  id: string
  admin_id: string
  session_token: string
  device_name?: string
  device_type?: 'desktop' | 'mobile' | 'tablet'
  browser?: string
  os?: string
  ip_address?: string
  user_agent?: string
  location_city?: string
  location_country?: string
  is_current: boolean
  login_time: string
  last_activity: string
  expires_at: string
}

export interface DeviceInfo {
  device_name?: string
  device_type?: 'desktop' | 'mobile' | 'tablet'
  browser?: string
  os?: string
  user_agent?: string
}

/* ================================
   SECURITY & LOGGING TYPES
   ================================ */

export interface SecurityEvent {
  timestamp: number
  type:
    | 'csrf_violation'
    | 'honeypot_triggered'
    | 'rate_limit_exceeded'
    | 'timing_violation'
    | 'security_check_passed'
    | 'successful_submission' // Deprecated: use security_check_passed or api_success
    | 'api_success'
    | 'api_error'
    | 'payment_initialized'
    | 'payment_verified_success'
    | 'payment_verified_failed'
    | 'payment_verification_failed'
    | 'webhook_received'
    | 'webhook_processed'
    | 'webhook_processing_failed'
    | 'webhook_rejected'
    | 'payment_admin_update'
    | 'payment_admin_query'
    | 'payment_admin_export'
    | 'payment_admin_analytics'
    | 'payment_admin_refund'
    | 'db_insert_error'
    | 'api_handler_exception'
    | 'partnership_application_success'
    // Session management events
    | 'session_created'
    | 'session_creation_failed'
    | 'session_destroyed'
    | 'session_destruction_error'
    | 'session_validated'
    | 'session_validation_failed'
    | 'session_expired'
    | 'session_revoked'
    // Email events
    | 'email_sent'
    | 'email_failed'
    | 'otp_email_sent'
    | 'otp_email_failed'
    | 'ticket_transfer_email_sent'
    | 'ticket_transfer_email_failed'
    // User authentication events
    | 'successful_login'
    | 'successful_logout'
    | 'failed_login_attempt'
    | 'otp_requested'
    | 'login_otp_requested'
    // 2FA events
    | '2fa_setup_initiated'
    | '2fa_enabled'
    | '2fa_disabled'
    | '2fa_verification_failed'
    | '2fa_email_failure'
    | '2fa_sms_failure'
    // User session events
    | 'user_session_revoked'
    | 'all_sessions_revoked'
    // Registration events
    | 'registration_submitted'
    | 'registration_failed'
    // Admin events
    | 'admin_user_created'
    | 'admin_user_deleted'
    | 'admin_session_revoked'
    // Newsletter events
    | 'newsletter_subscribed'
    // Application events
    | 'speaker_application_submitted'
    // Ticket events
    | 'team_tickets_purchased'
    | 'ticket_assigned'
    | 'ticket_confirmation_email_sent'
    | 'ticket_confirmation_email_failed'
    // Welcome email events
    | 'welcome_email_sent'
    | 'welcome_email_failed'
    // API access control events
    | 'api_blocked'
  endpoint: string
  clientId?: string
  userAgent?: string
  details?: string
}

export interface RateLimitEntry {
  count: number
  resetTime: number
}

export interface RateLimitEntryInternal extends RateLimitEntry {
  count: number
  resetTime: number
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
  /** Custom identifier (defaults to IP address) */
  keyGenerator?: (req: Request) => string
  /** Message to return when rate limit is exceeded */
  message?: string
}

/* ================================
   REQUEST SECURITY TYPES
   ================================ */

export interface SecureRequestBody {
  _csrf?: string
  _formStartTime?: number
  [key: string]: any
}

export interface BotCheckResult {
  isBot: boolean
  score: number
  reasons: string[]
}

/* ================================
   HONEYPOT FIELD TYPES
   ================================ */

export interface HoneypotConfig {
  names: string[]
  maxSubmitTime: number // in milliseconds
}

export interface HoneypotValidation {
  isValid: boolean
  reason?: string
}

/* ================================
   REGISTRATION TYPES
   ================================ */

export type Registration = {
  id: string
  email: string
  registrationType: 'attendee' | 'speaker' | 'sponsor' | 'partner'
  status: 'pending' | 'verified' | 'completed'
  createdAt: Date
  verifiedAt?: Date
}

/* ================================
   EMAIL TEMPLATE TYPES
   ================================ */

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  html_content: string
  text_content?: string
  category: string
  variables: string[]
  created_at: Date
  updated_at: Date
  is_active: boolean
}

export interface EmailData {
  [key: string]: string | number | boolean | Date
}

/* ================================
   COOKIE & MIDDLEWARE TYPES
   ================================ */

export interface CookieData {
  name: string
  value: string
  options?: {
    secure?: boolean
    httpOnly?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
    maxAge?: number
    path?: string
    domain?: string
  }
}

export interface CookiesStore {
  get: (name: string) => CookieData | undefined
  set: (cookie: CookieData) => void
  delete: (name: string) => void
  getAll: () => CookieData[]
}

/* ================================
   FILE UPLOAD TYPES
   ================================ */

export interface FileUploadConfig {
  maxSize: number // in bytes
  allowedMimeTypes: string[]
  allowedExtensions: string[]
}

export interface UploadedFile {
  name: string
  size: number
  mimeType: string
  url: string
  uploadedAt: Date
}

/* ================================
   PAGINATION TYPES
   ================================ */

export interface PaginationParams {
  page: number
  limit: number
  offset?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/* ================================
   API RESPONSE TYPES
   ================================ */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    message: string
    code: string
    details?: Record<string, any>
  }
  timestamp: number
}

export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code: string
    details?: Record<string, any>
  }
  timestamp: number
}

/* ================================
   SEARCH & FILTER TYPES
   ================================ */

export interface SearchFilter {
  field: string
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin'
  value: any
}

export interface SearchQuery {
  filters: SearchFilter[]
  sort?: {
    field: string
    direction: 'asc' | 'desc'
  }
  pagination?: PaginationParams
}

/* ================================
   FORM VALIDATION TYPES
   ================================ */

export interface FormValidationError {
  field: string
  message: string
  code: string
}

export interface FormValidationResult {
  valid: boolean
  errors: FormValidationError[]
}
