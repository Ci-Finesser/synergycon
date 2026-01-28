"use client"

import dynamic from "next/dynamic"

const LoadingSpinner = () => (
  <div className="py-16 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
  </div>
)

export const LazyTestimonialsSection = dynamic(
  () => import("@/components/testimonials-section").then((mod) => ({ default: mod.TestimonialsSection })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  },
)

export const LazyScheduleSection = dynamic(
  () => import("@/components/schedule-section").then((mod) => ({ default: mod.ScheduleSection })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  },
)

export const LazyLocationSection = dynamic(
  () => import("@/components/location-section").then((mod) => ({ default: mod.LocationSection })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  },
)

export const LazyFaqSection = dynamic(
  () => import("@/components/faq-section").then((mod) => ({ default: mod.FaqSection })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  },
)
