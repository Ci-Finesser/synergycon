"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { EVENT_NAME, EVENT_DATES, VENUES } from "@/lib/constants"

const faqs = [
  {
    question: `What is ${EVENT_NAME}?`,
    answer:
      `${EVENT_NAME} is Nigeria's flagship creative economy summit—a single, action-packed day bringing together creators, industry titans, policymakers, and investors to shape the future of Nigeria's creative industries.`,
  },
  {
    question: "When and where is the event taking place?",
    answer:
      `${EVENT_NAME} takes place on ${EVENT_DATES.displayRange} at ${VENUES.nationalTheatre.name} in Lagos. All four creative districts (Arts & Design, Fashion & Film, Tech & Gaming, and the Main Conference) run simultaneously in different zones within the venue.`,
  },
  {
    question: "Who should attend SynergyCon?",
    answer:
      "Whether you're a seasoned creative professional, ambitious entrepreneur, policymaker shaping regulations, investor seeking the next big thing, or a student hungry to learn—SynergyCon is designed for anyone passionate about Nigeria's creative economy.",
  },
  {
    question: "How do I register for the event?",
    answer:
      'Click the "Register Now" or "Secure Your Spot" button anywhere on the website. Complete the form with your details and select your preferred ticket tier to confirm your attendance.',
  },
  {
    question: "What ticket options are available?",
    answer:
      "We offer multiple access tiers: VIP Day Pass (₦5,000) for single-district access, VIP+ (₦10,000) for enhanced access with networking lounges, VVIP (₦100,000) for all-access including backstage and deal rooms, and Priority Pass (₦250,000) for the ultimate premium experience.",
  },
  {
    question: "Can I become a speaker at SynergyCon?",
    answer:
      'Absolutely! We welcome proposals from industry experts and rising voices alike. Click "Apply to Speak" in our navigation or footer to submit your session idea.',
  },
  {
    question: "How can my organization partner with SynergyCon?",
    answer:
      'We offer tailored partnership packages from Title Sponsor to Ecosystem Partner. Visit our Partners page or click "Partner with Us" to explore opportunities and connect with our team.',
  },
  {
    question: "What networking opportunities are available?",
    answer:
      "Beyond the sessions, SynergyCon features dedicated networking lounges, curated deal rooms for investor meetings, exhibition spaces, and informal meetup zones throughout National Theatre—plus our signature after-party.",
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
