"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, Grid3x3, List, Handshake, ArrowRight, Info } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { BioModal } from "@/components/bio-modal"
import { PartnerCard } from "@/components/partner-card"
import { SPONSORSHIP_TIERS } from "@/lib/partnership-tiers"
import type { Partner } from '@/types/components'

// Re-export for backward compatibility
export type { Partner }

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic'

const partnershipTiers = SPONSORSHIP_TIERS

export default function PartnersPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedTier, setSelectedTier] = useState<string>("all")
  const [partners, setPartners] = useState<Partner[]>([])
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    const { data } = await supabase
      .from("sponsors")
      .select("*")
      .in("category", ["Sponsors", "Partners", "Media & Entertainment"])
      .order("display_order")
    if (data) setPartners(data)
  }

  const openPartnerModal = (partner: Partner) => {
    setSelectedPartner(partner)
  }

  const sponsorsPartners = partners.filter((p) => p.category === "Sponsors")
  const partnersCategory = partners.filter((p) => p.category === "Partners")
  const mediaEntertainment = partners.filter((p) => p.category === "Media & Entertainment")

  const getFilteredByTier = (categoryPartners: Partner[]) => {
    if (selectedTier === "all") return categoryPartners
    return categoryPartners.filter((p) => p.sub_category?.toLowerCase() === selectedTier.toLowerCase())
  }

  const showTierFilter = selectedCategory === "sponsors" || selectedCategory === "partners"

  const getAvailableTiers = () => {
    if (selectedCategory === "sponsors") {
      return ["Headline Sponsor", "Silver Sponsor", "Gold Sponsor", "Platinum Sponsor", "Diamond Sponsor"]
    } else if (selectedCategory === "partners") {
      return ["Principal Partner", "Community Partner", "Ecosystem Partner", "Brand Collaboration"]
    }
    return []
  }

  const getTierLabel = (tier: string) => {
    return tier
  }

  const getTierColor = (tier: string | null) => {
    if (!tier) return "text-muted-foreground"
    const tierLower = tier.toLowerCase()
    const colors: Record<string, string> = {
      "headline sponsor": "text-rose-600",
      "silver sponsor": "text-gray-400",
      "gold sponsor": "text-amber-500",
      "platinum sponsor": "text-cyan-400",
      "diamond sponsor": "text-purple-500",
      "principal partner": "text-blue-600",
      "community partner": "text-green-600",
      "ecosystem partner": "text-teal-600",
      "brand collaboration": "text-orange-600",
    }
    return colors[tierLower] || "text-muted-foreground"
  }

  const renderEmptyState = (categoryName: string) => (
    <div className="bg-neutral-50 border-2 border-neutral-200 rounded-xl p-5 md:p-6">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-accent-blue flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm md:text-base font-semibold mb-2.5 md:mb-3">No {categoryName} Yet</h3>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4">
            We're currently building partnerships in this category. Interested in joining as a{" "}
            {categoryName.toLowerCase()}?
          </p>
          <Link href="/become-partner">
            <Button className="group rounded-md text-sm h-auto py-2 px-4">
              Apply Now
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )

  const renderPartnerCards = (partnersList: Partner[]) => (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
          : "flex flex-col gap-3 md:gap-4"
      }
    >
      {partnersList.map((partner) => (
        <PartnerCard key={partner.id} partner={partner} viewMode={viewMode} onClick={openPartnerModal} />
      ))}
    </div>
  )

  return (
    <main className="min-h-screen">
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-foreground">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5">
          <Link href="/">
            <Button variant="ghost" size="sm" className="group -ml-2 rounded-md">
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      <section className="py-6 md:py-8 lg:py-10 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-5 md:mb-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2.5 md:mb-3 text-balance">
              Our Sponsors & Partners
            </h1>
            <p className="text-sm md:text-base text-muted-foreground text-pretty leading-relaxed">
              These visionary organizations share our commitment to building a thriving Creative Economy in Nigeria and
              across Africa.
            </p>
          </div>

          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Filter by Category:
                </span>
                <button
                  onClick={() => {
                    setSelectedCategory("all")
                    setSelectedTier("all")
                  }}
                  className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border-[1.5px] transition-colors ${
                    selectedCategory === "all"
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent border-foreground hover:bg-neutral-50"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory("sponsors")
                    setSelectedTier("all")
                  }}
                  className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border-[1.5px] transition-colors ${
                    selectedCategory === "sponsors"
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent border-foreground hover:bg-neutral-50"
                  }`}
                >
                  Sponsors
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory("partners")
                    setSelectedTier("all")
                  }}
                  className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border-[1.5px] transition-colors ${
                    selectedCategory === "partners"
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent border-foreground hover:bg-neutral-50"
                  }`}
                >
                  Partners
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory("media_entertainment")
                    setSelectedTier("all")
                  }}
                  className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border-[1.5px] transition-colors ${
                    selectedCategory === "media_entertainment"
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent border-foreground hover:bg-neutral-50"
                  }`}
                >
                  Media & Entertainment
                </button>
              </div>

              <div className="flex items-center justify-end gap-1 border-[1.5px] border-foreground rounded-md p-0.5 flex-shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === "grid" ? "bg-foreground text-background" : "hover:bg-neutral-100"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === "list" ? "bg-foreground text-background" : "hover:bg-neutral-100"
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {showTierFilter && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Filter by Tier:
                </span>
                <button
                  onClick={() => setSelectedTier("all")}
                  className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border-[1.5px] transition-colors ${
                    selectedTier === "all"
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent border-foreground hover:bg-neutral-50"
                  }`}
                >
                  All Tiers
                </button>
                {getAvailableTiers().map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border-[1.5px] transition-colors ${
                      selectedTier === tier
                        ? "bg-foreground text-background border-foreground"
                        : "bg-transparent border-foreground hover:bg-neutral-50"
                    }`}
                  >
                    {getTierLabel(tier)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {(selectedCategory === "all" || selectedCategory === "sponsors") && (
        <section className="pb-8 md:pb-10 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-5">
              Sponsors {sponsorsPartners.length > 0 && `(${getFilteredByTier(sponsorsPartners).length})`}
            </h2>
            {sponsorsPartners.length > 0
              ? renderPartnerCards(getFilteredByTier(sponsorsPartners))
              : renderEmptyState("Sponsors")}
          </div>
        </section>
      )}

      {(selectedCategory === "all" || selectedCategory === "partners") && (
        <section className="pb-8 md:pb-10 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-5">
              Partners {partnersCategory.length > 0 && `(${getFilteredByTier(partnersCategory).length})`}
            </h2>
            {partnersCategory.length > 0
              ? renderPartnerCards(getFilteredByTier(partnersCategory))
              : renderEmptyState("Partners")}
          </div>
        </section>
      )}

      {(selectedCategory === "all" || selectedCategory === "media_entertainment") && (
        <section className="pb-8 md:pb-10 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-5">
              Media & Entertainment {mediaEntertainment.length > 0 && `(${mediaEntertainment.length})`}
            </h2>
            {mediaEntertainment.length > 0
              ? renderPartnerCards(mediaEntertainment)
              : renderEmptyState("Media & Entertainment Partners")}
          </div>
        </section>
      )}

      {/* Links to separate Vendors and Product Showcase pages */}
      {selectedCategory === "all" && (
        <section className="pb-8 md:pb-10 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/vendors"
                className="group bg-neutral-50 border-2 border-neutral-200 rounded-xl p-5 md:p-6 hover:border-foreground transition-colors"
              >
                <h3 className="text-lg md:text-xl font-bold mb-2">Vendors</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-4">
                  Discover vendors bringing products and services to SynergyCon 2.0.
                </p>
                <span className="inline-flex items-center text-sm font-medium group-hover:underline">
                  View Vendors
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="/product-showcase"
                className="group bg-neutral-50 border-2 border-neutral-200 rounded-xl p-5 md:p-6 hover:border-foreground transition-colors"
              >
                <h3 className="text-lg md:text-xl font-bold mb-2">Product Showcase</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-4">
                  Explore innovative products from Nigeria's creative and tech ecosystem.
                </p>
                <span className="inline-flex items-center text-sm font-medium group-hover:underline">
                  View Products
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="pb-12 md:pb-16 lg:pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-foreground text-background rounded-2xl md:rounded-3xl p-8 md:p-12 lg:p-16">
            <div className="text-center mb-10 md:mb-12 lg:mb-14">
              <Handshake className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 md:mb-5" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-balance">
                Partner with SynergyCon 2.0
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-background/80 max-w-3xl mx-auto text-pretty leading-relaxed">
                Join leading organizations in supporting Nigeria's Creative Economy. Partner with us to gain visibility,
                connect with innovators, and drive impact.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-6xl mx-auto mb-8 md:mb-10">
              {partnershipTiers.map((tier, index) => {
                const isPopular = tier.popular
                const tierValue = tier.name.toLowerCase().replace(" sponsor", "")

                return (
                  <div
                    key={index}
                    className={`relative rounded-xl md:rounded-2xl p-4 md:p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col bg-foreground text-background border-[1.5px] border-background/20`}
                  >
                    {isPopular && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-foreground text-[10px] md:text-xs font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                        MOST POPULAR
                      </div>
                    )}

                    <div className="mb-3 md:mb-4 pt-1">
                      <h3 className={`text-sm md:text-base font-semibold mb-1.5 md:mb-2 ${tier.titleColor}`}>
                        {tier.name}
                      </h3>
                      <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-background">{tier.price}</div>
                    </div>

                    <ul className="space-y-1.5 md:space-y-2 mb-4 md:mb-5 flex-1">
                      {tier.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0 mt-0.5 text-background" />
                          <span className="text-[11px] md:text-xs leading-relaxed text-background/80">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href={`/become-partner?tier=${tierValue}`} className="w-full">
                      <Button
                        variant="default"
                        className="w-full rounded-lg md:rounded-xl text-xs md:text-sm h-9 md:h-10 group transition-all bg-white text-black hover:bg-gray-100"
                      >
                        Select Tier
                        <ArrowRight className="ml-2 w-3 h-3 md:w-3.5 md:h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                )
              })}
            </div>

            <div className="text-center">
              <Link href="/become-partner?tier=other">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-auto px-6 md:px-8 py-3 md:py-4 text-sm md:text-base rounded-xl border border-background text-background hover:bg-background hover:text-foreground bg-transparent"
                >
                  Explore Other Partnership Options
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {selectedPartner && (
        <BioModal
          name={selectedPartner.name}
          bio={selectedPartner.bio || "No bio available"}
          image={selectedPartner.logo_url}
          website={selectedPartner.website}
          isOpen={!!selectedPartner}
          onClose={() => setSelectedPartner(null)}
        />
      )}
    </main>
  )
}
