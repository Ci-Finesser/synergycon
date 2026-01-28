import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Generate a URL-safe profile slug from name or email
 * Matches the database function generate_profile_slug() logic
 * Adds a random suffix for uniqueness (database handles collisions via trigger)
 */
export function generateProfileSlug(name: string | null | undefined, email: string): string {
  let baseSlug: string
  
  if (name && name.trim()) {
    // Create slug from name: lowercase, replace non-alphanumeric with hyphens
    baseSlug = name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-')
  } else {
    // Fall back to email prefix
    baseSlug = email.split('@')[0].toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-')
  }
  
  // Trim leading/trailing hyphens
  baseSlug = baseSlug.replace(/^-+|-+$/g, '')
  
  // Add random suffix for uniqueness (6 chars)
  const suffix = Math.random().toString(36).substring(2, 8)
  
  return `${baseSlug}-${suffix}`
}

/**
 * Generate profile URL from slug
 * Matches the database function generate_profile_url() logic
 */
export function generateProfileUrl(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://synergycon.live'
  return `${baseUrl}/profile/${slug}`
}
