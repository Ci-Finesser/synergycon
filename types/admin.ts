/**
 * Admin-Specific Types
 * Centralized type definitions for admin functionality
 */

/* ================================
   ADMIN USER TYPES
   ================================ */

export interface AdminUser {
  id: string
  email: string
  full_name: string
  role: string
  twoFactorVerified: boolean
  lastActivity?: string
  [key: string]: any
}

/* ================================
   ADMIN PERMISSIONS & ROLES
   ================================ */

export type AdminPermission =
  | 'manage_users'
  | 'manage_payments'
  | 'manage_tickets'
  | 'manage_speakers'
  | 'manage_sponsors'
  | 'manage_partners'
  | 'manage_admins'
  | 'view_analytics'
  | 'view_audit_logs'
  | 'system_settings'
  | 'manage_email_templates'
  | 'manage_refunds'
  | 'manage_sessions'

export type AdminRole = 'super_admin' | 'admin' | 'moderator'

/* ================================
   ADMIN SESSION TYPES
   ================================ */

export interface AdminSessionInfo {
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

export interface AdminDeviceInfo {
  device_name?: string
  device_type?: 'desktop' | 'mobile' | 'tablet'
  browser?: string
  os?: string
  user_agent?: string
}

/* ================================
   ADMIN AUDIT LOG TYPES
   ================================ */

export interface AdminAuditLog {
  id: string
  admin_id: string
  action: string
  resource_type: string
  resource_id?: string
  changes?: Record<string, any>
  ip_address?: string
  user_agent?: string
  status: 'success' | 'failure'
  timestamp: Date
}

/* ================================
   ADMIN TWO-FACTOR AUTH TYPES
   ================================ */

export interface TwoFactorConfig {
  enabled: boolean
  method: 'totp' | 'email' | 'sms'
  secret?: string
  verified: boolean
  backupCodes?: string[]
}

export interface TwoFactorVerification {
  code: string
  method: 'totp' | 'email' | 'sms'
}

/* ================================
   ADMIN STATS & ANALYTICS TYPES
   ================================ */

export interface AdminStats {
  totalUsers: number
  totalPayments: number
  totalTickets: number
  totalSpeakers: number
  totalSponsors: number
  totalPartners: number
  revenueTotal: number
  revenueByDay: Array<{
    date: string
    amount: number
  }>
}

/* ================================
   ADMIN NOTIFICATION TYPES
   ================================ */

export interface AdminNotification {
  id: string
  type: 'alert' | 'warning' | 'info' | 'error'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  read: boolean
  timestamp: Date
  actionUrl?: string
}
