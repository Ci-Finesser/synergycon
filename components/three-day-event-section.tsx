import Link from "next/link"
import { Calendar, MapPin, ArrowRight, Users, Ticket } from "lucide-react"

export function ThreeDayEventSection() {
  const events = [
    {
      day: "District 1",
      title: "Arts, Sculpture & Design",
      description:
        "A celebration of visual storytelling, from traditional sculpture to digital art, NFTs, and immersive design.",
      color: "accent-red",
      dayNumber: 1,
    },
    {
      day: "District 2",
      title: "Fashion, Film & Photography",
      description:
        "Exploring the narrative power of the lens and the loom, from sustainable fashion to cinematic excellence.",
      color: "accent-green",
      dayNumber: 2,
    },
    {
      day: "District 3",
      title: "Tech, Gaming & Music",
      description: "The fusion of sound, code, and play. Discover the future of digital entertainment and innovation.",
      color: "accent-blue",
      dayNumber: 3,
    },
    {
      day: "District 4",
      title: "Main Conference",
      description: "Conference, presentations, panel discussions, exhibitions, masterclasses, networking, and the festival finale.",
      color: "accent-purple",
      dayNumber: 4,
    },
  ]

  return (
    <section id="three-day-event" className="py-16 md:py-20 px-4 md:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-10 lg:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4 text-balance">
            Four Districts, Endless Possibilities
          </h2>
          <p className="text-sm md:text-base text-muted-foreground text-pretty leading-relaxed">
            Experience the breadth of Nigeria's creative and technological innovation across four unique districts,
            each celebrating a different facet of our thriving ecosystem.
          </p>
        </div>

        <div className="md:hidden overflow-x-auto pb-4 -mx-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex gap-4 px-4">
            {events.map((event, index) => (
              <div
                key={index}
                className="group bg-background border-[1.5px] border-foreground rounded-2xl p-4 hover:shadow-xl transition-all duration-300 flex flex-col min-w-[85vw] max-w-[85vw] flex-shrink-0"
              >
                {/* Day Badge */}
                <div
                  className={`inline-flex self-start px-3 py-1.5 rounded-lg text-xs font-bold mb-3 ${
                    event.color === "accent-red"
                      ? "bg-accent-red/10 text-accent-red"
                      : event.color === "accent-green"
                        ? "bg-accent-green/10 text-accent-green"
                        : event.color === "accent-purple"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-accent-blue/10 text-accent-blue"
                  }`}
                >
                  {event.day}
                </div>

                {/* Title */}
                <h3 className="text-base font-bold mb-2 text-balance">{event.title}</h3>

                {/* Description */}
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed text-pretty flex-grow">
                  {event.description}
                </p>

                <div className="flex items-start gap-3 mb-4 pb-4 border-b border-neutral-200">
                  {/* Date & Time */}
                  <div className="flex items-start gap-1.5 flex-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0 mt-0.5" />
                    <div className="text-[11px]">
                      <div className="font-semibold leading-tight mb-0.5">Date TBA</div>
                      <div className="text-neutral-500 leading-tight">Time TBA</div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-1.5 flex-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0 mt-0.5" />
                    <div className="text-[11px]">
                      <div className="font-semibold leading-tight mb-0.5">Venue TBA</div>
                      <div className="text-neutral-500 leading-tight line-clamp-1">Lagos, Nigeria</div>
                    </div>
                  </div>
                </div>

                {/* Action Links */}
                <div className="space-y-2">
                  <Link
                    href={`/schedule?day=${event.dayNumber}`}
                    className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium border border-foreground rounded-md hover:bg-foreground hover:text-background transition-colors duration-200"
                  >
                    <span>View Schedule</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/speakers?day=${event.dayNumber}`}
                    className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium border border-foreground rounded-md hover:bg-foreground hover:text-background transition-colors duration-200"
                  >
                    <span>Speakers for {event.day}</span>
                    <Users className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors duration-200"
                  >
                    <span>Get Pass</span>
                    <Ticket className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-5 lg:gap-6">
          {events.map((event, index) => (
            <div
              key={index}
              className="group bg-background border-[1.5px] border-foreground rounded-2xl p-5 md:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Day Badge */}
              <div
                className={`inline-flex self-start px-3 py-1.5 rounded-lg text-xs font-bold mb-4 ${
                  event.color === "accent-red"
                    ? "bg-accent-red/10 text-accent-red"
                    : event.color === "accent-green"
                      ? "bg-accent-green/10 text-accent-green"
                      : event.color === "accent-purple"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-accent-blue/10 text-accent-blue"
                }`}
              >
                {event.day}
              </div>

              {/* Title */}
              <h3 className="text-lg md:text-xl font-bold mb-2 text-balance">{event.title}</h3>

              {/* Description */}
              <p className="text-xs md:text-sm text-muted-foreground mb-4 leading-relaxed text-pretty flex-grow">
                {event.description}
              </p>

              {/* Location */}
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold">Venue TBA</div>
                  <div className="text-neutral-500">Lagos, Nigeria</div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-2 mb-5 pb-5 border-b border-neutral-200">
                <Calendar className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold">Date TBA</div>
                  <div className="text-neutral-500">Time TBA</div>
                </div>
              </div>

              {/* Action Links */}
              <div className="space-y-2">
                <Link
                  href={`/schedule?day=${event.dayNumber}`}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium border border-foreground rounded-md hover:bg-foreground hover:text-background transition-colors duration-200"
                >
                  <span>View Schedule</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={`/speakers?day=${event.dayNumber}`}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium border border-foreground rounded-md hover:bg-foreground hover:text-background transition-colors duration-200"
                >
                  <span>Speakers for {event.day}</span>
                  <Users className="w-4 h-4" />
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors duration-200"
                >
                  <span>Get Pass</span>
                  <Ticket className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
