"use client"

import { useState, useEffect, useRef } from "react"
import { Radio, Tv, Globe, Users } from "lucide-react"
import {
  MEDIA_PARTNERS_BROADCAST,
  MEDIA_PARTNERS_DIGITAL,
  GOVERNMENT_PARTNERS,
} from "@/lib/constants/event"

type PartnerCategory = "broadcast" | "digital" | "government"

const categoryInfo = {
  broadcast: {
    title: "Radio & TV Partners",
    description: "Our broadcasting partners bringing SynergyCon to screens and airwaves across Nigeria",
    icon: Tv,
  },
  digital: {
    title: "Digital Media Partners",
    description: "Online platforms, blogs, and influencers amplifying our reach",
    icon: Globe,
  },
  government: {
    title: "Government & Strategic Partners",
    description: "Public sector partners supporting Nigeria's Creative Economy",
    icon: Users,
  },
}

export function MediaPartnersSection() {
  const [activeCategory, setActiveCategory] = useState<PartnerCategory>("broadcast")

  const getPartnersByCategory = (category: PartnerCategory) => {
    switch (category) {
      case "broadcast":
        return MEDIA_PARTNERS_BROADCAST
      case "digital":
        return MEDIA_PARTNERS_DIGITAL
      case "government":
        return GOVERNMENT_PARTNERS
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "radio":
        return <Radio className="w-4 h-4" />
      case "tv":
        return <Tv className="w-4 h-4" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      radio: "Radio",
      tv: "Television",
      online: "Online Media",
      blog: "Blog",
      social: "Social Media",
      influencer: "Influencer",
      "state-ministry": "State Ministry",
      "state-agency": "State Agency",
      "federal-agency": "Federal Agency",
    }
    return labels[type] || type
  }

  const partners = getPartnersByCategory(activeCategory)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let rafId: number
    const speed = 0.6
    const step = () => {
      if (!el) return
      if (!isPaused) {
        el.scrollLeft += speed
      }
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
        el.scrollLeft = 0
      }
      rafId = requestAnimationFrame(step)
    }
    el.scrollLeft = 0
    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [activeCategory, isPaused])
  const info = categoryInfo[activeCategory]
  const CategoryIcon = info.icon

  return (
    <section id="media-partners" className="relative z-10 py-16 md:py-20 px-4 md:px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4 text-balance">
              Media & Strategic Partners
            </h2>
            <p className="text-sm md:text-base text-muted-foreground text-pretty leading-relaxed">
              Join us in building Africa's largest Creative Economy movement with our incredible media and government partners.
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(Object.keys(categoryInfo) as PartnerCategory[]).map((category) => {
            const Icon = categoryInfo[category].icon
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border-2 transition-all ${
                  activeCategory === category
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background border-foreground/20 hover:border-foreground/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                {categoryInfo[category].title}
              </button>
            )
          })}
        </div>

        {/* Category Info */}
        <div className="mb-6 p-4 bg-muted/30 rounded-lg border-2 border-muted">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-foreground rounded-md">
              <CategoryIcon className="w-5 h-5 text-background" />
            </div>
            <div>
              <h3 className="font-semibold">{info.title}</h3>
              <p className="text-sm text-muted-foreground">{info.description}</p>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div key={activeCategory} className="flex gap-3">
            {Array.from({ length: 2 }).flatMap((_, copy) =>
              partners.map((partner: any, i: number) => (
                <div
                  key={`${activeCategory}-${(partner.id ?? i)}-copy-${copy}`}
                  className="group bg-white border-2 border-foreground/10 rounded-xl p-3 hover:border-foreground/30 hover:shadow-lg transition-all flex items-center gap-3 w-64 md:w-72 h-28 md:h-32 flex-shrink-0"
                >
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(partner.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-0.5 truncate">
                      {"shortName" in partner ? partner.shortName : partner.name}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {getTypeLabel(partner.type)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Partner Stats */}
        <div className="mt-10 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <div className="text-2xl md:text-3xl font-bold">
              {MEDIA_PARTNERS_BROADCAST.length}
            </div>
            <div className="text-sm text-muted-foreground">Broadcast Partners</div>
          </div>
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <div className="text-2xl md:text-3xl font-bold">
              {MEDIA_PARTNERS_DIGITAL.length}
            </div>
            <div className="text-sm text-muted-foreground">Digital Partners</div>
          </div>
          <div className="text-center p-4 bg-muted/20 rounded-lg">
            <div className="text-2xl md:text-3xl font-bold">
              {GOVERNMENT_PARTNERS.length}
            </div>
            <div className="text-sm text-muted-foreground">Government Partners</div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}
