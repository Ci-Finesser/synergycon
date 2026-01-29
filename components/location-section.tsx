"use client"

import { Calendar, MapPin, Clock } from "lucide-react"
import { DISTRICTS, EVENT_DATES, VENUES } from "@/lib/constants"

export function LocationSection() {
  const tracks = [
    {
      track: 1,
      trackColor: "bg-red-100 text-red-600",
      district: DISTRICTS.artsSculptureDesign.shortName,
      zone: "Main Gallery Wing",
      time: "9:00 AM - 12:00 PM",
      sessions: 6,
    },
    {
      track: 2,
      trackColor: "bg-green-100 text-green-600",
      district: DISTRICTS.musicFashionFilmPhotography.shortName,
      zone: "Fashion & Film Pavilion",
      time: "9:00 AM - 12:00 PM",
      sessions: 8,
    },
    {
      track: 3,
      trackColor: "bg-blue-100 text-blue-600",
      district: DISTRICTS.techGamingMusic.shortName,
      zone: "Innovation Hub",
      time: "1:00 PM - 5:00 PM",
      sessions: 7,
    },
    {
      track: 4,
      trackColor: "bg-purple-100 text-purple-600",
      district: DISTRICTS.mainConference.shortName,
      zone: "Main Stage Arena",
      time: "5:00 PM - 8:00 PM",
      sessions: 5,
    },
  ]

  const addToCalendar = () => {
    const event = {
      title: `SynergyCon 2.0 - ${EVENT_DATES.displayRange}`,
      description: `Nigeria's premier creative economy summit. Four immersive districts at National Theatre, Lagos.`,
      location: `${VENUES.nationalTheatre.name}, ${VENUES.nationalTheatre.address}`,
      startDate: EVENT_DATES.startDateISO,
      endDate: EVENT_DATES.endDateISO,
    }
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&dates=${event.startDate.replace(/[-:]/g, "")}/${event.endDate.replace(/[-:]/g, "")}`
    window.open(googleCalendarUrl, "_blank")
  }

  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.0!2d3.3892!3d6.4698!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sNational+Theatre+Nigeria!5e0!3m2!1sen!2sng!4v1234567890`

  return (
    <section id="venue" className="py-12 md:py-20 bg-white">
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-6 mb-6 md:mb-10 text-center">
          <h2 className="text-xl md:text-3xl lg:text-4xl font-bold tracking-tight text-balance mb-3">
            One Iconic Venue. Four Creative Districts.
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            All the action unfolds at Nigeria&apos;s cultural landmark \u2014 National Theatre, Iganmu. Navigate between districts throughout the day to craft your perfect experience.
          </p>
        </div>

        {/* Main Venue Card */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 mb-8">
          <div className="bg-gradient-to-br from-zinc-900 to-black rounded-2xl p-6 md:p-8 text-white">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-medium mb-4">
                  📍 Official Venue
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">{VENUES.nationalTheatre.name}</h3>
                <p className="text-white/70 mb-4">{VENUES.nationalTheatre.address}</p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>{EVENT_DATES.displayRange}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>9:00 AM - 8:00 PM WAT</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={VENUES.nationalTheatre.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Get Directions
                </a>
                <button
                  onClick={addToCalendar}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Add to Calendar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* District Zones */}
        {/* <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h4 className="text-lg md:text-xl font-bold mb-4 text-center">Explore the Four Districts</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {tracks.map((track) => (
              <div
                key={track.track}
                className="border border-gray-200 rounded-xl p-4 md:p-5 hover:shadow-lg transition-shadow"
              >
                <div
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${track.trackColor}`}
                >
                  Track {track.track}
                </div>
                <h5 className="font-bold text-sm md:text-base mb-1">{track.district}</h5>
                <p className="text-xs text-muted-foreground mb-2">{track.zone}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{track.time}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {track.sessions} Sessions
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </section>
  )
}
