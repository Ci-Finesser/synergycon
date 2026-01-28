"use client"

import { Calendar, MapPin } from "lucide-react"
import { DISTRICTS, EVENT_DATES } from "@/lib/constants"

export function LocationSection() {
  const venues = [
    {
      day: 1,
      dayColor: "bg-red-100 text-red-600",
      name: DISTRICTS.artsSculptureDesign.venue.name,
      shortName: DISTRICTS.artsSculptureDesign.venue.shortName,
      district: DISTRICTS.artsSculptureDesign.shortName,
      address: DISTRICTS.artsSculptureDesign.venue.address,
      date: EVENT_DATES.datesAnnounced ? "Day 1" : "TBA",
      time: "9:00 AM - 5:00 PM WAT",
      mapsLink: DISTRICTS.artsSculptureDesign.venue.googleMapsUrl,
      startDate: EVENT_DATES.startDateISO,
      endDate: EVENT_DATES.startDateISO.replace("09:00", "17:00"),
      coordinates: `${DISTRICTS.artsSculptureDesign.venue.geo.latitude},${DISTRICTS.artsSculptureDesign.venue.geo.longitude}`,
    },
    {
      day: 2,
      dayColor: "bg-green-100 text-green-600",
      name: DISTRICTS.musicFashionFilmPhotography.venue.name,
      shortName: DISTRICTS.musicFashionFilmPhotography.venue.shortName,
      district: DISTRICTS.musicFashionFilmPhotography.shortName,
      address: DISTRICTS.musicFashionFilmPhotography.venue.address,
      date: EVENT_DATES.datesAnnounced ? "Day 2" : "TBA",
      time: "9:00 AM - 5:00 PM WAT",
      mapsLink: DISTRICTS.musicFashionFilmPhotography.venue.googleMapsUrl,
      startDate: EVENT_DATES.startDateISO,
      endDate: EVENT_DATES.startDateISO.replace("09:00", "17:00"),
      coordinates: `${DISTRICTS.musicFashionFilmPhotography.venue.geo.latitude},${DISTRICTS.musicFashionFilmPhotography.venue.geo.longitude}`,
    },
    {
      day: 3,
      dayColor: "bg-blue-100 text-blue-600",
      name: DISTRICTS.techGamingMusic.venue.name,
      shortName: DISTRICTS.techGamingMusic.venue.shortName,
      district: DISTRICTS.techGamingMusic.shortName,
      address: DISTRICTS.techGamingMusic.venue.address,
      date: EVENT_DATES.datesAnnounced ? "Day 3" : "TBA",
      time: "9:00 AM - 5:00 PM WAT",
      mapsLink: DISTRICTS.techGamingMusic.venue.googleMapsUrl,
      startDate: EVENT_DATES.startDateISO,
      endDate: EVENT_DATES.startDateISO.replace("09:00", "17:00"),
      coordinates: `${DISTRICTS.techGamingMusic.venue.geo.latitude},${DISTRICTS.techGamingMusic.venue.geo.longitude}`,
    },
    {
      day: 4,
      dayColor: "bg-purple-100 text-purple-600",
      name: DISTRICTS.mainConference.venue.name,
      shortName: DISTRICTS.mainConference.venue.shortName,
      district: DISTRICTS.mainConference.shortName,
      address: DISTRICTS.mainConference.venue.address,
      date: EVENT_DATES.datesAnnounced ? "Day 4" : "TBA",
      time: "9:00 AM - 6:00 PM WAT",
      mapsLink: DISTRICTS.mainConference.venue.googleMapsUrl,
      startDate: EVENT_DATES.startDateISO,
      endDate: EVENT_DATES.endDateISO,
      coordinates: `${DISTRICTS.mainConference.venue.geo.latitude},${DISTRICTS.mainConference.venue.geo.longitude}`,
    },
  ]

  const addToCalendar = (venue: (typeof venues)[0]) => {
    const event = {
      title: `SynergyCon 2.0 - Day ${venue.day}`,
      description: `Nigeria's leading creative synergy conference - Day ${venue.day}`,
      location: `${venue.name}, ${venue.address}`,
      startDate: venue.startDate,
      endDate: venue.endDate,
    }
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&dates=${event.startDate.replace(/[-:]/g, "")}/${event.endDate.replace(/[-:]/g, "")}`
    window.open(googleCalendarUrl, "_blank")
  }

  const mapUrl = `https://www.google.com/maps/d/embed?mid=103nL5ldohfpamFBQE8eTqoRq1RofM9g`

  return (
    <section id="venue" className="py-12 md:py-20 bg-white">
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-6 mb-4 md:mb-10 text-center">
          <h2 className="text-xl md:text-3xl lg:text-4xl font-bold tracking-tight text-balance">
            SynergyCon 2.0 Event Locations
          </h2>
        </div>

        <div
          className="relative w-full h-[300px] mb-6 md:mb-12 overflow-hidden border-t border-b border-gray-300"
          style={{ borderWidth: "0.5px" }}
        >
          <iframe
            src={mapUrl}
            width="100%"
            className="h-[360px]"
            style={{
              border: 0,
              filter: "grayscale(1) contrast(1.1)",
              marginTop: "-60px",
            }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="SynergyCon 2.0 Locations Across Lagos"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {venues.map((venue) => (
              <div
                key={venue.day}
                className="border border-gray-200 rounded-2xl p-4 md:p-6 space-y-3 md:space-y-4 hover:shadow-lg transition-shadow"
              >
                <div
                  className={`inline-block px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium ${venue.dayColor}`}
                >
                  {venue.district}
                </div>

                <div className="space-y-2 md:space-y-3">
                  <h3 className="text-lg md:text-xl font-bold text-foreground">{venue.name}</h3>

                  <div className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 mt-0.5 flex-shrink-0" />
                    <span>{venue.address}</span>
                  </div>

                  <div className="flex items-start gap-2 text-xs md:text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <div>{venue.date}</div>
                      <div>{venue.time}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <a
                    href={venue.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-medium text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    Get Directions
                  </a>
                  <button
                    onClick={() => addToCalendar(venue)}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    Add to Calendar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
