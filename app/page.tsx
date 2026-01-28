import type { Metadata } from "next"
import Hero from "@/components/hero-new"
import { Navigation } from "@/components/navigation"
import { ImpactStatsSection } from "@/components/impact-stats-section"
import { ThreeDayEventSection } from "@/components/three-day-event-section"
import { OverviewSection } from "@/components/overview-section"
import { WhatToExpect } from "@/components/what-to-expect"
import { SpeakersSection } from "@/components/speakers-section"
import { SpecialGuestSection } from "@/components/special-guest-section"
import { GallerySection } from "@/components/gallery-section"
import { SponsorsSection } from "@/components/sponsors-section"
import { MediaPartnersSection } from "@/components/media-partners-section"
import { Footer } from "@/components/footer"
import { RegistrationModal } from "@/components/registration-modal"
import { CtaSection } from "@/components/cta-section"
import { MaintenancePage } from "@/components/maintenance-page"
import {
  LazyTestimonialsSection,
  LazyScheduleSection,
  LazyLocationSection,
  LazyFaqSection,
} from "@/components/lazy-sections"
import { 
  siteConfig, 
  generateWebPageJsonLd,
  JsonLdScript 
} from "@/lib/seo"

// Enhanced home page metadata
export const metadata: Metadata = {
  title: `${siteConfig.name} - ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: {
    canonical: siteConfig.url,
  },
}

// Set to true to show maintenance page, false to show full site
const MAINTENANCE_MODE = true
// Preview key - append ?preview=synergy2026 to URL to bypass maintenance
const PREVIEW_KEY = "synergy2026"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const isPreview = params?.preview === PREVIEW_KEY
  
  const homePageJsonLd = generateWebPageJsonLd({
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: "/",
    datePublished: "2025-10-01",
    dateModified: new Date().toISOString().split("T")[0],
  })
  
  // Show maintenance unless preview key is provided
  if (MAINTENANCE_MODE && !isPreview) {
    return <MaintenancePage />
  }

  return (
    <main className="min-h-screen bg-[#F4F4F0]">
      <JsonLdScript data={homePageJsonLd} />
      <Navigation />
      <Hero />
      <div style={{ borderBottom: "0.5px solid #e5e7eb" }}>
        <OverviewSection />
      </div>
      <div style={{ borderBottom: "0.5px solid #e5e7eb" }}>
        <ImpactStatsSection />
      </div>
      <div style={{ borderBottom: "0.5px solid #e5e7eb" }}>
        <ThreeDayEventSection />
      </div>
      <div style={{ borderBottom: "0.5px solid #e5e7eb" }}>
        <WhatToExpect />
      </div>
      <div style={{ borderBottom: "0.5px solid #e5e7eb" }}>
        <SpeakersSection />
      </div>
      <div style={{ borderBottom: "0.5px solid #e5e7eb" }}>
        <SpecialGuestSection />
      </div>
      <div style={{ borderBottom: "0.5px solid #e5e7eb" }}>
        <SponsorsSection />
      </div>
      <div style={{ borderBottom: "0.5px solid #e5e7eb" }}>
        <MediaPartnersSection />
      </div>
      <div style={{ borderBottom: "0.5px solid #e5e7eb" }}>
        <GallerySection />
      </div>
      <div style={{ borderBottom: "0.5px solid #e5e7eb" }}>
        <LazyTestimonialsSection />
      </div>
      <div style={{ borderBottom: "0.5px solid #e5e7eb" }}>
        <CtaSection />
      </div>
      <div style={{ borderBottom: "0.5px solid #e5e7eb" }}>
        <LazyScheduleSection />
      </div>
      <div style={{ borderBottom: "0.5px solid #e5e7eb" }}>
        <LazyLocationSection />
      </div>
      <LazyFaqSection />
      <Footer />
      <RegistrationModal />
    </main>
  )
}
