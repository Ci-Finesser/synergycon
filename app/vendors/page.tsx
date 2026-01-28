"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, Grid3x3, List, Store, ArrowRight, Info } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { BioModal } from "@/components/bio-modal"
import { PartnerCard } from "@/components/partner-card"
import { VENDOR_TIERS } from "@/lib/partnership-tiers"
import type { Partner } from "@/types/components"

export const dynamic = "force-dynamic"

export default function VendorsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [vendors, setVendors] = useState<Partner[]>([])
  const [selectedVendor, setSelectedVendor] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    const { data } = await supabase
      .from("sponsors")
      .select("*")
      .eq("category", "Vendors")
      .order("display_order")
    if (data) setVendors(data)
    setLoading(false)
  }

  const openVendorModal = (vendor: Partner) => {
    setSelectedVendor(vendor)
  }

  const renderEmptyState = () => (
    <div className="bg-neutral-50 border-2 border-neutral-200 rounded-xl p-5 md:p-6">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-accent-blue flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm md:text-base font-semibold mb-2.5 md:mb-3">No Vendors Yet</h3>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4">
            We're currently accepting vendor applications. Interested in showcasing your products or services?
          </p>
          <Link href="/become-partner?type=vendor">
            <Button className="group rounded-md text-sm h-auto py-2 px-4">
              Apply as Vendor
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )

  const renderVendorCards = () => (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
          : "flex flex-col gap-3 md:gap-4"
      }
    >
      {vendors.map((vendor) => (
        <PartnerCard key={vendor.id} partner={vendor} viewMode={viewMode} onClick={openVendorModal} />
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
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-5 md:mb-6">
            <div className="max-w-3xl">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2.5 md:mb-3 text-balance">
                Vendors
              </h1>
              <p className="text-sm md:text-base text-muted-foreground text-pretty leading-relaxed">
                Discover the vendors bringing products, services, and experiences to SynergyCon 2.0.
              </p>
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
        </div>
      </section>

      <section className="pb-8 md:pb-10 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : vendors.length > 0 ? (
            renderVendorCards()
          ) : (
            renderEmptyState()
          )}
        </div>
      </section>

      <section className="pb-12 md:pb-16 lg:pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-foreground text-background rounded-2xl md:rounded-3xl p-8 md:p-12 lg:p-16">
            <div className="text-center mb-10 md:mb-12 lg:mb-14">
              <Store className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 md:mb-5" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-balance">
                Become a Vendor at SynergyCon 2.0
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-background/80 max-w-3xl mx-auto text-pretty leading-relaxed">
                Showcase your products and services to thousands of creative professionals, entrepreneurs, and industry leaders.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 max-w-5xl mx-auto mb-8 md:mb-10">
              {VENDOR_TIERS.map((tier, index) => {
                const isPopular = tier.popular
                const tierValue = tier.name.toLowerCase().replace(" vendor", "")

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

                    <Link href={`/become-partner?type=vendor&tier=${tierValue}`} className="w-full">
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
              <Link href="/become-partner?type=vendor">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-auto px-6 md:px-8 py-3 md:py-4 text-sm md:text-base rounded-xl border border-background text-background hover:bg-background hover:text-foreground bg-transparent"
                >
                  Apply as Vendor
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {selectedVendor && (
        <BioModal
          name={selectedVendor.name}
          bio={selectedVendor.bio || "No bio available"}
          image={selectedVendor.logo_url}
          website={selectedVendor.website}
          isOpen={!!selectedVendor}
          onClose={() => setSelectedVendor(null)}
        />
      )}
    </main>
  )
}
