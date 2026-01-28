import type { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"

export const metadata: Metadata = generatePageMetadata({
  title: "Speakers - Meet Our Industry Leaders",
  description: "Discover the world-class speakers at SynergyCon 2026. Industry leaders, innovators, and thought leaders from Nigeria's creative economy and beyond.",
  path: "/speakers",
})

export default function SpeakersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
