"use client"

import { Calendar, MapPin, Users, ArrowRight } from "lucide-react"
import Link from "next/link"
import { EVENT_DATES, ALL_VENUES } from "@/lib/constants"

export function OverviewSection() {
  return (
    <section id="overview" className="py-16 md:py-20 px-4 md:px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-5 md:space-y-6">
            <div className="space-y-2 md:space-y-3">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-balance">
                Where Innovation Meets Opportunity
              </h2>
              <p className="text-sm md:text-base text-muted-foreground text-pretty leading-relaxed">
                SynergyCon is Nigeria's flagship annual conference that brings together creative professionals, industry
                leaders, policymakers, and investors.
              </p>
              <p className="text-sm md:text-base text-muted-foreground text-pretty leading-relaxed">
                The event features keynote presentations, panel discussions, masterclasses, exhibition spaces, and
                networking opportunities designed to showcase innovations and shape the future of Nigeria's creative
                economy.
              </p>
            </div>

            <div>
              <a
                href="/about"
                className="group inline-flex items-center justify-center h-auto px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base rounded-md font-medium bg-background border-[1.5px] border-foreground hover:shadow-md transition-all"
              >
                About SynergyCon
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Event Details Card */}
          <div className="relative">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3 md:gap-4 p-4 md:p-5 bg-white rounded-2xl border-[1.5px] border-foreground">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs md:text-sm text-muted-foreground font-medium">Date</div>
                  <div className="font-semibold text-sm md:text-base">{EVENT_DATES.displayRange}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">{EVENT_DATES.daysCountDisplay} Transformative Day</div>
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-4 p-4 md:p-5 bg-white rounded-2xl border-[1.5px] border-foreground">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="text-xs md:text-sm text-muted-foreground font-medium">Venue</div>
                  <div className="font-semibold text-sm md:text-base">{ALL_VENUES.length} Venues Across Lagos</div>
                  <Link
                    href="#venue"
                    className="text-xs md:text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"
                  >
                    View Event Details
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-4 p-4 md:p-5 bg-white rounded-2xl border-[1.5px] border-foreground">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent-green/10 flex items-center justify-center">
                  <Users className="w-5 h-5 md:w-6 md:h-6 text-accent-green" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs md:text-sm text-muted-foreground font-medium">Who Should Attend</div>
                  <div className="font-semibold text-sm md:text-base">Creatives, Leaders, Policymakers, Investors</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
