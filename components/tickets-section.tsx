"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"
import { TICKET_TYPES, EVENT_NAME } from "@/lib/constants"

// Map ticket types to display configuration
const tickets = [
  {
    key: "vip",
    name: TICKET_TYPES.vip.name,
    price: TICKET_TYPES.vip.priceDisplay,
    priceNote: "per day",
    isPopular: false,
    features: TICKET_TYPES.vip.features,
    badgeColor: "bg-red-500",
    cta: "Get VIP Day Pass",
    variant: "vip" as const,
  },
  {
    key: "vip-plus",
    name: TICKET_TYPES["vip-plus"].name,
    price: TICKET_TYPES["vip-plus"].priceDisplay,
    priceNote: "per day",
    isPopular: TICKET_TYPES["vip-plus"].popular ?? false,
    features: TICKET_TYPES["vip-plus"].features,
    badgeColor: "bg-blue-500",
    cta: "Get VIP+ Day Pass",
    variant: "vip-plus" as const,
  },
  {
    key: "vvip",
    name: TICKET_TYPES.vvip.name,
    price: TICKET_TYPES.vvip.priceDisplay,
    isPopular: false,
    features: TICKET_TYPES.vvip.features,
    badgeColor: "bg-green-500",
    cta: "Get Full Festival Pass",
    variant: "vvip" as const,
  },
  {
    key: "priority-pass",
    name: TICKET_TYPES["priority-pass"].name,
    price: TICKET_TYPES["priority-pass"].priceDisplay,
    isPopular: false,
    features: TICKET_TYPES["priority-pass"].features.slice(0, 4),
    badgeColor: "bg-amber-500",
    cta: "Get Priority Pass",
    variant: "priority" as const,
  },
]

export function TicketsSection() {
  return (
    <section className="relative py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Invest in One Transformative Day</h2>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
            March 27 at National Theatre—four immersive tracks, world-class speakers, and connections that could change your career. Choose the access level that fits your ambitions.
          </p>
        </div>

        {/* Ticket Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {tickets.map((ticket) => {
            const isPriority = ticket.variant === "priority"
            const colorMap = {
              vip: { border: "border-red-500/30", hover: "hover:bg-red-500/5", text: "text-red-400", check: "text-red-400" },
              "vip-plus": { border: "border-blue-500/30", hover: "hover:bg-blue-500/5", text: "text-blue-400", check: "text-blue-400" },
              vvip: { border: "border-green-500/30", hover: "hover:bg-green-500/5", text: "text-green-400", check: "text-green-400" },
              priority: { border: "border-amber-500/30", hover: "hover:bg-amber-500/5", text: "text-amber-400", check: "text-amber-400" },
            }
            const colors = colorMap[ticket.variant]
            
            return (
              <div
                key={ticket.key}
                className="relative group"
              >
                {/* Popular Badge */}
                {ticket.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase">
                      Popular
                    </div>
                  </div>
                )}

                {/* Card */}
                <div
                  className={`relative h-full rounded-2xl border ${colors.border} bg-gradient-to-br from-gray-900 to-black p-5 md:p-6 transition-all duration-300 hover:scale-[1.02] ${colors.hover}`}
                >
                  {/* Badge Color Indicator */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-3 h-3 rounded-full ${ticket.badgeColor}`} />
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      {ticket.variant === "vip" || ticket.variant === "vip-plus" ? "Day Access" : "Full Access"}
                    </span>
                  </div>

                  {/* Ticket Name */}
                  <h3 className={`text-lg md:text-xl font-bold mb-2 ${colors.text}`}>
                    {ticket.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      {ticket.price}
                    </div>
                  {ticket.priceNote && (
                    <div className="text-sm text-gray-400">
                      {ticket.priceNote}
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {ticket.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${colors.check}`} />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link href="/register" className="block mt-auto">
                  <Button
                    className="w-full bg-white text-black hover:bg-gray-100"
                    size="default"
                  >
                    {ticket.cta}
                  </Button>
                </Link>
              </div>
            </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-sm md:text-base text-muted-foreground mb-4">Need a custom package or have questions?</p>
          <Link href="/register">
            <Button variant="outline" size="lg">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
