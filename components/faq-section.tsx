"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { EVENT_NAME, EVENT_DATES, DISTRICTS, VENUE_SHORT_NAMES } from "@/lib/constants"

const venueList = VENUE_SHORT_NAMES.join(", ")

const faqs = [
  {
    question: `What is ${EVENT_NAME}?`,
    answer:
      `${EVENT_NAME} is Nigeria's flagship annual conference bringing together creative professionals, industry leaders, policymakers, and investors to shape the future of Nigeria's Creative Economy.`,
  },
  {
    question: "When and where is the event taking place?",
    answer:
      `${EVENT_NAME} will take place from ${EVENT_DATES.displayRange}, across four districts in Lagos: ${DISTRICTS.artsSculptureDesign.shortName} at ${DISTRICTS.artsSculptureDesign.venue.shortName}, ${DISTRICTS.musicFashionFilmPhotography.shortName} at ${DISTRICTS.musicFashionFilmPhotography.venue.shortName}, ${DISTRICTS.techGamingMusic.shortName} at ${DISTRICTS.techGamingMusic.venue.shortName}, and the ${DISTRICTS.mainConference.shortName} at ${DISTRICTS.mainConference.venue.shortName}.`,
  },
  {
    question: "Who should attend SynergyCon?",
    answer:
      "The conference is designed for creative professionals, entrepreneurs, industry leaders, policymakers, investors, students, and anyone interested in Nigeria's Creative Economy.",
  },
  {
    question: "How do I register for the event?",
    answer:
      'You can register by clicking the "Register Now" or "Secure Your Spot" button anywhere on the website. Fill out the registration form with your details to secure your spot.',
  },
  {
    question: "Is there a registration fee?",
    answer:
      "Yes, we offer three ticket options: Day Pass (₦5,000) for single day access, Full 3-Day Festival Pass (₦12,000) for complete access to all three days and locations, and VIP/Backstage Access (₦50,000) for an exclusive premium experience with special perks.",
  },
  {
    question: "Can I become a speaker at SynergyCon?",
    answer:
      'Yes! We welcome speaker applications. Click on "Become a Speaker" in the footer or visit our speaker application page to submit your proposal.',
  },
  {
    question: "How can my organization partner with SynergyCon?",
    answer:
      'We offer various partnership tiers including Title, Platinum, Gold, and Silver sponsorships. Visit our Partners page or click "Partner with Us" to learn more about partnership opportunities.',
  },
  {
    question: "Will there be networking opportunities?",
    answer:
      "SynergyCon features dedicated networking sessions, exhibition spaces, and informal meetup opportunities throughout the day to connect with fellow attendees, speakers, and partners.",
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-16 md:py-20 px-4 md:px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4 md:mb-5 text-balance">
            Frequently Asked Questions
          </h2>
          <p className="text-sm md:text-base text-muted-foreground text-pretty">
            Find answers to common questions about SynergyCon 2.0
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-background border border-border rounded-2xl overflow-hidden">
              <button
                className="w-full px-5 py-4 md:px-6 md:py-5 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-sm md:text-base pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 transition-transform ${
                    openIndex === index ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-5 pb-4 md:px-6 md:pb-5 pt-0">
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
