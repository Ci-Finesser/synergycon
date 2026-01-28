"use client"

import { useEffect, useState, useRef } from "react"
import { Info, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getCachedData, setCachedData } from "@/lib/supabase/cache"
import { PartnerBioModal } from "./partner-bio-modal"
import type { Sponsor, MergedSponsor, Partner } from '@/types/components'

// Re-export for backward compatibility
export type { Sponsor, MergedSponsor, Partner }

export function SponsorsSection() {
  const [allSponsors, setAllSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [hoveredSponsor, setHoveredSponsor] = useState<string | null>(null)
  const [selectedPartner, setSelectedPartner] = useState<MergedSponsor | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchSponsors()
  }, [])

  const fetchSponsors = async () => {
    const cacheKey = "all-sponsors"
    const cached = getCachedData<Sponsor[]>(cacheKey)

    if (cached) {
      setAllSponsors(cached)
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from("sponsors")
      .select("id, name, logo_url, tier, display_order, bio, description, website")

    if (data) {
      const sorted = data.sort((a: Sponsor, b: Sponsor) => {
        if (a.name === "Finesser Ltd") return -1
        if (b.name === "Finesser Ltd") return 1
        if (a.name === "Sterling Bank") return -1
        if (b.name === "Sterling Bank") return 1
        return (a.display_order || 0) - (b.display_order || 0)
      })
      setAllSponsors(sorted)
      setCachedData(cacheKey, sorted)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!scrollRef.current || isPaused || selectedPartner) return

    const scrollContainer = scrollRef.current
    let scrollAmount = 0
    const scrollSpeed = 1

    const scroll = () => {
      if (!isPaused && !selectedPartner && scrollContainer) {
        scrollAmount += scrollSpeed
        scrollContainer.scrollLeft = scrollAmount

        if (scrollAmount >= scrollContainer.scrollWidth / 2) {
          scrollAmount = 0
        }
      }
    }

    const intervalId = setInterval(scroll, 30)

    return () => clearInterval(intervalId)
  }, [isPaused, allSponsors, selectedPartner]) // Added selectedPartner to dependencies

  const mergedSponsors: MergedSponsor[] = allSponsors.reduce((acc, sponsor) => {
    const existing = acc.find((s) => s.name === sponsor.name)
    if (existing) {
      const tierLabel = sponsor.tier === "principal" ? "Principal Partner" : "Ecosystem Partner"
      if (!existing.tiers.includes(tierLabel)) {
        existing.tiers.push(tierLabel)
      }
    } else {
      acc.push({
        id: sponsor.id,
        name: sponsor.name,
        logo_url: sponsor.logo_url,
        tiers: [sponsor.tier === "principal" ? "Principal Partner" : "Ecosystem Partner"],
        display_order: sponsor.display_order,
        bio: sponsor.bio,
        description: sponsor.description,
        website: sponsor.website,
      })
    }
    return acc
  }, [] as MergedSponsor[])

  if (loading) {
    return (
      <section id="sponsors" className="relative z-10 py-16 md:py-20 px-4 md:px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4 text-balance">
                Our Esteemed Partners
              </h2>
              <p className="text-sm md:text-base text-muted-foreground text-pretty leading-relaxed">
                SynergyCon is made possible by these incredible organizations.
              </p>
            </div>
          </div>
          <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="sponsors" className="relative z-10 py-16 md:py-20 px-4 md:px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4 text-balance">
              Our Esteemed Partners
            </h2>
            <p className="text-sm md:text-base text-muted-foreground text-pretty leading-relaxed">
              SynergyCon is made possible by these incredible organizations committed to advancing Nigeria's Creative
              Economy.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/become-partner"
              className="inline-flex items-center justify-center h-auto px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base rounded-md font-medium bg-foreground text-background border-2 border-foreground hover:bg-foreground/90 transition-all"
            >
              Partner With Us
            </a>
            <a
              href="/partners"
              className="group inline-flex items-center justify-center h-auto px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base rounded-md font-medium bg-background border-2 border-gray-300 hover:bg-gray-50 transition-all"
            >
              View All Partners
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {mergedSponsors.length > 0 ? (
        <div className="mb-6 md:mb-8">
          <div className="relative -mx-4 md:-mx-6">
            <div
              ref={scrollRef}
              className="flex gap-6 md:gap-7 overflow-x-auto scrollbar-hide px-4 md:px-6"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {mergedSponsors.map((sponsor) => {
                const isHovered = hoveredSponsor === sponsor.id
                const needsPadding =
                  sponsor.name === "Sterling Bank" ||
                  sponsor.name === "Finesser Ltd" ||
                  sponsor.name === "Future Africa"
                return (
                  <div
                    key={sponsor.id}
                    className="flex flex-col items-center gap-3 md:gap-4 group flex-shrink-0 py-3 cursor-pointer"
                    onMouseEnter={() => setHoveredSponsor(sponsor.id)}
                    onMouseLeave={() => setHoveredSponsor(null)}
                    onClick={() => setSelectedPartner(sponsor)}
                  >
                    <div className="relative w-32 h-32 rounded-full bg-white flex items-center justify-center overflow-hidden hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
                      <div
                        className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"} bg-black rounded-full p-3 z-20`}
                      >
                        <p className="text-white font-semibold text-xs text-center leading-tight mb-1">
                          {sponsor.name}
                        </p>
                        <p className="text-white/80 text-[10px] text-center">{sponsor.tiers.join(" & ")}</p>
                      </div>
                      <img
                        src={sponsor.logo_url || "/placeholder.svg"}
                        alt={sponsor.name}
                        className={`w-full h-full object-contain transition-opacity duration-300 ${isHovered ? "opacity-0" : "opacity-100"} ${needsPadding ? "p-3" : ""}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="bg-neutral-50 border-2 border-neutral-200 rounded-xl p-5 md:p-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-accent-blue flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Partners and sponsors information will be available soon.{" "}
                <a href="/become-partner" className="font-medium text-foreground hover:underline">
                  Apply to become a partner
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto mt-6 md:mt-8">
        <div className="bg-neutral-50 border-2 border-neutral-200 rounded-xl p-4 md:p-5 flex items-start gap-3">
          <Info className="w-5 h-5 text-accent-blue flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              More information about our partners and sponsorship opportunities will be available closer to the event
              date.{" "}
              <a href="/become-partner" className="font-medium text-foreground hover:underline">
                Apply to become a sponsor
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {selectedPartner && (
        <PartnerBioModal
          partner={selectedPartner as Partner}
          isOpen={!!selectedPartner}
          onClose={() => setSelectedPartner(null)}
        />
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
