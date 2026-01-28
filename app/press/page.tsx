import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { 
  generatePageMetadata, 
  generateWebPageJsonLd, 
  generateBreadcrumbJsonLd,
  JsonLdScript,
  siteConfig 
} from "@/lib/seo"

export const metadata: Metadata = generatePageMetadata({
  title: "Press & Media",
  description: "Media resources, press releases, and partnership information for SynergyCon 2026. Access brand assets, media kit, and contact our press team.",
  path: "/press",
})

const mediaPartners = [
  {
    name: "TechCabal",
    logo: "/techcabal-logo.jpg",
    description: "Africa's leading technology and business news platform covering innovation across the continent.",
  },
  {
    name: "Channels Television",
    logo: "/channels-tv-logo.jpg",
    description: "Nigeria's premier independent news and media services broadcaster.",
  },
  {
    name: "The Guardian Nigeria",
    logo: "/guardian-nigeria-logo.jpg",
    description: "Leading Nigerian newspaper covering business, technology, and creative economy news.",
  },
  {
    name: "Techpoint Africa",
    logo: "/techpoint-africa-logo.jpg",
    description: "Pan-African technology media platform covering startups and innovation.",
  },
  {
    name: "Pulse Nigeria",
    logo: "/pulse-nigeria-logo.jpg",
    description: "Leading digital media company focusing on entertainment, lifestyle, and technology.",
  },
  {
    name: "Ventures Africa",
    logo: "/ventures-africa-logo.jpg",
    description: "Business and lifestyle magazine covering Africa's growth and innovation.",
  },
]

export default function PressPage() {
  const pageJsonLd = generateWebPageJsonLd({
    title: "Press & Media",
    description: "Media resources and press information for SynergyCon 2026.",
    url: "/press",
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Press", url: "/press" },
    ],
  })

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: siteConfig.url },
    { name: "Press", url: `${siteConfig.url}/press` },
  ])

  return (
    <main className="min-h-screen">
      <JsonLdScript data={[pageJsonLd, breadcrumbJsonLd]} />
      {/* Header */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="group mb-8 -ml-2 rounded-xl">
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>

          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              Media & Press
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-pretty">
              Meet the media partners amplifying SynergyCon's mission to transform Nigeria's Creative Economy.
            </p>
          </div>
        </div>
      </section>

      {/* Media Partners Grid */}
      <section className="pb-20 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-12">Media Partners</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mediaPartners.map((partner, index) => (
              <div
                key={index}
                className="bg-background border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-center h-20 mb-6">
                  <img
                    src={partner.logo || "/placeholder.svg"}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold mb-3">{partner.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{partner.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Press Inquiries CTA */}
      <section className="py-20 md:py-32 px-6 bg-muted">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Press Inquiries</h2>
          <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-10">
            For press releases, media kits, or interview requests, please contact our media team
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:press@synergycon.live">
              <Button size="lg" className="rounded-xl w-full sm:w-auto">
                Contact Press Team
              </Button>
            </a>
            <Link href="/#contact">
              <Button size="lg" variant="outline" className="rounded-xl w-full sm:w-auto bg-transparent">
                Media Kit
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
