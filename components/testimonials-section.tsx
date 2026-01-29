"use client"

import { useRef, useState } from "react"
import { Quote } from "lucide-react"

const testimonials = [
  {
    quote:
      "As a gender development advocate, I am indeed inclined to support this initiative as it ceases to promote parody in the Nigerian creative space, proffering support for female practitioners and conscious of their protection against all forms of violence.",
    author: "Her Excellency, Ambassador Prof. Olufolake Abdulrazaq",
    title: "First Lady of Kwara State & Founder Ajike People Support Centre",
    color: "#EF4444",
  },
  {
    quote:
      "I'm always happy to hear creative pitches. Whenever I can, I offer advice, and I've spent time with many creatives. It's an area we want to invest more in because it has already been quite profitable for us.",
    author: "Mr Iyinoluwa Aboyeji (OON)",
    title: "Co-Founder, Andela Managing Partner, Accelerate Nigeria Former MD & Co-Founder, Flutterwave",
    color: "#F97316",
  },
  {
    quote:
      "Strong intellectual property protection will encourage Nigerian startups to scale globally without fear of idea theft.",
    author: "Hon. Mobolaji Ogunlende",
    title: "Lagos State Commissioner for Youth and Social Development",
    color: "#10B981",
  },
  {
    quote:
      "If we are to achieve sustainable economic growth, we must strengthen the protection of intellectual property and ensure that entrepreneurs thrive in a fair and equitable environment.",
    author: "Ms. Chalya Shagaya",
    title: "Senior Special Assistant to the President on Entrepreneurship Development (CIDE)",
    color: "#3B82F6",
  },
  {
    quote:
      "The networking opportunities alone made this worth attending. I've connected with potential collaborators, investors, and mentors who are already helping my business grow.",
    author: "Adaeze Nwosu",
    title: "Fashion Designer & Entrepreneur",
    color: "#A855F7",
  },
  {
    quote:
      "SynergyCon exceeded my expectations. The workshops were practical, the speakers were inspiring, and the whole experience felt perfectly curated for creative professionals.",
    author: "Kunle Adeyemi",
    title: "Creative Director",
    color: "#EAB308",
  },
  {
    quote:
      "This conference brings together the brightest minds in our creative and tech sectors. The conversations here today will shape policy and drive real change.",
    author: "Tobi Bello",
    title: "Tech Influencer",
    color: "#EC4899",
  },
]

export function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  return (
    <section id="testimonials" className="py-16 md:py-20 px-4 md:px-6 bg-muted/30 overflow-hidden">
      <div className="max-w-7xl mx-auto mb-12 md:mb-14 lg:mb-16">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4 md:mb-5 text-balance">
            What People Say
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-pretty">
            Hear from thought leaders and attendees who experienced SynergyCon 1.0.
          </p>
        </div>
      </div>

      <div className="relative -mx-4 md:-mx-6">
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide items-start px-4 md:px-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[90vw] sm:w-[450px] bg-background border border-foreground rounded-2xl p-5 md:p-6 lg:p-8"
            >
              <Quote
                className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mb-4 md:mb-5 opacity-20"
                style={{ color: testimonial.color }}
              />

              <blockquote className="text-sm md:text-base leading-relaxed mb-5 md:mb-6 text-pretty">
                "{testimonial.quote}"
              </blockquote>

              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 md:w-12 md:h-12 aspect-square rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0"
                  style={{ backgroundColor: testimonial.color }}
                >
                  {testimonial.author
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="font-bold text-sm md:text-base">{testimonial.author}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">{testimonial.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
