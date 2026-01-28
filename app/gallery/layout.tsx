import type { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"

export const metadata: Metadata = generatePageMetadata({
  title: "Gallery - Event Photos & Videos",
  description: "Explore photos and videos from SynergyCon events. Relive the moments, networking, and inspiration from Nigeria's premier creative economy conference.",
  path: "/gallery",
})

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
