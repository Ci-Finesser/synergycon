import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Target, Eye } from "lucide-react"
import Link from "next/link"
import { WhatToExpect } from "@/components/what-to-expect"
import { 
  generatePageMetadata, 
  generateWebPageJsonLd, 
  generateBreadcrumbJsonLd,
  JsonLdScript,
  siteConfig 
} from "@/lib/seo"

export const metadata: Metadata = generatePageMetadata({
  title: "About SynergyCon",
  description: "Learn about SynergyCon, Nigeria's premier Creative Economy conference. Discover our mission to connect creatives, innovators, and industry leaders across Africa.",
  path: "/about",
})

export default function AboutPage() {
  const pageJsonLd = generateWebPageJsonLd({
    title: "About SynergyCon",
    description: "Learn about SynergyCon, Nigeria's premier Creative Economy conference.",
    url: "/about",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "About", url: "/about" },
    ],
  })

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: siteConfig.url },
    { name: "About", url: `${siteConfig.url}/about` },
  ])

  return (
    <main className="min-h-screen">
      <JsonLdScript data={[pageJsonLd, breadcrumbJsonLd]} />
      
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-foreground">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5">
          <Link href="/#about">
            <Button variant="ghost" size="sm" className="group -ml-2 rounded-md">
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      <section className="relative py-10 md:py-14 lg:py-20 px-4 md:px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-foreground/5 rounded-full mb-4 md:mb-6 border border-foreground/10">
              <p className="text-xs md:text-sm font-medium text-foreground">Building on SynergyCon 1.0's Success</p>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4 text-balance">
              About SynergyCon
            </h1>
            <p className="text-sm md:text-base text-muted-foreground text-pretty leading-relaxed max-w-2xl mx-auto">
              Creating a new nexus for Nigerian innovation where creativity meets opportunity, connecting visionaries,
              builders, and investors to shape the future of Africa's Creative Economy.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-8 md:pb-10 lg:pb-14 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4 md:gap-5">
            <div className="bg-muted/30 rounded-xl md:rounded-2xl p-5 md:p-6 lg:p-8 border-[1.5px] border-foreground hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-background" />
              </div>
              <h2 className="text-lg md:text-xl font-bold mb-3">Our Vision</h2>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                To position Nigeria as Africa's leading hub for creative innovation, where talent, technology, and
                opportunity converge to drive economic growth and cultural impact.
              </p>
            </div>

            <div className="bg-muted/30 rounded-xl md:rounded-2xl p-5 md:p-6 lg:p-8 border-[1.5px] border-foreground hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-background" />
              </div>
              <h2 className="text-lg md:text-xl font-bold mb-3">Our Mission</h2>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                To create a platform that empowers Nigerian creatives through knowledge sharing, strategic partnerships,
                policy advocacy, and access to resources that transform ideas into sustainable ventures.
              </p>
            </div>
          </div>
        </div>
      </section>

      <WhatToExpect />

      <section className="py-8 md:py-10 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2.5 md:mb-3">Who Should Attend?</h2>
            <p className="text-xs md:text-sm text-muted-foreground max-w-3xl mx-auto">
              SynergyCon is designed for anyone passionate about Nigeria's Creative Economy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {[
              {
                title: "Creative Professionals",
                description:
                  "Content creators, designers, filmmakers, musicians, and artists looking to scale their craft",
              },
              {
                title: "Entrepreneurs & Founders",
                description: "Startup founders and business owners in the creative and tech sectors",
              },
              {
                title: "Industry Leaders",
                description: "Executives and decision-makers from creative and technology companies",
              },
              {
                title: "Policymakers",
                description: "Government officials and regulators shaping Creative Economy policies",
              },
              {
                title: "Investors & VCs",
                description: "Angel investors, venture capitalists, and financial institutions seeking opportunities",
              },
              {
                title: "Students & Aspiring Creatives",
                description: "Young talents eager to learn, network, and launch their creative careers",
              },
            ].map((attendee, index) => (
              <div
                key={index}
                className="bg-background border-[1.5px] border-foreground rounded-xl p-4 md:p-5 hover:shadow-lg transition-all"
              >
                <h3 className="text-sm md:text-base font-bold mb-2">{attendee.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{attendee.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
