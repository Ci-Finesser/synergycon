/**
 * TicketType Data Constants
 * 
 * SynergyCon 2.0 - Single-Day Event (March 26, 2026)
 * All tickets provide full-day access to all four creative districts
 * 
 * Last synced: 2026-01-29T00:00:00.000Z
 */

export interface TicketTypeData {
  ticket_id: string
  name: string
  description: string | null
  price: number
  currency: string
  category: 'vip' | 'vip-plus' | 'vvip' | 'priority'
  duration: 'day'
  access_type: 'general' | 'backstage' | 'all-access'
  benefits: string[] | null
  max_quantity: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export const TICKET_TYPES_DATA = [
  {
    "id": "d452663a-64d8-40d8-b003-d86247d691d1",
    "ticket_id": "vip",
    "name": "VIP Access",
    "description": "Full-day access to all four creative districts at the National Theatre. Experience keynotes, panels, exhibitions, and networking opportunities across Arts & Design, Fashion & Film, Tech & Gaming, and the Main Conference.",
    "price": 25000,
    "benefits": [
      "Access to all four creative districts",
      "All keynote sessions & panel discussions",
      "Exhibition area access throughout the venue",
      "Networking opportunities with industry leaders",
      "Certificate of attendance",
      "Event program & digital materials"
    ],
    "available_quantity": 2000,
    "sold_quantity": 0,
    "is_active": true,
    "category": "vip",
    "duration": "day",
    "display_order": 1,
    "valid_from": "2026-01-01T00:00:00+01:00",
    "valid_until": "2026-03-26T23:59:59+01:00",
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z",
    "requires_validation": true,
    "max_per_order": 10,
    "min_per_order": 1,
    "early_bird_price": 20000,
    "early_bird_until": "2026-02-28T23:59:59+01:00",
    "group_discount_threshold": 5,
    "group_discount_percent": 10,
    "access_type": "day"
  },
  {
    "id": "54dda731-d4f8-432d-9cd2-fd5c3060ad55",
    "ticket_id": "vip-plus",
    "name": "VIP+ Premium",
    "description": "Enhanced full-day experience with priority seating, exclusive networking lounge access, and premium perks. Navigate all four creative districts with dedicated VIP benefits.",
    "price": 50000,
    "benefits": [
      "All VIP Access benefits included",
      "Priority front-section seating at all sessions",
      "Exclusive VIP+ networking lounge access",
      "Complimentary lunch & refreshments",
      "Premium SynergyCon swag bag",
      "Dedicated registration lane (skip the queue)",
      "Digital networking app premium access",
      "Post-event exclusive content access"
    ],
    "available_quantity": 1000,
    "sold_quantity": 0,
    "is_active": true,
    "category": "vip-plus",
    "duration": "day",
    "display_order": 2,
    "valid_from": "2026-01-01T00:00:00+01:00",
    "valid_until": "2026-03-26T23:59:59+01:00",
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z",
    "requires_validation": true,
    "max_per_order": 10,
    "min_per_order": 1,
    "early_bird_price": 40000,
    "early_bird_until": "2026-02-28T23:59:59+01:00",
    "group_discount_threshold": 5,
    "group_discount_percent": 15,
    "access_type": "day"
  },
  {
    "id": "adc472ff-3592-4efb-8106-4365cdffc804",
    "ticket_id": "vvip",
    "name": "VVIP Experience",
    "description": "The ultimate SynergyCon experience. Enjoy exclusive backstage access, speaker meet-and-greets, and premium hospitality as you explore all four creative districts in style.",
    "price": 100000,
    "benefits": [
      "All VIP+ Premium benefits included",
      "Backstage access to all district stages",
      "Exclusive speaker meet-and-greet sessions",
      "Reserved front-row seating at keynotes",
      "VIP-only masterclass sessions",
      "Premium catering & hospitality lounge",
      "Exclusive VVIP swag collection",
      "Complimentary professional headshot",
      "Priority access to deal rooms",
      "Invitation to post-event networking dinner"
    ],
    "available_quantity": 500,
    "sold_quantity": 0,
    "is_active": true,
    "category": "vvip",
    "duration": "day",
    "display_order": 3,
    "valid_from": "2026-01-01T00:00:00+01:00",
    "valid_until": "2026-03-26T23:59:59+01:00",
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z",
    "requires_validation": true,
    "max_per_order": 5,
    "min_per_order": 1,
    "early_bird_price": 80000,
    "early_bird_until": "2026-02-28T23:59:59+01:00",
    "group_discount_threshold": 3,
    "group_discount_percent": 10,
    "access_type": "full"
  },
  {
    "id": "653ffc92-188f-4615-974e-3dd1c2c18dd2",
    "ticket_id": "priority-pass",
    "name": "Priority Pass (All-Access)",
    "description": "The pinnacle of the SynergyCon experience. Unlimited all-access privileges across every space, exclusive concierge service, VIP transport, and intimate dinner with speakers and industry titans.",
    "price": 150000,
    "benefits": [
      "All VVIP Experience benefits included",
      "Unlimited all-access to every venue space",
      "Personal concierge throughout the event",
      "VIP transport to/from the venue",
      "Exclusive speaker dinner invitation",
      "Private deal room access",
      "One-on-one sessions with select speakers",
      "Premium gift package (₦50,000+ value)",
      "Lifetime SynergyCon membership",
      "Early access to SynergyCon 3.0 tickets",
      "Professional video greeting from SynergyCon",
      "Name recognition in event program"
    ],
    "available_quantity": 100,
    "sold_quantity": 0,
    "is_active": true,
    "category": "priority",
    "duration": "day",
    "display_order": 4,
    "valid_from": "2026-01-01T00:00:00+01:00",
    "valid_until": "2026-03-26T23:59:59+01:00",
    "created_at": "2026-01-29T00:00:00.000Z",
    "updated_at": "2026-01-29T00:00:00.000Z",
    "requires_validation": true,
    "max_per_order": 2,
    "min_per_order": 1,
    "early_bird_price": 120000,
    "early_bird_until": "2026-02-28T23:59:59+01:00",
    "group_discount_threshold": null,
    "group_discount_percent": null,
    "access_type": "full"
  }
] as const

export type TicketTypeId = typeof TICKET_TYPES_DATA[number]['id']
