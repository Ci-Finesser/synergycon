// ============================================================================
// SynergyCon 2.0 - Single Source of Truth for Event Data
// ============================================================================
// This file contains all event-related constants used throughout the application.
// Update this file to change event details across the entire codebase.
// ============================================================================

export const EVENT_NAME = "SynergyCon 2.0"
export const EVENT_FULL_NAME = "SynergyCon 2.0 - The Framework For Brainwork"
export const EVENT_TAGLINE = "The Framework For Brainwork"
export const EVENT_YEAR = 2026
export const EVENT_HASHTAG = "#SynergyCon2026"
export const EVENT_HASHTAGS = ["SynergyCon2026", "CreativeEconomy", "Innovation"]

// ============================================================================
// Event Dates
// ============================================================================
// Note: Exact dates are TBA. Using placeholder dates for March 2026.
export const EVENT_DATES = {
  // Primary event dates (TBA - placeholder)
  startDate: "2026-03-15",
  endDate: "2026-03-17",
  
  // Display format
  displayRange: "March 15-17, 2026",
  displayRangeShort: "Mar 15-17, 2026",
  
  // Status
  datesAnnounced: false,
  datesPlaceholder: "Dates To Be Announced",
  
  // ISO format for structured data
  startDateISO: "2026-03-15T09:00:00+01:00",
  endDateISO: "2026-03-17T18:00:00+01:00",
  doorTimeISO: "2026-03-15T08:00:00+01:00",
  
  // Duration (tentative - subject to change)
  duration: "P3D", // Placeholder - actual duration TBA
  daysCount: 3, // Tentative - subject to confirmation
  daysCountDisplay: "Multiple", // Use this for display text
  daysCountTentative: true,
} as const

// ============================================================================
// Districts & Venues
// ============================================================================
export const DISTRICTS = {
  artsSculptureDesign: {
    id: "arts-sculpture-design",
    name: "Arts, Sculpture & Design District",
    shortName: "Arts & Design",
    focus: ["Arts", "Sculpture", "Design"],
    venue: {
      name: "J. Randle Centre for Yorùbá Culture & History",
      shortName: "J. Randle Centre",
      address: "J.K. Randle Rd, Onikan Round About, Lagos Island, Onikan, Lagos",
      area: "Onikan, Lagos Island",
      city: "Lagos",
      state: "Lagos State",
      country: "Nigeria",
      geo: {
        latitude: 6.4541,
        longitude: 3.4082,
      },
      googleMapsUrl: "https://maps.google.com/?q=J.+Randle+Centre+for+Yoruba+Culture+History+Lagos",
    },
  },
  musicFashionFilmPhotography: {
    id: "music-fashion-film-photography",
    name: "Music, Fashion, Film & Photography District",
    shortName: "Fashion & Film",
    focus: ["Music", "Fashion", "Film", "Photography"],
    venue: {
      name: "The Royal Box/Cube",
      shortName: "Royal Box",
      address: "65 Adeola Odeku St, Victoria Island, Lagos",
      area: "Victoria Island",
      city: "Lagos",
      state: "Lagos State",
      country: "Nigeria",
      geo: {
        latitude: 6.4281,
        longitude: 3.4219,
      },
      googleMapsUrl: "https://maps.google.com/?q=Royal+Box+65+Adeola+Odeku+Victoria+Island+Lagos",
    },
  },
  techGamingMusic: {
    id: "tech-gaming-music",
    name: "Tech, Gaming and Music District",
    shortName: "Tech & Gaming",
    focus: ["Tech", "Gaming", "Music"],
    venue: {
      name: "Lion Wonder Arena Alausa",
      shortName: "Lion Wonder Arena",
      address: "54 Obafemi Awolowo Way, Ikeja, Lagos",
      area: "Ikeja",
      city: "Lagos",
      state: "Lagos State",
      country: "Nigeria",
      geo: {
        latitude: 6.6018,
        longitude: 3.3515,
      },
      googleMapsUrl: "https://maps.google.com/?q=Lion+Wonder+Arena+54+Obafemi+Awolowo+Way+Ikeja+Lagos",
    },
  },
  mainConference: {
    id: "main-conference",
    name: "Conference, Presentations, Panel Discussions, Exhibitions, Masterclasses, Lectures, Deal Rooms, Networking and Festival",
    shortName: "Main Conference",
    focus: ["Conference", "Presentations", "Panels", "Exhibitions", "Masterclasses", "Lectures", "Deal Rooms", "Networking", "Festival"],
    venue: {
      name: "Wole Soyinka Centre for Culture and Creative Arts (National Theatre Nigeria)",
      shortName: "National Theatre",
      address: "Iganmu, Lagos Apapa Local Government, Lagos",
      area: "Iganmu",
      city: "Lagos",
      state: "Lagos State",
      country: "Nigeria",
      geo: {
        latitude: 6.4698,
        longitude: 3.3892,
      },
      googleMapsUrl: "https://maps.google.com/?q=National+Theatre+Nigeria+Iganmu+Lagos",
    },
  },
} as const

// ============================================================================
// All Venues (Flat list for easy access)
// ============================================================================
export const VENUES = {
  jRandleCentre: DISTRICTS.artsSculptureDesign.venue,
  royalBox: DISTRICTS.musicFashionFilmPhotography.venue,
  lionWonderArena: DISTRICTS.techGamingMusic.venue,
  nationalTheatre: DISTRICTS.mainConference.venue,
} as const

// Array of all venues
export const ALL_VENUES = Object.values(VENUES)

// Venue names for dropdown/filters
export const VENUE_NAMES = ALL_VENUES.map((v) => v.name)
export const VENUE_SHORT_NAMES = ALL_VENUES.map((v) => v.shortName)

// ============================================================================
// Session Types
// ============================================================================
export const SESSION_TYPES = [
  "Keynote",
  "Panel Discussion",
  "Masterclass",
  "Workshop",
  "Lecture",
  "Exhibition",
  "Networking",
  "Deal Room",
  "Festival",
  "Presentation",
] as const

export type SessionType = (typeof SESSION_TYPES)[number]

// ============================================================================
// Event Tracks / Categories
// ============================================================================
export const TRACKS = [
  "Creative Economy",
  "Tech Innovation",
  "Digital Arts",
  "Music & Entertainment",
  "Film & Media",
  "Fashion & Design",
  "Gaming & Esports",
  "Policy & Governance",
] as const

export type Track = (typeof TRACKS)[number]

// ============================================================================
// Event Location (Primary)
// ============================================================================
export const EVENT_LOCATION = {
  area: "Victoria Island",
  city: "Lagos",
  state: "Lagos State",
  country: "Nigeria",
  countryCode: "NG",
  displayLocation: "Lagos, Nigeria",
} as const

// ============================================================================
// Event Capacity & Stats
// ============================================================================
export const EVENT_STATS = {
  maximumAttendeeCapacity: 5000,
  expectedSpeakers: 100,
  expectedPartners: 38, // Updated: 14 broadcast + 11 digital + 5 sponsors + 8 government = 38 confirmed partners
  typicalAgeRange: "18-65",
  isAccessibleForFree: false,
  inLanguage: "en",
} as const

// ============================================================================
// Contact Information
// ============================================================================
export const CONTACT = {
  email: "hello@synergycon.live",
  phone: "+234 800 000 0000",
  address: {
    street: "Victoria Island",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
    countryCode: "NG",
    postalCode: "101241",
  },
} as const

// ============================================================================
// Social Media Links
// ============================================================================
export const SOCIAL_LINKS = {
  twitter: "https://twitter.com/synergycon",
  linkedin: "https://linkedin.com/company/synergycon",
  instagram: "https://instagram.com/synergycon",
  facebook: "https://facebook.com/synergycon",
  youtube: "https://youtube.com/@synergycon",
  tiktok: "https://tiktok.com/@synergycon",
} as const

// ============================================================================
// Ticket Types
// ============================================================================
export interface TicketTier {
  id: string;
  name: string;
  price: number;
  priceCurrency: string;
  priceDisplay: string;
  description: string;
  accessType: "day" | "full";
  duration: "single-day" | "multi-day" | "full-event";
  features: string[];
  popular?: boolean;
}

export const TICKET_TYPES: Record<string, TicketTier> = {
  "vip": {
    id: "vip",
    name: "VIP",
    price: 25000,
    priceCurrency: "NGN",
    priceDisplay: "₦25,000",
    description: "Single-day access to sessions and exhibitions",
    accessType: "day",
    duration: "single-day",
    features: [
      "Day-specific sessions",
      "Exhibition area access",
      "Networking opportunities",
      "Certificate of attendance",
    ],
  },
  "vip-plus": {
    id: "vip-plus",
    name: "VIP+",
    price: 50000,
    priceCurrency: "NGN",
    priceDisplay: "₦50,000",
    description: "Single-day premium access with enhanced perks",
    accessType: "day",
    duration: "single-day",
    features: [
      "All VIP benefits",
      "Priority seating",
      "Exclusive networking lounge",
      "Lunch included",
      "Premium swag bag",
    ],
    popular: true,
  },
  "vvip": {
    id: "vvip",
    name: "VVIP",
    price: 100000,
    priceCurrency: "NGN",
    priceDisplay: "₦100,000",
    description: "Full festival access across all event days",
    accessType: "full",
    duration: "full-event",
    features: [
      "Full festival access",
      "All keynotes & panels",
      "VIP lounge access",
      "All meals included",
      "Official swag bag",
      "Priority registration",
    ],
  },
  "priority-pass": {
    id: "priority-pass",
    name: "Priority Pass",
    price: 150000,
    priceCurrency: "NGN",
    priceDisplay: "₦150,000",
    description: "Ultimate premium experience with exclusive access",
    accessType: "full",
    duration: "full-event",
    features: [
      "All VVIP benefits",
      "Front-row reserved seating",
      "Exclusive speaker dinner invite",
      "Meet & greet with speakers",
      "Backstage access",
      "Dedicated concierge",
      "VIP transport included",
    ],
  },
} as const

// Array of ticket tiers for iteration
export const TICKET_TIERS_LIST = Object.values(TICKET_TYPES)

// Legacy aliases for backward compatibility
export const TICKET_PRICING = TICKET_TYPES

// ============================================================================
// Media Partners - Radio & TV
// ============================================================================
export const MEDIA_PARTNERS_BROADCAST = [
  { id: "999beat-fm", name: "999BEAT FM", type: "radio" },
  { id: "base-101-1-fm", name: "BASE 101.1 FM", type: "radio" },
  { id: "city-fm-105-1", name: "CITY FM 105.1", type: "radio" },
  { id: "cool-fm-96-9", name: "96.9 COOL FM", type: "radio" },
  { id: "cre8tive-9ja-radio", name: "CRE8TIVE 9JA RADIO", type: "radio" },
  { id: "hiptv", name: "HIPTV", type: "tv" },
  { id: "trace", name: "TRACE", type: "tv" },
  { id: "nta", name: "NTA", type: "tv" },
  { id: "news-central", name: "NEWS CENTRAL", type: "tv" },
  { id: "soundcity", name: "SOUNDCITY", type: "tv" },
  { id: "silverbird", name: "SILVERBIRD", type: "tv" },
  { id: "arisetv", name: "ARISE TV", type: "tv" },
  { id: "cre8tive-9ja-tv", name: "CRE8TIVE 9JA TV", type: "tv" },
  { id: "arise360", name: "ARISE360 (ARISE NEWS)", type: "tv" },
] as const

export type MediaPartnerBroadcast = (typeof MEDIA_PARTNERS_BROADCAST)[number]

// ============================================================================
// Media Partners - Online / Social Media / Blogs
// ============================================================================
export const MEDIA_PARTNERS_DIGITAL = [
  { id: "pulse-ng", name: "PULSE NG", type: "online" },
  { id: "online-banker", name: "ONLINE BANKER", type: "blog" },
  { id: "timi-agbaje", name: "TIMI AGBAJE", type: "influencer" },
  { id: "businessday", name: "BUSINESSDAY", type: "online" },
  { id: "techcabal", name: "TECHCABAL", type: "online" },
  { id: "olorisupergal", name: "OLORISUPERGAL", type: "blog" },
  { id: "nairametrics", name: "NAIRAMETRICS", type: "online" },
  { id: "notjustok", name: "NOTJUSTOK", type: "blog" },
  { id: "lagos-gist", name: "LAGOS GIST", type: "social" },
  { id: "lagos-junction", name: "LAGOS JUNCTION", type: "social" },
  { id: "mr-jollof", name: "MR. JOLLOF", type: "influencer" },
] as const

export type MediaPartnerDigital = (typeof MEDIA_PARTNERS_DIGITAL)[number]

// All media partners combined
export const MEDIA_PARTNERS = [
  ...MEDIA_PARTNERS_BROADCAST,
  ...MEDIA_PARTNERS_DIGITAL,
] as const

// ============================================================================
// Sponsors & Collaborators
// ============================================================================
export const SPONSORS = [
  { id: "sterling-bank", name: "STERLING BANK", tier: "principal", category: "financial" },
  { id: "t2-mobile", name: "T2 MOBILE", tier: "principal", category: "technology" },
  { id: "nelson-jack", name: "NELSON JACK", tier: "ecosystem", category: "brand" },
  { id: "cli-college", name: "C.L.I COLLEGE", tier: "ecosystem", category: "education" },
  { id: "a-solar", name: "A-SOLAR", tier: "ecosystem", category: "energy" },
] as const

export type Sponsor = (typeof SPONSORS)[number]
export type SponsorTier = "principal" | "ecosystem"
export type SponsorCategory = "financial" | "technology" | "brand" | "education" | "energy"

// ============================================================================
// Government & Strategic Partners
// ============================================================================
export const GOVERNMENT_PARTNERS = [
  { 
    id: "lagos-tourism", 
    name: "Lagos State Ministry for Tourism, Arts & Culture", 
    shortName: "Ministry of Tourism",
    type: "state-ministry" 
  },
  { 
    id: "lagos-youths", 
    name: "Lagos State Ministry for Youths & Social Development", 
    shortName: "Ministry of Youth",
    type: "state-ministry" 
  },
  { 
    id: "lagos-wealth", 
    name: "Lagos State Ministry for Wealth Creation", 
    shortName: "Ministry of Wealth Creation",
    type: "state-ministry" 
  },
  { 
    id: "lagos-trade", 
    name: "Lagos State Ministry for Trade, Commerce, Investments & Cooperatives", 
    shortName: "Ministry of Trade",
    type: "state-ministry" 
  },
  { 
    id: "lasmira", 
    name: "Lagos State Material Resources Inspection Agency (LASMIRA)", 
    shortName: "LASMIRA",
    type: "state-agency" 
  },
  { 
    id: "lirs", 
    name: "Lagos Internal Revenue Service", 
    shortName: "LIRS",
    type: "state-agency" 
  },
  { 
    id: "nrs", 
    name: "Nigeria Revenue Service (NRS)", 
    shortName: "NRS",
    type: "federal-agency" 
  },
  { 
    id: "efcc", 
    name: "Economic and Financial Crimes Commission (EFCC)", 
    shortName: "EFCC",
    type: "federal-agency" 
  },
] as const

export type GovernmentPartner = (typeof GOVERNMENT_PARTNERS)[number]
export type GovernmentPartnerType = "state-ministry" | "state-agency" | "federal-agency"

// ============================================================================
// All Partners Combined
// ============================================================================
export const ALL_PARTNERS = {
  broadcast: MEDIA_PARTNERS_BROADCAST,
  digital: MEDIA_PARTNERS_DIGITAL,
  sponsors: SPONSORS,
  government: GOVERNMENT_PARTNERS,
} as const

// ============================================================================
// Partner Count Stats
// ============================================================================
export const PARTNER_COUNTS = {
  mediaPartnersBroadcast: MEDIA_PARTNERS_BROADCAST.length,
  mediaPartnersDigital: MEDIA_PARTNERS_DIGITAL.length,
  mediaPartnersTotal: MEDIA_PARTNERS.length,
  sponsors: SPONSORS.length,
  governmentPartners: GOVERNMENT_PARTNERS.length,
  total: MEDIA_PARTNERS.length + SPONSORS.length + GOVERNMENT_PARTNERS.length,
} as const

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get venue by district ID
 */
export function getVenueByDistrictId(districtId: string) {
  const district = Object.values(DISTRICTS).find((d) => d.id === districtId)
  return district?.venue || null
}

/**
 * Get district by venue short name
 */
export function getDistrictByVenueShortName(shortName: string) {
  return Object.values(DISTRICTS).find((d) => d.venue.shortName === shortName) || null
}

/**
 * Format venue for display
 */
export function formatVenueDisplay(venue: typeof VENUES[keyof typeof VENUES], includeAddress = false) {
  if (includeAddress) {
    return `${venue.name}, ${venue.address}`
  }
  return venue.name
}

/**
 * Get event dates display string
 */
export function getEventDatesDisplay(usePlaceholder = true) {
  if (!EVENT_DATES.datesAnnounced && usePlaceholder) {
    return EVENT_DATES.datesPlaceholder
  }
  return EVENT_DATES.displayRange
}

/**
 * Generate share text with event details
 */
export function generateShareText(type: "attendee" | "speaker" | "general" = "general") {
  const location = EVENT_LOCATION.displayLocation
  const dates = getEventDatesDisplay()
  
  switch (type) {
    case "attendee":
      return `🎉 Excited to announce that I'll be attending ${EVENT_NAME} (${dates}) in ${location}! Join me at Nigeria's premier Creative Economy conference. 🚀\n\n${EVENT_HASHTAG} #CreativeEconomy #Innovation`
    case "speaker":
      return `🎤 Honored to be speaking at ${EVENT_NAME}! Join me ${dates} in ${location} at Nigeria's leading creative economy conference.\n\n${EVENT_HASHTAG} #Speaker #CreativeEconomy`
    default:
      return `🌟 ${EVENT_NAME} - ${EVENT_TAGLINE}. ${dates} in ${location}. Nigeria's Premier Creative Economy Conference.\n\n${EVENT_HASHTAG}`
  }
}

// ============================================================================
// Default Export
// ============================================================================
export const EVENT_CONFIG = {
  name: EVENT_NAME,
  fullName: EVENT_FULL_NAME,
  tagline: EVENT_TAGLINE,
  year: EVENT_YEAR,
  hashtag: EVENT_HASHTAG,
  hashtags: EVENT_HASHTAGS,
  dates: EVENT_DATES,
  districts: DISTRICTS,
  venues: VENUES,
  allVenues: ALL_VENUES,
  location: EVENT_LOCATION,
  stats: EVENT_STATS,
  contact: CONTACT,
  socialLinks: SOCIAL_LINKS,
  tickets: TICKET_TYPES,
  sessionTypes: SESSION_TYPES,
  partners: ALL_PARTNERS,
  partnerCounts: PARTNER_COUNTS,
  mediaPartners: MEDIA_PARTNERS,
  sponsors: SPONSORS,
  governmentPartners: GOVERNMENT_PARTNERS,
} as const

export default EVENT_CONFIG
