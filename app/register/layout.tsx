import type { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import { EVENT_DATES, EVENT_LOCATION } from "@/lib/constants"

export const metadata: Metadata = generatePageMetadata({
  title: "Register for SynergyCon 2026",
  description: `Secure your spot at Nigeria's premier Creative Economy conference. Choose from Early Bird, Regular, VIP, or Student passes. ${EVENT_DATES.displayRange} in ${EVENT_LOCATION.displayLocation}.`,
  path: "/register",
})

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
