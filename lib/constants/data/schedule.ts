/**
 * Schedule Data Constants
 * 
 * SynergyCon 2.0 - Single-Day Event (March 26, 2026)
 * Track-based schedule across four creative districts
 * 
 * Districts:
 * - arts-sculpture-design: Arts, Sculpture & Design District
 * - music-fashion-film-photography: Music, Fashion, Film & Photography District
 * - tech-gaming-music: Tech, Gaming & Music District
 * - main-conference: Main Conference District
 * 
 * Last synced: 2026-01-29T00:00:00.000Z
 */

export interface ScheduleItemData {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  day: number
  track: string | null
  location: string | null
  speaker_ids: string[] | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export const SCHEDULE_ITEMS_DATA = [
  // ============================================================================
  // OPENING CEREMONY - Main Conference (All Attendees)
  // ============================================================================
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c01",
    "title": "Registration & Networking Breakfast",
    "description": "Arrive early to collect your badge, event materials, and swag bag. Enjoy complimentary coffee and light refreshments while networking with fellow attendees.",
    "start_time": "08:00",
    "end_time": "09:00",
    "day": 1,
    "track": "main-conference",
    "location": "National Theatre - Grand Foyer",
    "speaker_ids": null,
    "tags": ["Registration", "Networking"],
    "session_type": "Registration",
    "is_featured": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c02",
    "title": "Opening Ceremony: The Framework for Brainwork",
    "description": "The official opening of SynergyCon 2.0 featuring welcome addresses from key government officials, organizers, and a keynote setting the stage for Nigeria's creative economy revolution.",
    "start_time": "09:00",
    "end_time": "10:00",
    "day": 1,
    "track": "main-conference",
    "location": "National Theatre - Main Auditorium",
    "speaker_ids": null,
    "tags": ["Keynote", "Opening", "Policy"],
    "session_type": "Keynote",
    "is_featured": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },

  // ============================================================================
  // MORNING SESSIONS (10:00 - 12:00) - Parallel Tracks
  // ============================================================================
  
  // Main Conference Track - Morning
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c03",
    "title": "The State of Nigeria's Creative Economy",
    "description": "A comprehensive panel discussion featuring industry leaders and policymakers examining the current landscape, challenges, and opportunities in Nigeria's $29 billion creative economy.",
    "start_time": "10:15",
    "end_time": "11:15",
    "day": 1,
    "track": "main-conference",
    "location": "National Theatre - Main Auditorium",
    "speaker_ids": null,
    "tags": ["Panel", "Policy", "Economy"],
    "session_type": "Panel Discussion",
    "is_featured": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c04",
    "title": "Funding the Future: Investment in Creative Industries",
    "description": "Venture capitalists, angel investors, and fund managers discuss funding opportunities, investment trends, and what it takes to attract capital for creative ventures.",
    "start_time": "11:30",
    "end_time": "12:30",
    "day": 1,
    "track": "main-conference",
    "location": "National Theatre - Main Auditorium",
    "speaker_ids": null,
    "tags": ["Investment", "Funding", "VC"],
    "session_type": "Panel Discussion",
    "is_featured": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },

  // Arts & Design Track - Morning
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c05",
    "title": "Contemporary Nigerian Art: Global Impact",
    "description": "Explore how Nigerian artists are making waves on the international stage, from gallery exhibitions to art auctions and cultural diplomacy.",
    "start_time": "10:15",
    "end_time": "11:15",
    "day": 1,
    "track": "arts-sculpture-design",
    "location": "National Theatre - Gallery Hall",
    "speaker_ids": null,
    "tags": ["Art", "Gallery", "Culture"],
    "session_type": "Panel Discussion",
    "is_featured": false,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c06",
    "title": "Masterclass: Sculpture & Installation Art",
    "description": "Hands-on masterclass with renowned sculptors exploring materials, techniques, and the business of large-scale art installations.",
    "start_time": "11:30",
    "end_time": "12:30",
    "day": 1,
    "track": "arts-sculpture-design",
    "location": "National Theatre - Workshop Space A",
    "speaker_ids": null,
    "tags": ["Masterclass", "Sculpture", "Hands-on"],
    "session_type": "Masterclass",
    "is_featured": false,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },

  // Fashion & Film Track - Morning
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c07",
    "title": "Fashion Week to Global Markets",
    "description": "Top fashion designers share their journey from local fashion weeks to international runways, retail partnerships, and building sustainable fashion brands.",
    "start_time": "10:15",
    "end_time": "11:15",
    "day": 1,
    "track": "music-fashion-film-photography",
    "location": "National Theatre - Fashion Stage",
    "speaker_ids": null,
    "tags": ["Fashion", "Business", "Global"],
    "session_type": "Panel Discussion",
    "is_featured": false,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c08",
    "title": "Nollywood 3.0: Streaming, Studios & Global Distribution",
    "description": "Film industry executives discuss the evolution of Nollywood, streaming platform deals, international co-productions, and the future of Nigerian cinema.",
    "start_time": "11:30",
    "end_time": "12:30",
    "day": 1,
    "track": "music-fashion-film-photography",
    "location": "National Theatre - Cinema Hall",
    "speaker_ids": null,
    "tags": ["Film", "Nollywood", "Streaming"],
    "session_type": "Panel Discussion",
    "is_featured": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },

  // Tech & Gaming Track - Morning
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c09",
    "title": "Building Nigeria's Gaming Ecosystem",
    "description": "Game developers, publishers, and esports organizers explore the rapidly growing gaming industry in Nigeria and opportunities for creators.",
    "start_time": "10:15",
    "end_time": "11:15",
    "day": 1,
    "track": "tech-gaming-music",
    "location": "National Theatre - Tech Stage",
    "speaker_ids": null,
    "tags": ["Gaming", "Esports", "Development"],
    "session_type": "Panel Discussion",
    "is_featured": false,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c10",
    "title": "Masterclass: Music Production in the AI Era",
    "description": "Grammy-nominated producers demonstrate cutting-edge production techniques, AI tools, and the technology shaping modern Afrobeats and Nigerian music.",
    "start_time": "11:30",
    "end_time": "12:30",
    "day": 1,
    "track": "tech-gaming-music",
    "location": "National Theatre - Music Studio",
    "speaker_ids": null,
    "tags": ["Music", "Production", "AI", "Tech"],
    "session_type": "Masterclass",
    "is_featured": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },

  // ============================================================================
  // LUNCH & NETWORKING (12:30 - 14:00)
  // ============================================================================
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c11",
    "title": "Lunch Break & Exhibition Exploration",
    "description": "Enjoy lunch while exploring exhibition booths, networking with attendees, and discovering innovative products and services across all four districts.",
    "start_time": "12:30",
    "end_time": "14:00",
    "day": 1,
    "track": "main-conference",
    "location": "National Theatre - All Districts",
    "speaker_ids": null,
    "tags": ["Lunch", "Networking", "Exhibition"],
    "session_type": "Break",
    "is_featured": false,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },

  // ============================================================================
  // AFTERNOON SESSIONS (14:00 - 16:00) - Parallel Tracks
  // ============================================================================

  // Main Conference Track - Afternoon
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c12",
    "title": "Intellectual Property: Protecting Creative Assets",
    "description": "Legal experts and entertainment lawyers discuss copyright, trademarks, royalties, and protecting creative works in the digital age.",
    "start_time": "14:00",
    "end_time": "15:00",
    "day": 1,
    "track": "main-conference",
    "location": "National Theatre - Main Auditorium",
    "speaker_ids": null,
    "tags": ["Legal", "IP", "Copyright"],
    "session_type": "Panel Discussion",
    "is_featured": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c13",
    "title": "Creative Economy Policy: Government & Industry Dialogue",
    "description": "A candid discussion between government officials and industry leaders on policy reforms, incentives, and creating an enabling environment for creatives.",
    "start_time": "15:15",
    "end_time": "16:15",
    "day": 1,
    "track": "main-conference",
    "location": "National Theatre - Main Auditorium",
    "speaker_ids": null,
    "tags": ["Policy", "Government", "Dialogue"],
    "session_type": "Panel Discussion",
    "is_featured": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },

  // Arts & Design Track - Afternoon
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c14",
    "title": "Design Thinking for Nigerian Brands",
    "description": "Creative directors and brand strategists share how design thinking is transforming Nigerian businesses and creating iconic brand identities.",
    "start_time": "14:00",
    "end_time": "15:00",
    "day": 1,
    "track": "arts-sculpture-design",
    "location": "National Theatre - Gallery Hall",
    "speaker_ids": null,
    "tags": ["Design", "Branding", "Strategy"],
    "session_type": "Panel Discussion",
    "is_featured": false,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c15",
    "title": "Art as Activism: Sculpting Social Change",
    "description": "Visual artists and activists explore how art is being used to drive social change, challenge narratives, and preserve cultural heritage.",
    "start_time": "15:15",
    "end_time": "16:15",
    "day": 1,
    "track": "arts-sculpture-design",
    "location": "National Theatre - Gallery Hall",
    "speaker_ids": null,
    "tags": ["Art", "Activism", "Culture"],
    "session_type": "Panel Discussion",
    "is_featured": false,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },

  // Fashion & Film Track - Afternoon
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c16",
    "title": "Sustainable Fashion: The Nigerian Advantage",
    "description": "Fashion designers and sustainability advocates discuss eco-friendly practices, traditional textile preservation, and building sustainable fashion businesses.",
    "start_time": "14:00",
    "end_time": "15:00",
    "day": 1,
    "track": "music-fashion-film-photography",
    "location": "National Theatre - Fashion Stage",
    "speaker_ids": null,
    "tags": ["Fashion", "Sustainability", "Textiles"],
    "session_type": "Panel Discussion",
    "is_featured": false,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c17",
    "title": "Nigerian Cinema: Beyond Borders",
    "description": "Acclaimed filmmakers discuss international co-productions, film festival strategies, and taking Nigerian stories to global audiences.",
    "start_time": "15:15",
    "end_time": "16:15",
    "day": 1,
    "track": "music-fashion-film-photography",
    "location": "National Theatre - Cinema Hall",
    "speaker_ids": null,
    "tags": ["Film", "International", "Distribution"],
    "session_type": "Panel Discussion",
    "is_featured": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },

  // Tech & Gaming Track - Afternoon
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c18",
    "title": "The Future of Tech Investment in Nigeria",
    "description": "Tech entrepreneurs and investors discuss the evolving Nigerian tech landscape, funding opportunities, and building scalable tech companies.",
    "start_time": "14:00",
    "end_time": "15:00",
    "day": 1,
    "track": "tech-gaming-music",
    "location": "National Theatre - Tech Stage",
    "speaker_ids": null,
    "tags": ["Tech", "Investment", "Startups"],
    "session_type": "Panel Discussion",
    "is_featured": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c19",
    "title": "Gaming Nigeria: From Stories to Screens",
    "description": "Game developers showcase Nigerian-inspired games and discuss bringing African mythology and stories to the gaming world.",
    "start_time": "15:15",
    "end_time": "16:15",
    "day": 1,
    "track": "tech-gaming-music",
    "location": "National Theatre - Tech Stage",
    "speaker_ids": null,
    "tags": ["Gaming", "Development", "Culture"],
    "session_type": "Panel Discussion",
    "is_featured": false,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },

  // ============================================================================
  // CLOSING SESSIONS (16:30 - 18:00) - All Attendees
  // ============================================================================
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c20",
    "title": "The Science of Sound: Producing Global Hits",
    "description": "Grammy-nominated producers reveal the secrets behind chart-topping Afrobeats hits and the global sound shaping Nigerian music.",
    "start_time": "16:30",
    "end_time": "17:15",
    "day": 1,
    "track": "main-conference",
    "location": "National Theatre - Main Auditorium",
    "speaker_ids": null,
    "tags": ["Music", "Production", "Afrobeats"],
    "session_type": "Keynote",
    "is_featured": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c21",
    "title": "Closing Keynote: Building the Future Together",
    "description": "Inspiring closing remarks summarizing the day's insights, announcing key initiatives, and charting the path forward for Nigeria's creative economy.",
    "start_time": "17:30",
    "end_time": "18:00",
    "day": 1,
    "track": "main-conference",
    "location": "National Theatre - Main Auditorium",
    "speaker_ids": null,
    "tags": ["Keynote", "Closing", "Future"],
    "session_type": "Keynote",
    "is_featured": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },

  // ============================================================================
  // EVENING NETWORKING (18:00 - 21:00) - VIP+, VVIP, Priority Pass
  // ============================================================================
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c22",
    "title": "Networking Reception & After-Party",
    "description": "Exclusive networking reception featuring live entertainment, drinks, and intimate conversations with speakers and industry leaders. Open to VIP+ and above.",
    "start_time": "18:00",
    "end_time": "21:00",
    "day": 1,
    "track": "main-conference",
    "location": "National Theatre - VIP Terrace",
    "speaker_ids": null,
    "tags": ["Networking", "Reception", "VIP"],
    "session_type": "Networking",
    "is_featured": false,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c23",
    "title": "Exclusive Speaker Dinner",
    "description": "Intimate dinner with keynote speakers and industry titans. Priority Pass and VVIP exclusive.",
    "start_time": "19:00",
    "end_time": "22:00",
    "day": 1,
    "track": "main-conference",
    "location": "National Theatre - Executive Dining Hall",
    "speaker_ids": null,
    "tags": ["Dinner", "Exclusive", "Priority"],
    "session_type": "Networking",
    "is_featured": false,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  }
] as const

export type ScheduleItemId = typeof SCHEDULE_ITEMS_DATA[number]['id']
