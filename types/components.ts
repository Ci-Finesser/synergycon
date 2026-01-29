/**
 * Component Types
 * Centralized type definitions for React components
 */

import type React from 'react'

/* ================================
   SPEAKER COMPONENT TYPES
   ================================ */

export interface Speaker {
  id?: string
  name: string
  title: string
  company?: string | null
  bio: string
  image_url?: string | null
  image?: string | null  // Alias for image_url
  topic?: string | null
  role?: string
  speaker_role?: string | null
  linkedin_url?: string | null
  twitter_url?: string | null
  instagram_url?: string | null
  website_url?: string | null
  featured?: boolean
  tags?: string[]  // Speaker tags
  speakingOn?: string  // Topic speaking on
  socials?: {  // Social media links
    linkedin?: string
    twitter?: string
    instagram?: string
    website?: string
  }
}

export interface SpeakerSocials {
  linkedin?: string
  twitter?: string
  instagram?: string
  website?: string
}

export interface SpeakerCardProps {
  speaker: Speaker
  tags?: string[]
}

export interface SpeakerBioModalProps {
  speaker: Speaker
  isOpen?: boolean
  onClose?: () => void
  children?: React.ReactNode
}

export interface SpeakerSectionProps {
  speakers: Speaker[]
  maxDisplay?: number
  showFeaturedOnly?: boolean
}

/* ================================
   PARTNER COMPONENT TYPES
   ================================ */

export interface Partner {
  id: string
  name: string
  logo_url: string
  website?: string | null
  description?: string | null
  bio?: string | null
  tier?: string | null
  tiers?: string[]
  category?: string | null
  sub_category?: string | null
}

export interface PartnerCardProps {
  partner: Partner
  viewMode: 'grid' | 'list'
  onClick: (partner: Partner) => void
}

export interface PartnerSectionProps {
  partners: Partner[]
  viewMode?: 'grid' | 'list'
  groupByTier?: boolean
}

export interface BioModalProps {
  partner?: Partner
  speaker?: Speaker
  isOpen: boolean
  onClose: () => void
}

/* ================================
   SPONSOR COMPONENT TYPES
   ================================ */

export interface Sponsor {
  id: string
  name: string
  logo_url: string
  website: string | null
  tier: string
  category: string
  display_order?: number
  bio?: string
  description?: string
}

export interface MergedSponsor {
  id: string
  name: string
  logo_url: string
  website: string | null | undefined
  tier?: string
  tiers: string[]
  category?: string
  display_order?: number
  bio?: string
  description?: string
  isPartner?: boolean
}

export interface SponsorCardProps {
  sponsor: Sponsor
}

export interface SponsorSectionProps {
  sponsors: Sponsor[]
  maxDisplay?: number
  groupByTier?: boolean
}

/* ================================
   BUTTON COMPONENT TYPES
   ================================ */

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  asChild?: boolean
}

/* ================================
   INPUT COMPONENT TYPES
   ================================ */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  helpText?: string
  icon?: React.ReactNode
  suffix?: React.ReactNode
}

/* ================================
   HONEYPOT FIELD TYPES
   ================================ */

export interface HoneypotFieldsProps {
  values: Record<string, string>
  onChange: (field: string, value: string) => void
  fieldNames?: string[]
  className?: string
}

/* ================================
   FORM COMPONENT TYPES
   ================================ */

export interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  helpText?: string
  children: React.ReactNode
}

export interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

/* ================================
   MODAL COMPONENT TYPES
   ================================ */

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlayClick?: boolean
}

/* ================================
   CARD COMPONENT TYPES
   ================================ */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'outlined'
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

/* ================================
   BADGE COMPONENT TYPES
   ================================ */

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
}

/* ================================
   LOADER COMPONENT TYPES
   ================================ */

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
  text?: string
}

/* ================================
   ALERT COMPONENT TYPES
   ================================ */

export type AlertVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  title?: string
  closable?: boolean
  onClose?: () => void
}

/* ================================
   ADMIN COMPONENT TYPES
   ================================ */

export interface Admin {
  id: string
  email: string
  full_name: string
  role: string
  twoFactorVerified: boolean
  lastActivity?: string
  created_at?: string
}

export interface AdminUsersManagerProps {
  currentAdminId: string
  admins?: Admin[]
  onAddAdmin?: (email: string, role: string) => Promise<void>
  onRemoveAdmin?: (adminId: string) => Promise<void>
  onUpdateRole?: (adminId: string, newRole: string) => Promise<void>
}

export interface TwoFactorVerificationProps {
  email: string
  onVerified: () => void
  onBack: () => void
  adminId?: string
  onVerifySuccess?: () => void
  onVerifyFail?: (error: string) => void
}

/* ================================
   VIDEO LIGHTBOX COMPONENT TYPES
   ================================ */

export interface VideoLightboxProps {
  videoUrl?: string
  youtubeId?: string
  thumbnailUrl?: string
  title?: string
  onClose?: () => void
  autoplay?: boolean
}

/* ================================
   EMAIL COMPONENT TYPES
   ================================ */

export interface NewsletterWelcomeEmailProps {
  email: string
  firstName?: string
  unsubscribeUrl: string
  headerText?: string
  bodyHtml?: string
  footerText?: string
  logoUrl?: string
}

export interface EmailComponentProps {
  [key: string]: any
}

/* ================================
   SECTION COMPONENT TYPES
   ================================ */

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  subtitle?: string
  maxWidth?: 'container' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

/* ================================
   PAGINATION COMPONENT TYPES
   ================================ */

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisible?: number
}

/* ================================
   TABS COMPONENT TYPES
   ================================ */

export interface TabItem {
  id: string
  label: string
  content: React.ReactNode
  disabled?: boolean
}

export interface TabsProps {
  tabs: TabItem[]
  defaultTab?: string
  onChange?: (tabId: string) => void
}
