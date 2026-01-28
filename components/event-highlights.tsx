import { Lightbulb, Users, Presentation, Trophy, MessageSquare, Sparkles } from "lucide-react"

const highlights = [
  {
    icon: Sparkles,
    title: "Creative Showcase",
    description:
      "Experience groundbreaking work from Nigeria's most innovative creatives and discover emerging talent.",
    color: "#EF4444", // red
  },
  {
    icon: Lightbulb,
    title: "Workshops",
    description: "Hands-on learning sessions led by industry experts covering cutting-edge tools and techniques.",
    color: "#F97316", // orange
  },
  {
    icon: Users,
    title: "Networking",
    description:
      "Connect with fellow professionals, potential collaborators, and industry leaders in intimate settings.",
    color: "#EAB308", // yellow
  },
  {
    icon: Presentation,
    title: "High Value Learning",
    description: "Keynote presentations and masterclasses from thought leaders shaping the Creative Economy.",
    color: "#10B981", // green
  },
  {
    icon: MessageSquare,
    title: "Panel Discussions",
    description: "Engage in thought-provoking conversations on the future of creativity, technology, and innovation.",
    color: "#3B82F6", // blue
  },
  {
    icon: Trophy,
    title: "Startup Pitch",
    description:
      "Watch promising startups compete for funding and showcase their innovative solutions to real problems.",
    color: "#A855F7", // purple
  },
]

export function EventHighlights() {
  return (
    <section id="highlights" className="py-16 md:py-20 px-4 md:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-10 lg:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4 text-balance">
            What to Expect
          </h2>
          <p className="text-sm md:text-base text-muted-foreground text-pretty">
            A full day of innovation, learning, and connection designed to propel Nigeria's Creative Economy forward.
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon
            return (
              <div
                key={index}
                className="group relative bg-white border-[1.5px] border-foreground rounded-2xl p-4 md:p-5 lg:p-6 hover:shadow-lg transition-all duration-300"
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center mb-3 md:mb-4 lg:mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${highlight.color}15` }}
                >
                  <Icon className="w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6" style={{ color: highlight.color }} />
                </div>

                {/* Content */}
                <h3 className="text-base md:text-lg lg:text-xl font-bold mb-2">{highlight.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{highlight.description}</p>

                {/* Decorative element on hover */}
                <div
                  className="absolute -bottom-2 -right-2 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"
                  style={{ backgroundColor: highlight.color }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
