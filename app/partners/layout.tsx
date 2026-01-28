import type { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"

export const metadata: Metadata = generatePageMetadata({
  title: "Partners & Sponsors",
  description: "Meet SynergyCon 2026's sponsors and partners. Leading organizations supporting Nigeria's creative economy and innovation ecosystem.",
  path: "/partners",
})

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
