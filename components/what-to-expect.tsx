import { Lightbulb, Users, Rocket, Network } from "lucide-react"

const expectations = [
  {
    icon: Lightbulb,
    title: "Keynote Presentations",
    description:
      "Be inspired by trailblazers who've redefined industries—from Grammy-winning producers to billion-naira founders sharing the secrets behind Nigeria's creative renaissance.",
    iconBg: "bg-orange-500/10 group-hover:bg-orange-500/20",
    iconColor: "text-orange-500",
  },
  {
    icon: Users,
    title: "Panel Discussions",
    description: "Dive deep into debates shaping Nigeria's future—from AI in Nollywood to fashion sustainability and the gaming revolution transforming youth employment.",
    iconBg: "bg-blue-500/10 group-hover:bg-blue-500/20",
    iconColor: "text-blue-500",
  },
  {
    icon: Rocket,
    title: "Masterclasses",
    description:
      "Roll up your sleeves in intimate sessions—learn music production from chart-toppers, master digital art techniques, or build your first game prototype with industry mentors.",
    iconBg: "bg-green-500/10 group-hover:bg-green-500/20",
    iconColor: "text-green-500",
  },
  {
    icon: Network,
    title: "Networking Lounges",
    description: "Forge career-defining connections in curated spaces—from casual coffee chats to structured speed-networking sessions with investors actively seeking the next big thing.",
    iconBg: "bg-purple-500/10 group-hover:bg-purple-500/20",
    iconColor: "text-purple-500",
  },
  {
    icon: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    title: "Exhibition Spaces",
    description:
      "Showcase your work, discover innovative solutions, and explore partnerships in our curated exhibition hall.",
    iconBg: "bg-pink-500/10 group-hover:bg-pink-500/20",
    iconColor: "text-pink-500",
  },
  {
    icon: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Investment Opportunities",
    description: "Meet investors actively seeking innovative projects and talented teams to support and scale.",
    iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
    iconColor: "text-emerald-500",
  },
  {
    icon: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    title: "Deal Rooms",
    description: "Private, curated sessions connecting founders with investors, partners, and collaborators for high-impact negotiations.",
    iconBg: "bg-amber-500/10 group-hover:bg-amber-500/20",
    iconColor: "text-amber-500",
  },
]

export function WhatToExpect() {
  return (
    <section className="py-16 md:py-20 px-4 md:px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 md:mb-8 lg:mb-10">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2.5 md:mb-3">One Day. Limitless Experiences.</h2>
          <p className="text-xs md:text-sm text-muted-foreground max-w-3xl mx-auto">
            SynergyCon 2.0 packs an entire festival&apos;s worth of transformative experiences into one unforgettable day at Nigeria&apos;s most iconic cultural landmark.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {expectations.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className="bg-background rounded-xl p-4 md:p-5 border-[1.5px] border-foreground group hover:shadow-lg transition-all"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${item.iconBg} flex items-center justify-center mb-3 transition-colors`}
                >
                  <Icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <h3 className="text-sm md:text-base font-bold mb-2">{item.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
