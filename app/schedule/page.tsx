"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, MapPin, Users, Grid, List } from "lucide-react"
import Link from "next/link"
import { SpeakerBioModal } from "@/components/speaker-bio-modal"
import { ScheduleNotice } from "@/components/schedule-notice"
import { DISTRICTS, EVENT_DATES, VENUES } from "@/lib/constants"

const scheduleData = [
  {
    id: 1,
    day: 1,
    district: DISTRICTS.artsSculptureDesign.name,
    date: EVENT_DATES.datesAnnounced ? "Day 1" : "Day 1 (Date TBA)",
    time: "9:00 AM - 10:30 AM",
    title: "Opening Keynote: The Future of Nigerian Art",
    description:
      "Explore the intersection of traditional and contemporary art forms in Nigeria's evolving creative landscape.",
    sessionType: "Keynote",
    location: `${VENUES.jRandleCentre.shortName} - Main Hall`,
    venue: VENUES.jRandleCentre.shortName,
    speaker: "Speaker TBA",
    capacity: 500,
  },
  {
    id: 2,
    day: 1,
    district: DISTRICTS.artsSculptureDesign.name,
    date: EVENT_DATES.datesAnnounced ? "Day 1" : "Day 1 (Date TBA)",
    time: "11:00 AM - 12:30 PM",
    title: "Masterclass: Digital Art & NFTs",
    description: "Learn how to create, mint, and market your digital art in the Web3 space.",
    sessionType: "Masterclass",
    location: `${VENUES.jRandleCentre.shortName} - Studio A`,
    venue: VENUES.jRandleCentre.shortName,
    speaker: "Speaker TBA",
    capacity: 50,
  },
  {
    id: 3,
    day: 1,
    district: DISTRICTS.artsSculptureDesign.name,
    date: EVENT_DATES.datesAnnounced ? "Day 1" : "Day 1 (Date TBA)",
    time: "2:00 PM - 3:30 PM",
    title: "Panel: Sustainable Art Practices",
    description: "Industry leaders discuss eco-friendly approaches to art production and exhibition.",
    sessionType: "Panel",
    location: `${VENUES.jRandleCentre.shortName} - Conference Room`,
    venue: VENUES.jRandleCentre.shortName,
    speaker: "Speakers TBA",
    capacity: 200,
  },
  {
    id: 4,
    day: 2,
    district: DISTRICTS.musicFashionFilmPhotography.name,
    date: EVENT_DATES.datesAnnounced ? "Day 2" : "Day 2 (Date TBA)",
    time: "9:00 AM - 10:30 AM",
    title: "Fashion Forward: Building Global Brands from Lagos",
    description: "Success stories and strategies from Nigerian fashion designers making waves internationally.",
    sessionType: "Keynote",
    location: `${VENUES.royalBox.shortName} - Main Stage`,
    venue: VENUES.royalBox.shortName,
    speaker: "Speaker TBA",
    capacity: 400,
  },
  {
    id: 5,
    day: 2,
    district: DISTRICTS.musicFashionFilmPhotography.name,
    date: EVENT_DATES.datesAnnounced ? "Day 2" : "Day 2 (Date TBA)",
    time: "11:00 AM - 1:00 PM",
    title: "Workshop: Cinematography Essentials",
    description: "Hands-on training in camera work, lighting, and visual storytelling for filmmakers.",
    sessionType: "Workshop",
    location: `${VENUES.royalBox.shortName} - Studio B`,
    venue: VENUES.royalBox.shortName,
    speaker: "Speakers TBA",
    capacity: 30,
  },
  {
    id: 6,
    day: 2,
    district: DISTRICTS.musicFashionFilmPhotography.name,
    date: EVENT_DATES.datesAnnounced ? "Day 2" : "Day 2 (Date TBA)",
    time: "2:30 PM - 4:00 PM",
    title: "Panel: The Business of Fashion",
    description: "From design to retail: navigating the fashion industry value chain.",
    sessionType: "Panel",
    location: `${VENUES.royalBox.shortName} - Forum Hall`,
    venue: VENUES.royalBox.shortName,
    speaker: "Speakers TBA",
    capacity: 150,
  },
  {
    id: 7,
    day: 3,
    district: DISTRICTS.techGamingMusic.name,
    date: EVENT_DATES.datesAnnounced ? "Day 3" : "Day 3 (Date TBA)",
    time: "10:00 AM - 11:30 AM",
    title: "Tech Innovation: Building Solutions for Africa",
    description: "How Nigerian tech entrepreneurs are solving local and global challenges.",
    sessionType: "Keynote",
    location: `${VENUES.lionWonderArena.shortName} - Tech Arena`,
    venue: VENUES.lionWonderArena.shortName,
    speaker: "Speaker TBA",
    capacity: 600,
  },
  {
    id: 8,
    day: 3,
    district: DISTRICTS.techGamingMusic.name,
    date: EVENT_DATES.datesAnnounced ? "Day 3" : "Day 3 (Date TBA)",
    time: "12:00 PM - 2:00 PM",
    title: "Masterclass: Music Production & Distribution",
    description: "Master the art of producing and distributing music in the digital age.",
    sessionType: "Masterclass",
    location: `${VENUES.lionWonderArena.shortName} - Studio C`,
    venue: VENUES.lionWonderArena.shortName,
    speaker: "Speakers TBA",
    capacity: 40,
  },
  {
    id: 9,
    day: 3,
    district: DISTRICTS.techGamingMusic.name,
    date: EVENT_DATES.datesAnnounced ? "Day 3" : "Day 3 (Date TBA)",
    time: "3:00 PM - 4:30 PM",
    title: "Workshop: Game Development Fundamentals",
    description: "Introduction to game design, development, and monetization strategies.",
    sessionType: "Workshop",
    location: `${VENUES.lionWonderArena.shortName} - Gaming Lab`,
    venue: VENUES.lionWonderArena.shortName,
    speaker: "Speakers TBA",
    capacity: 50,
  },
]

export default function SchedulePage() {
  const searchParams = useSearchParams()
  const dayFromUrl = searchParams.get("day")

  const [selectedDay, setSelectedDay] = useState<number | null>(dayFromUrl ? Number.parseInt(dayFromUrl) : null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [selectedSessionType, setSelectedSessionType] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedSpeakerName, setSelectedSpeakerName] = useState<string | null>(null)

  const filteredSchedule = scheduleData.filter((item) => {
    if (selectedDay && item.day !== selectedDay) return false
    if (selectedDistrict && item.district !== selectedDistrict) return false
    if (selectedSessionType && item.sessionType !== selectedSessionType) return false
    if (selectedLocation && item.venue !== selectedLocation) return false
    return true
  })

  const days = Array.from(new Set(scheduleData.map((item) => item.day))).sort()
  const districts = Array.from(new Set(scheduleData.map((item) => item.district)))
  const sessionTypes = Array.from(new Set(scheduleData.map((item) => item.sessionType)))
  const locations = Array.from(new Set(scheduleData.map((item) => item.venue)))

  const resetFilters = () => {
    setSelectedDay(null)
    setSelectedDistrict(null)
    setSelectedSessionType(null)
    setSelectedLocation(null)
  }

  const speakerData: Record<string, any> = {
    "Speaker TBA": {
      name: "Speaker TBA",
      role: "To Be Announced",
      image: "/placeholder.jpg",
      bio: "Details to be announced.",
      twitter: "#",
      linkedin: "#",
      instagram: "#",
      tags: ["TBA"],
      speakingOn: "Various Sessions",
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
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4 text-balance">
              SynergyCon 2.0 Schedule
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-pretty">
              Explore all sessions across our three-day festival. Filter by day, district, session type, or location to
              build your perfect experience.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-6 md:pb-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-neutral-50 rounded-2xl p-4 md:p-5 mb-6 md:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div className="flex flex-wrap gap-2">
                {/* Day Filter */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDay(null)}
                    className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border-[1.5px] transition-all ${
                      selectedDay === null
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-foreground border-foreground hover:bg-foreground hover:text-background"
                    }`}
                  >
                    All Days
                  </button>
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border-[1.5px] transition-all ${
                        selectedDay === day
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background text-foreground border-foreground hover:bg-foreground hover:text-background"
                      }`}
                    >
                      Day {day}
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

            {/* Additional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* District Filter */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">District / Zone</label>
                <select
                  value={selectedDistrict || ""}
                  onChange={(e) => setSelectedDistrict(e.target.value || null)}
                  className="w-full px-3 py-2 text-sm border-[1.5px] border-foreground rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
                >
                  <option value="">All Districts</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Type Filter */}
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

              {/* Location Filter */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Location</label>
                <select
                  value={selectedLocation || ""}
                  onChange={(e) => setSelectedLocation(e.target.value || null)}
                  className="w-full px-3 py-2 text-sm border-[1.5px] border-foreground rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reset Filters */}
            {(selectedDay || selectedDistrict || selectedSessionType || selectedLocation) && (
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
              {filteredSchedule.map((session) => (
                <div
                  key={session.id}
                  className="bg-background border-[1.5px] border-foreground rounded-2xl p-4 md:p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  {/* Session Type Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                        session.sessionType === "Keynote"
                          ? "bg-accent-blue/10 text-accent-blue"
                          : session.sessionType === "Panel"
                            ? "bg-accent-green/10 text-accent-green"
                            : session.sessionType === "Workshop"
                              ? "bg-purple-500/10 text-purple-700"
                              : "bg-accent-red/10 text-accent-red"
                      }`}
                    >
                      {session.sessionType}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">Day {session.day}</span>
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
              ))}
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
