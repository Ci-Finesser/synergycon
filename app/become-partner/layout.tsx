import type { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"

export const metadata: Metadata = generatePageMetadata({
  title: "Become a Partner - Sponsor SynergyCon 2026",
  description: "Partner with SynergyCon 2026 and connect your brand with Nigeria's creative economy leaders. Explore sponsorship packages from Silver to Diamond tier.",
  path: "/become-partner",
})

export default function BecomePartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
