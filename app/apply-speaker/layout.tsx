import type { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"

export const metadata: Metadata = generatePageMetadata({
  title: "Apply to Speak at SynergyCon 2026",
  description: "Share your expertise at Nigeria's premier Creative Economy conference. Submit your speaker application for SynergyCon 2026. We welcome thought leaders, innovators, and industry experts.",
  path: "/apply-speaker",
})

export default function ApplySpeakerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
