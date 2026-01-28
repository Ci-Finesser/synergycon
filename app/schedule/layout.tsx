import type { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"
import { EVENT_DATES, EVENT_LOCATION, VENUE_SHORT_NAMES } from "@/lib/constants"

const venueList = VENUE_SHORT_NAMES.join(", ")

export const metadata: Metadata = generatePageMetadata({
  title: "Schedule - 3 Days of Innovation",
  description: `View the complete SynergyCon 2026 schedule. Keynotes, panels, workshops, and networking events across ${venueList} in ${EVENT_LOCATION.city} from ${EVENT_DATES.displayRange}.`,
  path: "/schedule",
})

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
