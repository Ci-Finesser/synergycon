/**
 * FAQ Data Constants
 * 
 * SynergyCon 2.0 - Single-Day Event (March 26, 2026)
 * Comprehensive FAQs covering event logistics, tickets, and experience
 * 
 * Last synced: 2026-01-29T00:00:00.000Z
 */

export interface FAQData {
  id: string
  question: string
  answer: string
  category: string | null
  display_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export const FAQS_DATA = [
  // General Event Information
  {
    "id": "faq-001",
    "question": "What is SynergyCon 2.0?",
    "answer": "SynergyCon 2.0 is Nigeria's premier Creative Economy conference, bringing together innovators, creators, policymakers, and industry leaders under one roof. Taking place on March 26, 2026 at the iconic National Theatre in Lagos, this single-day immersive experience features four distinct creative districts running simultaneously—Arts & Design, Fashion & Film, Tech & Gaming, and the Main Conference—offering over 100 sessions, exhibitions, masterclasses, and unparalleled networking opportunities.",
    "category": "General",
    "display_order": 1,
    "is_published": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "faq-002",
    "question": "When and where is SynergyCon 2.0 taking place?",
    "answer": "SynergyCon 2.0 takes place on Friday, March 26, 2026 at the Wole Soyinka Centre for Culture and Creative Arts (National Theatre Nigeria), located in Iganmu, Lagos. Doors open at 8:00 AM, with programming running from 9:00 AM to 6:00 PM. The after-party and networking reception continues until 9:00 PM for VVIP and Priority Pass holders.",
    "category": "General",
    "display_order": 2,
    "is_published": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "faq-003",
    "question": "What are the four creative districts?",
    "answer": "SynergyCon 2.0 features four immersive districts running simultaneously at the National Theatre: (1) Arts, Sculpture & Design District - Explore visual arts, sculpture exhibitions, and design innovations; (2) Music, Fashion, Film & Photography District - Experience the latest in creative industries from runway shows to film screenings; (3) Tech, Gaming & Music District - Discover cutting-edge technology, gaming showcases, and music production; (4) Main Conference District - Join keynotes, panel discussions, deal rooms, masterclasses, and high-level networking. Your ticket grants access to all four districts—design your own journey!",
    "category": "General",
    "display_order": 3,
    "is_published": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "faq-004",
    "question": "Who should attend SynergyCon 2.0?",
    "answer": "SynergyCon 2.0 is designed for anyone passionate about Nigeria's creative economy: entrepreneurs and startup founders, artists and designers, musicians and producers, filmmakers and photographers, fashion designers and stylists, tech innovators and gamers, content creators and influencers, investors and venture capitalists, policymakers and government officials, students and emerging talents. Whether you're launching your creative career or scaling an established brand, SynergyCon is your gateway to Nigeria's creative future.",
    "category": "General",
    "display_order": 4,
    "is_published": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },

  // Tickets & Registration
  {
    "id": "faq-005",
    "question": "What ticket options are available?",
    "answer": "We offer four ticket tiers for SynergyCon 2.0: VIP Access (₦25,000) - Full-day access to all districts, sessions, and exhibitions with networking opportunities and certificate of attendance. VIP+ Premium (₦50,000) - Enhanced experience with priority seating, VIP lounge access, complimentary lunch, and premium swag. VVIP Experience (₦100,000) - Backstage access, speaker meet-and-greets, front-row seating, and invitation to post-event dinner. Priority Pass (₦150,000) - All-access privileges, personal concierge, VIP transport, exclusive speaker dinner, and lifetime membership. Early bird discounts of up to 20% are available until February 28, 2026.",
    "category": "Tickets",
    "display_order": 5,
    "is_published": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "faq-006",
    "question": "How do I purchase tickets?",
    "answer": "Tickets can be purchased directly through our website at synergycon.live/register. We accept all major payment methods including cards, bank transfers, and mobile payments via Flutterwave. Group discounts are available for orders of 5+ tickets. Once your payment is confirmed, you'll receive a digital ticket via email with a QR code for check-in on event day.",
    "category": "Tickets",
    "display_order": 6,
    "is_published": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "faq-007",
    "question": "Are tickets refundable?",
    "answer": "Tickets purchased more than 30 days before the event (before February 25, 2026) are eligible for a full refund minus a 10% processing fee. Tickets purchased within 30 days of the event are non-refundable but may be transferred to another attendee. To transfer a ticket, contact us at hello@synergycon.live with the original purchaser's details and the new attendee's information.",
    "category": "Tickets",
    "display_order": 7,
    "is_published": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "faq-008",
    "question": "Can I upgrade my ticket after purchase?",
    "answer": "Yes! You can upgrade your ticket at any time before the event by paying the difference between your current tier and the desired tier. Visit your registration profile at synergycon.live/profile or contact our support team. Upgrades are subject to availability—higher tiers like Priority Pass are limited.",
    "category": "Tickets",
    "display_order": 8,
    "is_published": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },

  // Venue & Logistics
  {
    "id": "faq-009",
    "question": "How do I get to the National Theatre?",
    "answer": "The National Theatre is located in Iganmu, Lagos Apapa Local Government Area. By car: Accessible via the Western Avenue or Apapa-Oshodi Expressway. Parking is available on-site. By public transport: Major bus routes pass through Iganmu. We recommend using ride-sharing services (Bolt, Uber) for convenience. Priority Pass holders receive complimentary VIP transport—details will be shared before the event.",
    "category": "Venue",
    "display_order": 9,
    "is_published": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "faq-010",
    "question": "Is parking available at the venue?",
    "answer": "Yes, the National Theatre has on-site parking available on a first-come, first-served basis. We recommend arriving early to secure parking. VVIP and Priority Pass holders have access to reserved premium parking areas closer to the main entrance. Overflow parking is available nearby with shuttle service to the venue.",
    "category": "Venue",
    "display_order": 10,
    "is_published": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "faq-011",
    "question": "What time should I arrive?",
    "answer": "Doors open at 8:00 AM for registration and networking. The opening keynote begins at 9:00 AM sharp. We recommend arriving by 8:00 AM to complete registration, collect your badge and materials, and explore the exhibition areas before sessions begin. VIP+ and higher tiers have dedicated fast-track registration lanes.",
    "category": "Venue",
    "display_order": 11,
    "is_published": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "faq-012",
    "question": "Is the venue accessible for people with disabilities?",
    "answer": "Yes, the National Theatre is wheelchair accessible with ramps, elevators, and accessible restrooms throughout the venue. Reserved seating is available for attendees with mobility needs. Please indicate any accessibility requirements during registration, and our team will ensure appropriate accommodations. Contact hello@synergycon.live for specific accessibility questions.",
    "category": "Venue",
    "display_order": 12,
    "is_published": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },

  // Experience & Sessions
  {
    "id": "faq-013",
    "question": "How do I navigate between the four districts?",
    "answer": "All four districts are housed within the National Theatre complex, making navigation seamless. Upon arrival, you'll receive a detailed venue map and event program. The SynergyCon mobile app (download from synergycon.live) provides real-time session schedules, speaker locations, and navigation guides. Color-coded signage throughout the venue will guide you between districts. Staff and volunteers will be stationed at key points to assist.",
    "category": "Experience",
    "display_order": 13,
    "is_published": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "faq-014",
    "question": "Can I attend sessions in multiple districts?",
    "answer": "Absolutely! Your ticket grants access to all four creative districts. Sessions run in parallel, so you can curate your own experience—attend a keynote in the Main Conference, then catch a masterclass in Tech & Gaming, followed by a fashion showcase. Use the event app to build your personalized schedule and set session reminders.",
    "category": "Experience",
    "display_order": 14,
    "is_published": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "faq-015",
    "question": "Will food and beverages be available?",
    "answer": "Yes! Multiple food vendors and beverage stations will be available throughout the venue. VIP+ and higher tiers include complimentary lunch and refreshments. The VIP Lounge offers premium catering and a comfortable space to relax and network. Vegetarian, vegan, and halal options will be available. Please note any dietary requirements during registration.",
    "category": "Experience",
    "display_order": 15,
    "is_published": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "faq-016",
    "question": "Will sessions be recorded or live-streamed?",
    "answer": "Select keynote sessions and panels will be live-streamed on our official channels. Post-event, session recordings will be available exclusively to registered attendees through the SynergyCon platform. VIP+ and higher tiers receive early access to all recorded content.",
    "category": "Experience",
    "display_order": 16,
    "is_published": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },

  // Speakers & Partners
  {
    "id": "faq-017",
    "question": "How can I become a speaker at SynergyCon?",
    "answer": "We welcome applications from thought leaders, innovators, and experts across the creative economy. Visit synergycon.live/apply-speaker to submit your proposal. We look for speakers with unique insights, proven expertise, and engaging presentation skills. Selected speakers receive complimentary VVIP access, speaking honorarium, professional speaker photos, and promotion across our channels.",
    "category": "Speakers",
    "display_order": 17,
    "is_published": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "faq-018",
    "question": "How can my organization become a partner or sponsor?",
    "answer": "SynergyCon offers various partnership and sponsorship opportunities to align your brand with Nigeria's creative economy movement. From ecosystem partnerships to principal sponsorships, we create custom packages that deliver measurable value. Visit synergycon.live/become-partner or email partnerships@synergycon.live to discuss opportunities.",
    "category": "Partners",
    "display_order": 18,
    "is_published": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },
  {
    "id": "faq-019",
    "question": "Can I exhibit my products or services at SynergyCon?",
    "answer": "Yes! We offer exhibition spaces for brands, startups, and creators to showcase their products and services. Exhibition packages include booth space, branding opportunities, and access to thousands of attendees. Visit synergycon.live/vendors or contact vendors@synergycon.live for exhibition packages and availability.",
    "category": "Partners",
    "display_order": 19,
    "is_published": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  },

  // Contact & Support
  {
    "id": "faq-020",
    "question": "How can I contact the SynergyCon team?",
    "answer": "We're here to help! General inquiries: hello@synergycon.live | Partnerships: partnerships@synergycon.live | Press & Media: press@synergycon.live | Speaker inquiries: speakers@synergycon.live. Follow us on social media @synergycon for updates. Our support team typically responds within 24-48 hours.",
    "category": "Support",
    "display_order": 20,
    "is_published": true,
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z"
  }
] as const

export type FAQId = typeof FAQS_DATA[number]['id']
