import { createClient } from "@/lib/supabase/client"

// ============================================================================
// Types
// ============================================================================

export interface SpecialGuestSocials {
  twitter?: string
  linkedin?: string
  instagram?: string
}

export interface SpecialGuest {
  id: string
  name: string
  title: string
  company?: string | null
  image: string
  bio: string
  short_bio?: string | null
  achievements?: string[]
  session_title?: string | null
  session_date?: string | null
  session_time?: string | null
  session_venue?: string | null
  video_url?: string | null
  website_url?: string | null
  socials?: SpecialGuestSocials
  tags?: string[]
  featured?: boolean
  display_order?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

// Component-friendly interface (camelCase)
export interface SpecialGuestDisplay {
  id: string
  name: string
  title: string
  company?: string
  image: string
  bio: string
  shortBio?: string
  achievements?: string[]
  sessionTitle?: string
  sessionDate?: string
  sessionTime?: string
  sessionVenue?: string
  videoUrl?: string
  websiteUrl?: string
  socials?: SpecialGuestSocials
  tags?: string[]
  featured?: boolean
}

// ============================================================================
// Transform Functions
// ============================================================================

/**
 * Transform database record to component-friendly format
 */
export function toDisplayFormat(guest: SpecialGuest): SpecialGuestDisplay {
  return {
    id: guest.id,
    name: guest.name,
    title: guest.title,
    company: guest.company ?? undefined,
    image: guest.image,
    bio: guest.bio,
    shortBio: guest.short_bio ?? undefined,
    achievements: guest.achievements,
    sessionTitle: guest.session_title ?? undefined,
    sessionDate: guest.session_date ?? undefined,
    sessionTime: guest.session_time ?? undefined,
    sessionVenue: guest.session_venue ?? undefined,
    videoUrl: guest.video_url ?? undefined,
    websiteUrl: guest.website_url ?? undefined,
    socials: guest.socials,
    tags: guest.tags,
    featured: guest.featured,
  }
}

// ============================================================================
// Data Fetching Functions (Client-side)
// ============================================================================

/**
 * Fetch all active special guests
 */
export async function getSpecialGuests(): Promise<SpecialGuestDisplay[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("special_guests")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
  
  if (error) {
    console.error("Error fetching special guests:", error)
    return []
  }
  
  return (data ?? []).map(toDisplayFormat)
}

/**
 * Fetch featured special guests only
 */
export async function getFeaturedGuests(): Promise<SpecialGuestDisplay[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("special_guests")
    .select("*")
    .eq("is_active", true)
    .eq("featured", true)
    .order("display_order", { ascending: true })
  
  if (error) {
    console.error("Error fetching featured guests:", error)
    return []
  }
  
  return (data ?? []).map(toDisplayFormat)
}

/**
 * Fetch a single special guest by ID
 */
export async function getSpecialGuestById(id: string): Promise<SpecialGuestDisplay | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("special_guests")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single()
  
  if (error) {
    console.error("Error fetching special guest:", error)
    return null
  }
  
  return data ? toDisplayFormat(data) : null
}

/**
 * Fetch special guests by tag
 */
export async function getGuestsByTag(tag: string): Promise<SpecialGuestDisplay[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("special_guests")
    .select("*")
    .eq("is_active", true)
    .contains("tags", [tag])
    .order("display_order", { ascending: true })
  
  if (error) {
    console.error("Error fetching guests by tag:", error)
    return []
  }
  
  return (data ?? []).map(toDisplayFormat)
}


// ============================================================================

// List of special guests
const specialGuests = [
  "Hon. Mobolaji Ogunlende - Lagos State Commissioner for Youths & Social Development",
  "Ms. Chalya Shagaya - Senior Special Assistant to the President on Entrepreneurship Development (CIDE)",
  "Dr. Jumoke Oduwole - Federal Minister of Industry, Trade and Investment of Nigeria (Special Guest/Speaker)",
  "Dr. Muiz Banire SAN - Principal Partner at M.A. Banire & Associates  (Special Guest/Speaker)",
  "Mr. Gossy Ukanwoke - Managing Director, BetKing Nigeria (Special Guest/Speaker)",
  "Mr. Hakeem Shagaya (Special Guest/Speaker)",
  "Mr. Jimi Aina - Director, New Growth Areas at Lagos State Internal Revenue Service (Special Guest/Speaker)",
]