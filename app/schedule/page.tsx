"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, MapPin, Users, Grid, List, Calendar } from "lucide-react"
import Link from "next/link"
import { SpeakerBioModal } from "@/components/speaker-bio-modal"
import { ScheduleNotice } from "@/components/schedule-notice"
import { DISTRICTS, EVENT_DATES, VENUES } from "@/lib/constants"

// Single-day schedule data organized by tracks
const scheduleData = [
  // ============================================================================
  // OPENING CEREMONY - Main Conference (All Attendees)
  // ============================================================================
  {
    id: 1,
    track: "main-conference",
    trackName: DISTRICTS.mainConference.shortName,
    date: "March 27, 2026",
    time: "8:00 AM - 9:00 AM",
    title: "Registration & Networking Breakfast",
    description: "Arrive early to collect your badge, event materials, and swag bag. Enjoy complimentary coffee and light refreshments while networking with fellow attendees.",
    sessionType: "Registration",
    location: `${VENUES.nationalTheatre.shortName} - Grand Foyer`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "All Welcome",
    capacity: 2000,
  },
  {
    id: 2,
    track: "main-conference",
    trackName: DISTRICTS.mainConference.shortName,
    date: "March 27, 2026",
    time: "9:00 AM - 10:00 AM",
    title: "Opening Ceremony: The Framework for Brainwork",
    description: "The official opening of SynergyCon 2.0 featuring welcome addresses from key government officials, organizers, and a keynote setting the stage for Nigeria's creative economy revolution.",
    sessionType: "Keynote",
    location: `${VENUES.nationalTheatre.shortName} - Main Auditorium`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "Keynote Speaker TBA",
    capacity: 2000,
  },
  
  // ============================================================================
  // MORNING SESSIONS (10:00 - 12:00) - Parallel Tracks
  // ============================================================================
  
  // Main Conference Track - Morning
  {
    id: 3,
    track: "main-conference",
    trackName: DISTRICTS.mainConference.shortName,
    date: "March 27, 2026",
    time: "10:15 AM - 11:15 AM",
    title: "The State of Nigeria's Creative Economy",
    description: "A comprehensive panel discussion featuring industry leaders and policymakers examining the current landscape, challenges, and opportunities in Nigeria's $29 billion creative economy.",
    sessionType: "Panel Discussion",
    location: `${VENUES.nationalTheatre.shortName} - Main Auditorium`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "Industry Leaders Panel",
    capacity: 500,
  },
  {
    id: 4,
    track: "main-conference",
    trackName: DISTRICTS.mainConference.shortName,
    date: "March 27, 2026",
    time: "11:30 AM - 12:30 PM",
    title: "Funding the Future: Investment in Creative Industries",
    description: "Venture capitalists, angel investors, and fund managers discuss funding opportunities, investment trends, and what it takes to attract capital for creative ventures.",
    sessionType: "Panel Discussion",
    location: `${VENUES.nationalTheatre.shortName} - Main Auditorium`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "Investment Panel",
    capacity: 500,
  },
  
  // Arts & Design Track - Morning
  {
    id: 5,
    track: "arts-sculpture-design",
    trackName: DISTRICTS.artsSculptureDesign.shortName,
    date: "March 27, 2026",
    time: "10:15 AM - 11:15 AM",
    title: "Contemporary Nigerian Art: Global Impact",
    description: "Explore how Nigerian artists are making waves on the international stage, from gallery exhibitions to art auctions and cultural diplomacy.",
    sessionType: "Panel Discussion",
    location: `${VENUES.nationalTheatre.shortName} - Gallery Hall`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "Art Experts Panel",
    capacity: 200,
  },
  {
    id: 6,
    track: "arts-sculpture-design",
    trackName: DISTRICTS.artsSculptureDesign.shortName,
    date: "March 27, 2026",
    time: "11:30 AM - 12:30 PM",
    title: "Masterclass: Digital Art & NFTs",
    description: "Learn how to create, mint, and market your digital art in the Web3 space with hands-on guidance from leading digital artists.",
    sessionType: "Masterclass",
    location: `${VENUES.nationalTheatre.shortName} - Studio A`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "Digital Art Instructor",
    capacity: 50,
  },
  
  // Fashion & Film Track - Morning
  {
    id: 7,
    track: "music-fashion-film-photography",
    trackName: DISTRICTS.musicFashionFilmPhotography.shortName,
    date: "March 27, 2026",
    time: "10:15 AM - 11:15 AM",
    title: "Fashion Forward: Building Global Brands from Lagos",
    description: "Success stories and strategies from Nigerian fashion designers making waves internationally, from local fashion weeks to global runways.",
    sessionType: "Panel Discussion",
    location: `${VENUES.nationalTheatre.shortName} - Fashion Pavilion`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "Fashion Designers Panel",
    capacity: 300,
  },
  {
    id: 8,
    track: "music-fashion-film-photography",
    trackName: DISTRICTS.musicFashionFilmPhotography.shortName,
    date: "March 27, 2026",
    time: "11:30 AM - 12:30 PM",
    title: "Workshop: Cinematography Essentials",
    description: "Hands-on training in camera work, lighting, and visual storytelling for filmmakers at every level.",
    sessionType: "Workshop",
    location: `${VENUES.nationalTheatre.shortName} - Film Studio`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "Film Instructor",
    capacity: 40,
  },
  
  // Tech & Gaming Track - Morning
  {
    id: 9,
    track: "tech-gaming-music",
    trackName: DISTRICTS.techGamingMusic.shortName,
    date: "March 27, 2026",
    time: "10:15 AM - 11:15 AM",
    title: "Tech Innovation: Building Solutions for Nigeria",
    description: "How Nigerian tech entrepreneurs are solving local and global challenges through innovative technology solutions.",
    sessionType: "Keynote",
    location: `${VENUES.nationalTheatre.shortName} - Tech Arena`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "Tech Keynote Speaker",
    capacity: 400,
  },
  {
    id: 10,
    track: "tech-gaming-music",
    trackName: DISTRICTS.techGamingMusic.shortName,
    date: "March 27, 2026",
    time: "11:30 AM - 12:30 PM",
    title: "Gaming Industry: From Players to Publishers",
    description: "Nigerian game developers share insights on building games, monetization strategies, and breaking into the global gaming market.",
    sessionType: "Panel Discussion",
    location: `${VENUES.nationalTheatre.shortName} - Gaming Zone`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "Game Developers Panel",
    capacity: 200,
  },
  
  // ============================================================================
  // LUNCH BREAK (12:30 - 2:00)
  // ============================================================================
  {
    id: 11,
    track: "main-conference",
    trackName: DISTRICTS.mainConference.shortName,
    date: "March 27, 2026",
    time: "12:30 PM - 2:00 PM",
    title: "Networking Lunch & Exhibition Tour",
    description: "Enjoy a curated lunch experience while exploring exhibition booths from sponsors, partners, and creative entrepreneurs. Perfect opportunity for business connections.",
    sessionType: "Networking",
    location: `${VENUES.nationalTheatre.shortName} - Exhibition Hall`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "Open Networking",
    capacity: 2000,
  },
  
  // ============================================================================
  // AFTERNOON SESSIONS (2:00 - 5:00) - Parallel Tracks
  // ============================================================================
  
  // Main Conference Track - Afternoon
  {
    id: 12,
    track: "main-conference",
    trackName: DISTRICTS.mainConference.shortName,
    date: "March 27, 2026",
    time: "2:00 PM - 3:00 PM",
    title: "Policy & Governance: Creating an Enabling Environment",
    description: "Government officials and policy experts discuss regulations, incentives, and infrastructure needed to support the creative economy.",
    sessionType: "Panel Discussion",
    location: `${VENUES.nationalTheatre.shortName} - Main Auditorium`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "Policy Panel",
    capacity: 500,
  },
  {
    id: 13,
    track: "main-conference",
    trackName: DISTRICTS.mainConference.shortName,
    date: "March 27, 2026",
    time: "3:15 PM - 4:15 PM",
    title: "IP & Copyright: Protecting Your Creative Works",
    description: "Legal experts break down intellectual property protection, copyright registration, and monetization strategies for creatives.",
    sessionType: "Workshop",
    location: `${VENUES.nationalTheatre.shortName} - Conference Room A`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "Legal Experts",
    capacity: 150,
  },
  
  // Arts & Design Track - Afternoon
  {
    id: 14,
    track: "arts-sculpture-design",
    trackName: DISTRICTS.artsSculptureDesign.shortName,
    date: "March 27, 2026",
    time: "2:00 PM - 3:00 PM",
    title: "Sustainable Art Practices",
    description: "Industry leaders discuss eco-friendly approaches to art production, sustainable materials, and environmental responsibility in creative industries.",
    sessionType: "Panel Discussion",
    location: `${VENUES.nationalTheatre.shortName} - Gallery Hall`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "Sustainability Panel",
    capacity: 200,
  },
  {
    id: 15,
    track: "arts-sculpture-design",
    trackName: DISTRICTS.artsSculptureDesign.shortName,
    date: "March 27, 2026",
    time: "3:15 PM - 4:45 PM",
    title: "Live Art Installation Workshop",
    description: "Participate in a collaborative art installation led by renowned Nigerian sculptors and installation artists.",
    sessionType: "Workshop",
    location: `${VENUES.nationalTheatre.shortName} - Art Studio`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "Installation Artists",
    capacity: 30,
  },
  
  // Fashion & Film Track - Afternoon
  {
    id: 16,
    track: "music-fashion-film-photography",
    trackName: DISTRICTS.musicFashionFilmPhotography.shortName,
    date: "March 27, 2026",
    time: "2:00 PM - 3:00 PM",
    title: "Music Business: Streaming, Sync & Beyond",
    description: "Music industry executives discuss revenue streams, distribution strategies, and the future of music monetization in Africa.",
    sessionType: "Panel Discussion",
    location: `${VENUES.nationalTheatre.shortName} - Music Hall`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "Music Industry Panel",
    capacity: 300,
  },
  {
    id: 17,
    track: "music-fashion-film-photography",
    trackName: DISTRICTS.musicFashionFilmPhotography.shortName,
    date: "March 27, 2026",
    time: "3:15 PM - 4:45 PM",
    title: "Masterclass: Music Production & Distribution",
    description: "Master the art of producing and distributing music in the digital age with hands-on guidance from hit producers.",
    sessionType: "Masterclass",
    location: `${VENUES.nationalTheatre.shortName} - Recording Studio`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "Music Producers",
    capacity: 40,
  },
  
  // Tech & Gaming Track - Afternoon
  {
    id: 18,
    track: "tech-gaming-music",
    trackName: DISTRICTS.techGamingMusic.shortName,
    date: "March 27, 2026",
    time: "2:00 PM - 3:00 PM",
    title: "AI & Creative Industries",
    description: "Exploring how artificial intelligence is transforming creative workflows, from generative art to automated music composition.",
    sessionType: "Panel Discussion",
    location: `${VENUES.nationalTheatre.shortName} - Tech Arena`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "AI Experts Panel",
    capacity: 400,
  },
  {
    id: 19,
    track: "tech-gaming-music",
    trackName: DISTRICTS.techGamingMusic.shortName,
    date: "March 27, 2026",
    time: "3:15 PM - 4:45 PM",
    title: "Workshop: Game Development Fundamentals",
    description: "Introduction to game design, development tools, and monetization strategies for aspiring game developers.",
    sessionType: "Workshop",
    location: `${VENUES.nationalTheatre.shortName} - Gaming Lab`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "Game Dev Instructors",
    capacity: 50,
  },
  
  // ============================================================================
  // CLOSING SESSIONS (5:00 - 8:00)
  // ============================================================================
  {
    id: 20,
    track: "main-conference",
    trackName: DISTRICTS.mainConference.shortName,
    date: "March 27, 2026",
    time: "5:00 PM - 6:00 PM",
    title: "Fireside Chat: Creative Economy Visionaries",
    description: "An intimate conversation with leading figures shaping Nigeria's creative future, sharing insights, challenges, and aspirations.",
    sessionType: "Fireside Chat",
    location: `${VENUES.nationalTheatre.shortName} - Main Auditorium`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "Creative Visionaries",
    capacity: 500,
  },
  {
    id: 21,
    track: "main-conference",
    trackName: DISTRICTS.mainConference.shortName,
    date: "March 27, 2026",
    time: "6:15 PM - 7:00 PM",
    title: "Closing Ceremony & Awards",
    description: "Celebrating excellence in Nigeria's creative industries with awards recognizing outstanding achievements and contributions.",
    sessionType: "Ceremony",
    location: `${VENUES.nationalTheatre.shortName} - Main Auditorium`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "Awards Presenters",
    capacity: 2000,
  },
  {
    id: 22,
    track: "main-conference",
    trackName: DISTRICTS.mainConference.shortName,
    date: "March 27, 2026",
    time: "7:00 PM - 10:00 PM",
    title: "SynergyCon After Party & Live Performances",
    description: "End the day with live music, entertainment, networking, and celebration of Nigerian creativity at our exclusive after party.",
    sessionType: "Networking",
    location: `${VENUES.nationalTheatre.shortName} - Open Arena`,
    venue: VENUES.nationalTheatre.shortName,
    speaker: "Live Performers",
    capacity: 2000,
  },
]

// Track color mapping
const trackColors: Record<string, { bg: string; text: string }> = {
  "main-conference": { bg: "bg-purple-100", text: "text-purple-700" },
  "arts-sculpture-design": { bg: "bg-accent-red/10", text: "text-accent-red" },
  "music-fashion-film-photography": { bg: "bg-accent-green/10", text: "text-accent-green" },
  "tech-gaming-music": { bg: "bg-accent-blue/10", text: "text-accent-blue" },
}

export default function SchedulePage() {
  const searchParams = useSearchParams()
  const trackFromUrl = searchParams.get("track")

  const [selectedTrack, setSelectedTrack] = useState<string | null>(trackFromUrl || null)
  const [selectedSessionType, setSelectedSessionType] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedSpeakerName, setSelectedSpeakerName] = useState<string | null>(null)

  const filteredSchedule = scheduleData.filter((item) => {
    if (selectedTrack && item.track !== selectedTrack) return false
    if (selectedSessionType && item.sessionType !== selectedSessionType) return false
    return true
  })

  // Get unique tracks and session types
  const tracks = Array.from(new Set(scheduleData.map((item) => item.track)))
  const trackNames: Record<string, string> = {
    "main-conference": DISTRICTS.mainConference.shortName,
    "arts-sculpture-design": DISTRICTS.artsSculptureDesign.shortName,
    "music-fashion-film-photography": DISTRICTS.musicFashionFilmPhotography.shortName,
    "tech-gaming-music": DISTRICTS.techGamingMusic.shortName,
  }
  const sessionTypes = Array.from(new Set(scheduleData.map((item) => item.sessionType)))

  const resetFilters = () => {
    setSelectedTrack(null)
    setSelectedSessionType(null)
  }

  const speakerData: Record<string, any> = {
    "Keynote Speaker TBA": {
      name: "Keynote Speaker TBA",
      role: "To Be Announced",
      image: "/placeholder.jpg",
      bio: "Details to be announced.",
      twitter: "#",
      linkedin: "#",
      instagram: "#",
      tags: ["TBA"],
      speakingOn: "Opening Ceremony",
    },
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 py-3 md:py-4 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/#schedule">
            <Button variant="ghost" size="sm" className="group -ml-2 rounded-md">
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Header */}
      <section className="pt-8 md:pt-12 pb-6 md:pb-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-6 md:mb-8">
            {/* Event Date Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-blue/10 text-accent-blue rounded-full text-sm font-medium mb-4">
              <Calendar className="w-4 h-4" />
              {EVENT_DATES.displayRange}
            </div>
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4 text-balance">
              SynergyCon 2.0 Schedule
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-pretty">
              One day, four immersive tracks. Explore all sessions across our creative districts—from visual arts to gaming, fashion to fintech—all at the iconic National Theatre.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-6 md:pb-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-neutral-50 rounded-2xl p-4 md:p-5 mb-6 md:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div className="flex flex-wrap gap-2">
                {/* Track Filter */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedTrack(null)}
                    className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border-[1.5px] transition-all ${
                      selectedTrack === null
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-foreground border-foreground hover:bg-foreground hover:text-background"
                    }`}
                  >
                    All Tracks
                  </button>
                  {tracks.map((track) => (
                    <button
                      key={track}
                      onClick={() => setSelectedTrack(track)}
                      className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border-[1.5px] transition-all ${
                        selectedTrack === track
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background text-foreground border-foreground hover:bg-foreground hover:text-background"
                      }`}
                    >
                      {trackNames[track] || track}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md border-[1.5px] border-foreground transition-all ${
                    viewMode === "grid"
                      ? "bg-foreground text-background"
                      : "bg-background hover:bg-foreground hover:text-background"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md border-[1.5px] border-foreground transition-all ${
                    viewMode === "list"
                      ? "bg-foreground text-background"
                      : "bg-background hover:bg-foreground hover:text-background"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Session Type Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Session Type</label>
                <select
                  value={selectedSessionType || ""}
                  onChange={(e) => setSelectedSessionType(e.target.value || null)}
                  className="w-full px-3 py-2 text-sm border-[1.5px] border-foreground rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
                >
                  <option value="">All Types</option>
                  {sessionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Results count */}
              <div className="flex items-end">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredSchedule.length}</span> of {scheduleData.length} sessions
                </p>
              </div>
            </div>

            {/* Reset Filters */}
            {(selectedTrack || selectedSessionType) && (
              <button
                onClick={resetFilters}
                className="mt-3 text-xs md:text-sm text-muted-foreground hover:text-foreground underline"
              >
                Reset all filters
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="pb-12 md:pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {filteredSchedule.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No sessions match your current filters.</p>
            </div>
          ) : (
            <div
              className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" : "space-y-4"}
            >
              {filteredSchedule.map((session) => {
                const colors = trackColors[session.track] || { bg: "bg-neutral-100", text: "text-neutral-700" }
                
                return (
                  <div
                    key={session.id}
                    className="bg-background border-[1.5px] border-foreground rounded-2xl p-4 md:p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                  >
                    {/* Session Type & Track Badge */}
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                          session.sessionType === "Keynote"
                            ? "bg-accent-blue/10 text-accent-blue"
                            : session.sessionType === "Panel Discussion"
                              ? "bg-accent-green/10 text-accent-green"
                              : session.sessionType === "Workshop"
                                ? "bg-purple-500/10 text-purple-700"
                                : session.sessionType === "Masterclass"
                                  ? "bg-amber-500/10 text-amber-700"
                                  : session.sessionType === "Networking"
                                    ? "bg-pink-500/10 text-pink-700"
                                    : "bg-accent-red/10 text-accent-red"
                        }`}
                      >
                        {session.sessionType}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${colors.bg} ${colors.text}`}>
                        {session.trackName}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base md:text-lg font-bold mb-2 text-balance line-clamp-2">{session.title}</h3>

                    {/* Description */}
                    <p className="text-xs md:text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2 flex-grow">
                      {session.description}
                    </p>

                    {/* Time */}
                    <div className="flex items-center gap-2 mb-2 text-xs">
                      <Clock className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                      <span className="font-medium">{session.time}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 mb-2 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                      <span className="text-muted-foreground">{session.location}</span>
                    </div>

                    {/* Speaker */}
                    <div className="flex items-center gap-2 pt-3 mt-auto border-t border-neutral-200 text-xs">
                      <Users className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                      {speakerData[session.speaker] ? (
                        <button
                          onClick={() => setSelectedSpeakerName(session.speaker)}
                          className="text-muted-foreground hover:text-foreground hover:underline text-left transition-colors"
                        >
                          {session.speaker}
                        </button>
                      ) : (
                        <span className="text-muted-foreground">{session.speaker}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-8 md:mt-12">
            <ScheduleNotice />
          </div>
        </div>
      </section>

      {/* Speaker Bio Modal */}
      {selectedSpeakerName && speakerData[selectedSpeakerName] && (
        <SpeakerBioModal
          speaker={speakerData[selectedSpeakerName]}
          isOpen={!!selectedSpeakerName}
          onClose={() => setSelectedSpeakerName(null)}
        />
      )}
    </main>
  )
}
