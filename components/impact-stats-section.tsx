import { Users, Network, MapPin, Zap } from "lucide-react"

export function ImpactStatsSection() {
  const stats = [
    {
      value: "5,000+",
      label: "Expected Attendees",
      icon: Users,
      color: "accent-red",
    },
    {
      value: "100+",
      label: "Sessions & Workshops",
      icon: Zap,
      color: "accent-green",
    },
    {
      value: "4",
      label: "Immersive Districts",
      icon: Network,
      color: "accent-blue",
    },
    {
      value: "1",
      label: "Iconic Venue",
      icon: MapPin,
      color: "accent-purple",
    },
  ]

  return (
    <section className="py-16 md:py-20 px-4 md:px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10 lg:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4 text-balance text-white">
            One Day to Shape the Future
          </h2>
          <p className="text-sm md:text-base text-white/70 text-pretty leading-relaxed">
            March 27, 2026 at National Theatre—where Nigeria&apos;s brightest creative minds converge to forge partnerships, 
            launch ventures, and define the next decade of Nigeria&apos;s creative economy.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="group relative bg-zinc-900 border border-white/10 rounded-2xl p-5 md:p-6 hover:bg-zinc-800 hover:border-white/20 transition-all duration-300"
              >
                {/* Icon */}
                <div
                  className={`inline-flex w-10 h-10 md:w-12 md:h-12 rounded-xl items-center justify-center mb-3 md:mb-4 bg-${stat.color}/10 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 text-${stat.color}`} />
                </div>

                {/* Value */}
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-1.5 md:mb-2 text-white">
                  {stat.value}
                </div>

                {/* Label */}
                <div className="text-xs md:text-sm text-white/70 font-medium">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
