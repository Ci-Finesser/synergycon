import { createServerClient } from "@/lib/supabase/server"
import type { SpecialGuest, SpecialGuestDisplay } from "./special-guests"

// ============================================================================
// Transform Functions
// ============================================================================

/**
 * Transform database record to component-friendly format
 */
function toDisplayFormat(guest: SpecialGuest): SpecialGuestDisplay {
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
// Server-Side Data Fetching Functions
// ============================================================================

/**
 * Fetch all active special guests (Server-side)
 */
export async function getSpecialGuestsServer(): Promise<SpecialGuestDisplay[]> {
  const supabase = await createServerClient()
  
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
 * Fetch featured special guests only (Server-side)
 */
export async function getFeaturedGuestsServer(): Promise<SpecialGuestDisplay[]> {
  const supabase = await createServerClient()
  
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
 * Fetch a single special guest by ID (Server-side)
 */
export async function getSpecialGuestByIdServer(id: string): Promise<SpecialGuestDisplay | null> {
  const supabase = await createServerClient()
  
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
 * Fetch special guests by tag (Server-side)
 */
export async function getGuestsByTagServer(tag: string): Promise<SpecialGuestDisplay[]> {
  const supabase = await createServerClient()
  
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
