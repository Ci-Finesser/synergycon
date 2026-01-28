/**
 * SynergyCon 2.0 User Authentication & Management System
 * Comprehensive type definitions for all user roles and entities
 */

/* ================================
   USER ACCOUNT & AUTH TYPES
   ================================ */

/**
 * User Type Classification
 */
export type UserType = 'individual' | 'enterprise'

/**
 * User Role Classification
 */
export type UserRole = 'attendee' | 'speaker' | 'sponsor' | 'partner' | 'admin'

/**
 * User Roles Structure
 * Allows users to have a primary role and optional supplementary roles
 */
export interface UserRoles {
  default: UserRole
  supplementary?: UserRole[]
}

/**
 * User Account Information
 */
export interface User {
  id: string
  email: string
  user_type: UserType
  roles: UserRoles
  email_verified: boolean
  verification_token?: string
  verification_token_expires?: Date
  created_at: Date
  updated_at: Date
  last_login_at?: Date
}

/**
 * User Profile Information
 * Includes both public and private profile data
 */
export interface UserProfile {
  id: string
  user_id: string
  
  // Personal Information
  full_name: string
  phone?: string
  avatar_url?: string
  bio?: string
  
  // Public Profile Fields (visible on shareable profile)
  public_name?: string
  public_title?: string
  public_company?: string
  public_bio?: string
  public_linkedin_url?: string
  public_twitter_url?: string
  public_instagram_url?: string
  public_website_url?: string
  
  // Private Information (not shared publicly)
  organization?: string
  roles?: UserRoles
  industry?: string
  dietary_requirements?: string
  special_needs?: string
  
  created_at: Date
  updated_at: Date
}

/**
 * User Session Information
 */
export interface UserSession {
  id: string
  user_id: string
  session_token: string
  ip_address?: string
  user_agent?: string
  expires_at: Date
  created_at: Date
  last_activity_at: Date
}

/* ================================
   OTP & AUTHENTICATION TYPES
   ================================ */

/**
 * OTP (One-Time Password) Purpose
 */
export type OTPPurpose = 'login' | 'registration' | 'verification'

/**
 * OTP Code Information
 */
export interface OTPCode {
  id: string
  email: string
  code: string
  purpose: OTPPurpose
  attempts: number
  max_attempts: number
  expires_at: Date
  used: boolean
  used_at?: Date
  created_at: Date
}

/* ================================
   TICKET & EVENT TYPES
   ================================ */

/**
 * Ticket Type Classification
 * Matches TICKET_TYPES keys in lib/constants/event.ts
 */
export type TicketType = 'vip' | 'vip-plus' | 'vvip' | 'priority-pass'

/**
 * Ticket Tier (access levels)
 * - vip: Day Access (₦25,000)
 * - vip-plus: Day Access (₦50,000)
 * - vvip: Full Festival (₦100,000)
 * - priority: Premium Access (₦150,000)
 */
export type TicketTier = 'vip' | 'vip-plus' | 'vvip' | 'priority'

/**
 * Ticket Access Type
 */
export type TicketAccessType = 'day' | 'full'

/**
 * Ticket Duration
 */
export type TicketDuration = 'single-day' | 'multi-day' | 'full-event'

/**
 * Pass Duration (alias for compatibility)
 */
export type PassDuration = 'day' | 'full-event'

/**
 * Ticket Status
 */
export type TicketStatus = 'active' | 'used' | 'cancelled' | 'refunded'

/**
 * Individual Ticket Information
 */
export interface Ticket {
  id: string
  ticket_number: string
  user_id: string
  ticket_type: TicketType
  ticket_tier: TicketTier
  ticket_access_type: TicketAccessType
  ticket_duration: TicketDuration
  price: number
  order_number: string
  status: TicketStatus
  qr_code_data: string
  checked_in: boolean
  checked_in_at?: Date
  checked_in_by?: string
  valid_for_day?: Date
  created_at: Date
  updated_at: Date
  
  // Display fields
  ticket_name?: string
  
  // Legacy fields for compatibility
  ticket_id?: string
  quantity?: number
  subtotal?: number
}

/**
 * Ticket Order Information
 */
export interface TicketOrder {
  id: string
  order_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  organization?: string
  role?: string
  industry?: string
  attendance_reason?: string
  expectations?: string
  dietary_requirements?: string
  tickets: Ticket[]
  total_tickets: number
  total_amount: number
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  created_at: string
  paid_at?: string
}

/* ================================
   ATTENDEE TYPES
   ================================ */

/**
 * Attendee Registration Data
 */
export interface AttendeeRegistration {
  fullName: string
  email: string
  phone: string
  heardFrom: string
  organization?: string
  role?: string
  industry?: string
  attendanceReason?: string
  expectations?: string
  dietaryRequirements?: string
}

/**
 * Complete Attendee Profile
 */
export interface Attendee extends User {
  user_type: 'individual'
  roles: { default: 'attendee'; supplementary?: UserRole[] }
  full_name: string
  phone: string
  organization?: string
  industry?: string
  profile_completed: boolean
  ticket_orders?: TicketOrder[]
}

/* ================================
   SPEAKER TYPES
   ================================ */

/**
 * Speaker Role Types
 */
export type SpeakerRole = 'keynote' | 'panelist' | 'workshop_facilitator' | 'moderator'

/**
 * Session Format Types
 */
export type SessionFormat = 'keynote' | 'panel_discussion' | 'workshop' | 'masterclass' | 'fireside_chat'

/**
 * Application Status
 */
export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

/**
 * Speaker Application Form
 */
export interface SpeakerApplication {
  id: string
  first_name: string
  last_name: string
  full_name?: string
  email: string
  phone: string
  company: string
  position: string
  role: string
  linkedin?: string
  twitter_url?: string
  website_url?: string
  bio: string
  session_type: SessionFormat
  topic_title: string
  topic: string
  topic_description: string
  speaking_experience: string
  previous_speaking?: string
  availability: string
  additional_notes?: string
  headshot_url?: string
  status: ApplicationStatus
  created_at: string
  updated_at: string
  confirmed?: boolean
}

/**
 * Speaker Profile
 */
export interface Speaker extends User {
  user_type: 'individual'
  roles: { default: 'speaker'; supplementary?: UserRole[] }
  name: string
  title: string
  bio: string
  company?: string
  position?: string
  image_url?: string
  topic?: string
  speaker_role?: SpeakerRole
  event_day?: number
  linkedin_url?: string
  twitter_url?: string
  instagram_url?: string
  website_url?: string
  featured: boolean
  status: 'draft' | 'live'
  display_order: number
  confirmed: boolean
}

/**
 * Speaker Communication Record
 */
export interface SpeakerCommunication {
  id: string
  speaker_id: string
  type: 'application_received' | 'approved' | 'rejected' | 'session_assigned' | 'reminder' | 'thank_you'
  sent_at: string
}

/**
 * Speaker with Session Assignments
 */
export interface SpeakerWithSessions extends Speaker {
  sessions?: {
    session_id: string
    title: string
    time: string
    location: string
  }[]
}

/* ================================
   SPONSOR & PARTNER TYPES
   ================================ */

/**
 * Sponsorship Tier Levels
 */
export type SponsorshipTier = 'silver' | 'gold' | 'platinum' | 'diamond' | 'ecosystem' | 'principal'

/**
 * Partner/Sponsor Category
 */
export type SponsorCategory = 'technology' | 'media' | 'finance' | 'education' | 'creative' | 'other'

/**
 * Partnership Type
 */
export type PartnershipType = 'sponsor' | 'exhibitor' | 'media' | 'vendor'

/**
 * Partnership Interests
 */
export type PartnershipInterest =
  | 'media_partnership'
  | 'in_kind_sponsorship'
  | 'community_partnership'
  | 'technology_partnership'
  | 'event_co_hosting'
  | 'brand_collaboration'
  | 'product_showcase'
  | 'workshop_sponsorship'

/**
 * Partnership Application
 */
export interface PartnershipApplication {
  id: string
  partnership_type: PartnershipType
  company_name: string
  contact_person: string
  email: string
  phone: string
  website?: string
  company_description?: string
  partnership_tier?: SponsorshipTier
  partnership_interests?: string | PartnershipInterest[]
  why_partner?: string
  message?: string
  marketing_reach?: string
  additional_notes?: string
  status: ApplicationStatus
  created_at: string
  updated_at: string
}

/**
 * Sponsor/Partner Profile
 */
export interface Sponsor extends User {
  user_type: 'enterprise'
  roles: { default: 'sponsor' | 'partner'; supplementary?: UserRole[] }
  name: string
  logo_url: string
  website?: string
  description?: string
  bio?: string
  tier: SponsorshipTier
  category?: SponsorCategory
  sub_category?: string
  contact_email: string
  contact_phone?: string
  featured: boolean
  status: 'draft' | 'live'
  display_order: number
}

/**
 * Sponsorship Tier Benefits
 */
export interface SponsorshipBenefits {
  tier: SponsorshipTier
  price?: number
  benefits: string[]
}

/* ================================
   ADMIN USER TYPES
   ================================ */

/**
 * Admin User Permissions
 */
export type AdminPermission =
  | 'manage_users'
  | 'manage_content'
  | 'manage_payments'
  | 'manage_sponsors'
  | 'manage_speakers'
  | 'manage_applications'
  | 'view_analytics'
  | 'manage_email_campaigns'
  | 'manage_admin_users'
  | 'super_admin'

/**
 * Admin User Role
 */
export type AdminRole = 'super_admin' | 'admin' | 'moderator'

/**
 * Admin User Profile
 */
export interface AdminUser extends User {
  user_type: 'individual'
  roles: { default: 'admin'; supplementary?: UserRole[] }
  username: string
  full_name?: string
  admin_role: AdminRole
  permissions: AdminPermission[]
  is_active: boolean
  last_login?: string
  created_by?: string
}

/* ================================
   ENTERPRISE & TEAM TYPES
   ================================ */

/**
 * Enterprise Member Invitation Status
 */
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'

/**
 * Enterprise Team Member
 */
export interface EnterpriseMember {
  id: string
  enterprise_user_id: string
  member_email: string
  member_name?: string
  invitation_status: InvitationStatus
  invitation_token?: string
  invitation_expires_at?: Date
  invited_at: Date
  accepted_at?: Date
  member_user_id?: string
  created_at: Date
  updated_at: Date
}

/* ================================
   QR & BARCODE TYPES
   ================================ */

/**
 * Barcode/QR Code Scan Type
 */
export type ScanType = 'profile' | 'ticket' | 'checkin'

/**
 * Barcode Scan Record
 */
export interface BarcodeScan {
  id: string
  scanner_user_id: string
  scanned_user_id: string
  scan_type: ScanType
  scanned_at: Date
  ip_address?: string
  user_agent?: string
}

/* ================================
   SOCIAL SHARING TYPES
   ================================ */

/**
 * Sharing Template Type
 */
export type TemplateType = 'speaker' | 'attendee' | 'sponsor' | 'custom'

/**
 * Social Media Platform
 */
export type SocialPlatform = 'twitter' | 'linkedin' | 'instagram' | 'whatsapp'

/**
 * Social Sharing Template
 */
export interface SharingTemplate {
  id: string
  user_id: string
  template_type: TemplateType
  template_name: string
  template_content: string // JSON string with placeholders
  platforms: SocialPlatform[]
  is_default: boolean
  created_at: Date
  updated_at: Date
}

/* ================================
   AUDIT & LOGGING TYPES
   ================================ */

/**
 * Audit Log Action Category
 */
export type ActionCategory = 'auth' | 'profile' | 'ticket' | 'admin' | 'share' | 'scan' | 'system'

/**
 * Audit Log Severity Level
 */
export type LogSeverity = 'info' | 'warning' | 'error' | 'critical'

/**
 * Audit Log Entry
 */
export interface AuditLog {
  id: string
  user_id?: string
  action_type: string
  action_category: ActionCategory
  action_description: string
  entity_type?: string
  entity_id?: string
  metadata: Record<string, any>
  ip_address?: string
  user_agent?: string
  severity: LogSeverity
  created_at: Date
}

/* ================================
   ATTENDANCE & CHECK-IN TYPES
   ================================ */

/**
 * Attendance Record
 */
export interface AttendanceRecord {
  id: string
  ticket_id: string
  user_id: string
  event_day: Date
  check_in_time: Date
  checked_in_by: string
  booth_location?: string
  entry_point?: string
  notes?: string
  created_at: Date
}

/* ================================
   PAYMENT & TRANSACTION TYPES
   ================================ */

/**
 * Payment Status
 */
export type PaymentStatus = 'pending' | 'successful' | 'failed' | 'cancelled'

/**
 * Payment Information
 */
export interface Payment {
  id: string
  order_id: string
  tx_ref: string
  flw_ref?: string
  amount: number
  currency: string
  status: PaymentStatus
  payment_type?: string
  customer_email: string
  customer_name: string
  customer_phone: string
  meta?: Record<string, any>
  created_at: string
  updated_at: string
  verified_at?: string
  refunded_at?: string
}

/* ================================
   REGISTRATION DTOs (Data Transfer Objects)
   ================================ */

/**
 * Individual Registration DTO
 */
export interface IndividualRegistrationDTO {
  email: string
  full_name: string
  phone?: string
  organization?: string
  role?: string
  industry?: string
  dietary_requirements?: string
  special_needs?: string
}

/**
 * Enterprise Registration DTO
 */
export interface EnterpriseRegistrationDTO {
  email: string
  full_name: string
  phone?: string
  organization: string
  role: string
  industry?: string
}

/* ================================
   AUTHENTICATION DTOs
   ================================ */

/**
 * Login Request DTO
 */
export interface LoginRequestDTO {
  email: string
}

/**
 * Verify OTP DTO
 */
export interface VerifyOTPDTO {
  email: string
  code: string
  purpose: OTPPurpose
}

/**
 * Session DTO
 */
export interface SessionDTO {
  user: User
  profile: UserProfile
  session_token: string
  expires_at: Date
}

/**
 * Public Profile DTO (for barcode scans & sharing)
 * Only includes public-facing profile information
 */
export interface PublicProfileDTO {
  public_name?: string
  public_title?: string
  public_company?: string
  public_bio?: string
  public_linkedin_url?: string
  public_twitter_url?: string
  public_instagram_url?: string
  public_website_url?: string
  avatar_url?: string
}

/* ================================
   FORM/REQUEST TYPES
   ================================ */

/**
 * Security Fields for Form Submissions
 */
export interface FormSecurityFields {
  _csrf: string
  _formStartTime: number
  _honeypot?: Record<string, string>
}

/**
 * Generic API Response
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/* ================================
   TYPE GUARDS & UTILITIES
   ================================ */

/**
 * Check if user is an attendee
 */
export function isAttendee(user: any): user is Attendee {
  return user?.roles?.default === 'attendee'
}

/**
 * Check if user is a speaker
 */
export function isSpeaker(user: any): user is Speaker {
  return user?.roles?.default === 'speaker'
}

/**
 * Check if user is an admin
 */
export function isAdmin(user: any): user is AdminUser {
  return user?.roles?.default === 'admin'
}

/**
 * Check if user is a sponsor/partner
 */
export function isSponsor(user: any): user is Sponsor {
  return user?.roles?.default === 'sponsor' || user?.roles?.default === 'partner'
}

/**
 * Check if user has a specific role (primary or supplementary)
 */
export function hasRole(user: any, role: UserRole): boolean {
  if (!user?.roles) return false
  if (user.roles.default === role) return true
  return user.roles.supplementary?.includes(role) || false
}

/**
 * Get user display name based on type
 */
export function getUserDisplayName(user: Partial<User> | undefined | null): string {
  if (!user) return 'Unknown User'
  if ('full_name' in user && typeof user.full_name === 'string') return user.full_name
  if ('name' in user && typeof user.name === 'string') return user.name
  if ('email' in user && typeof user.email === 'string') return user.email
  return 'Unknown User'
}