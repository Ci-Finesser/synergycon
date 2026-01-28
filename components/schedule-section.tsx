"use client"

import Link from "next/link"
import { Calendar, MapPin, Clock, Users, ArrowRight } from "lucide-react"
import { ScheduleNotice } from "./schedule-notice"
import { DISTRICTS } from "@/lib/constants"

const scheduleHighlights = [
  {
    day: 1,
    date: "TBA",
    time: "9:00 AM - 5:00 PM",
    title: DISTRICTS.artsSculptureDesign.name,
    venue: DISTRICTS.artsSculptureDesign.venue.shortName,
    location: DISTRICTS.artsSculptureDesign.venue.area,
    sessions: 12,
    color: "accent-red",
  },
  {
    day: 2,
    date: "TBA",
    time: "9:00 AM - 5:00 PM",
    title: DISTRICTS.musicFashionFilmPhotography.name,
    venue: DISTRICTS.musicFashionFilmPhotography.venue.shortName,
    location: DISTRICTS.musicFashionFilmPhotography.venue.area,
    sessions: 15,
    color: "accent-green",
  },
  {
    day: 3,
    date: "TBA",
    time: "9:00 AM - 5:00 PM",
    title: DISTRICTS.techGamingMusic.name,
    venue: DISTRICTS.techGamingMusic.venue.shortName,
    location: DISTRICTS.techGamingMusic.venue.area,
    sessions: 14,
    color: "accent-blue",
  },
  {
    day: 4,
    date: "TBA",
    time: "9:00 AM - 6:00 PM",
    title: DISTRICTS.mainConference.shortName,
    venue: DISTRICTS.mainConference.venue.shortName,
    location: DISTRICTS.mainConference.venue.area,
    sessions: 20,
    color: "accent-purple",
  },
]

export function ScheduleSection() {
  return (
    <section id="schedule" className="py-16 md:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-5 mb-8 md:mb-10 lg:mb-12">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4 text-balance">
              Event Schedule
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-pretty">
              Multi-day inspiring talks, hands-on workshops, and networking across Nigeria's four creative districts.
            </p>
          </div>
          <a
            href="/schedule"
            className="group inline-flex items-center justify-center h-auto px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base rounded-md font-medium bg-background border-2 border-gray-300 hover:bg-gray-50 transition-all"
          >
            View Full Schedule
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="md:hidden overflow-x-auto pb-4 mb-6 -mx-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex gap-4 px-4">
            {scheduleHighlights.map((item, index) => (
              <Link
                key={index}
                href="/schedule"
                className="group bg-white border-[1.5px] border-foreground rounded-2xl p-4 hover:shadow-xl transition-all duration-300 flex flex-col min-w-[85vw] max-w-[85vw] flex-shrink-0"
              >
                {/* Day Badge */}
                <div
                  className={`inline-flex self-start px-3 py-1.5 rounded-lg text-xs font-bold mb-3 ${
                    item.color === "accent-red"
                      ? "bg-accent-red/10 text-accent-red"
                      : item.color === "accent-green"
                        ? "bg-accent-green/10 text-accent-green"
                        : item.color === "accent-purple"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-accent-blue/10 text-accent-blue"
                  }`}
                >
                  District {item.day}
                </div>

                {/* Title */}
                <h3 className="text-base font-bold mb-3 text-balance">{item.title}</h3>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                    <span className="font-medium">{item.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{item.time}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium leading-tight">{item.venue}</div>
                      <div className="text-muted-foreground leading-tight">{item.location}</div>
                    </div>
                  </div>
                </div>

                {/* Sessions count */}
                <div className="flex items-center gap-2 pt-3 mt-auto border-t border-neutral-200 text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  <span>{item.sessions} Sessions</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-6 md:mb-8">
          {scheduleHighlights.map((item, index) => (
            <Link
              key={index}
              href="/schedule"
              className="group bg-background border-[1.5px] border-foreground rounded-2xl p-5 md:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Day Badge */}
              <div
                className={`inline-flex self-start px-3 py-1.5 rounded-lg text-xs font-bold mb-4 ${
                  item.color === "accent-red"
                    ? "bg-accent-red/10 text-accent-red"
                    : item.color === "accent-green"
                      ? "bg-accent-green/10 text-accent-green"
                      : item.color === "accent-purple"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-accent-blue/10 text-accent-blue"
                }`}
              >
                District {item.day}
              </div>

              {/* Title */}
              <h3 className="text-lg md:text-xl font-bold mb-4 text-balance">{item.title}</h3>

              {/* Date & Time */}
              <div className="space-y-2.5 mb-4">
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <Calendar className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                  <span className="font-medium">{item.date}</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <Clock className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                  <span className="text-muted-foreground">{item.time}</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <MapPin className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{item.venue}</div>
                    <div className="text-muted-foreground">{item.location}</div>
                  </div>
                </div>
              </div>

              {/* Sessions count */}
              <div className="flex items-center gap-2 pt-4 mt-auto border-t border-neutral-200 text-xs md:text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{item.sessions} Sessions</span>
              </div>
            </Link>
          ))}
        </div>

        <ScheduleNotice />
      </div>
    </section>
  )
}
