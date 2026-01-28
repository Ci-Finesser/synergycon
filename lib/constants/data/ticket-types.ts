/**
 * TicketType Data Constants
 * 
 * Auto-generated from database by sync-db-to-constants.ts
 * Edit this file and run db:seed to push changes back to the database.
 * 
 * Last synced: 2026-01-20T07:25:43.554Z
 */

export interface TicketTypeData {
  ticket_id: string
  name: string
  description: string | null
  price: number
  currency: string
  category: 'vip' | 'vip-plus' | 'vvip' | 'priority'
  duration: 'day' | 'full-event'
  access_type: 'general' | 'backstage' | 'all-access'
  benefits: string[] | null
  max_quantity: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export const TICKET_TYPES_DATA = [
  {
    "id": "450a9e6f-2d4d-454d-8d2b-ec817209c2e9",
    "ticket_id": "standard-day",
    "name": "Standard Day Pass",
    "description": "For 1 day only, get 3 for the 3 days",
    "price": 20000,
    "benefits": [
      "Day-specific sessions",
      "Exhibition area access",
      "Networking opportunities"
    ],
    "available_quantity": null,
    "sold_quantity": 0,
    "is_active": false,
    "category": "standard",
    "duration": "1-day",
    "display_order": 1,
    "valid_from": null,
    "valid_until": null,
    "created_at": "2026-01-08T11:43:31.666106+00:00",
    "updated_at": "2026-01-20T07:00:00.869653+00:00",
    "requires_validation": true,
    "max_per_order": 10,
    "min_per_order": 1,
    "early_bird_price": null,
    "early_bird_until": null,
    "group_discount_threshold": null,
    "group_discount_percent": null,
    "access_type": null
  },
  {
    "id": "d452663a-64d8-40d8-b003-d86247d691d1",
    "ticket_id": "vip",
    "name": "VIP",
    "description": "Single-day access to sessions and exhibitions",
    "price": 25000,
    "benefits": [
      "Day-specific sessions",
      "Exhibition area access",
      "Networking opportunities",
      "Certificate of attendance"
    ],
    "available_quantity": null,
    "sold_quantity": 0,
    "is_active": true,
    "category": "vip",
    "duration": "day",
    "display_order": 1,
    "valid_from": null,
    "valid_until": null,
    "created_at": "2026-01-20T07:00:00.869653+00:00",
    "updated_at": "2026-01-20T07:00:00.869653+00:00",
    "requires_validation": true,
    "max_per_order": 10,
    "min_per_order": 1,
    "early_bird_price": null,
    "early_bird_until": null,
    "group_discount_threshold": null,
    "group_discount_percent": null,
    "access_type": "day"
  },
  {
    "id": "4d103b55-7bee-4f67-bf3a-377f070e6c83",
    "ticket_id": "3day-standard",
    "name": "3-Day Standard Access Pass",
    "description": "Full festival experience",
    "price": 50000,
    "benefits": [
      "All 3 festival days",
      "All keynotes & panels",
      "Official swag bag"
    ],
    "available_quantity": null,
    "sold_quantity": 0,
    "is_active": false,
    "category": "standard",
    "duration": "3-day",
    "display_order": 2,
    "valid_from": null,
    "valid_until": null,
    "created_at": "2026-01-08T11:43:31.666106+00:00",
    "updated_at": "2026-01-20T07:00:00.869653+00:00",
    "requires_validation": true,
    "max_per_order": 10,
    "min_per_order": 1,
    "early_bird_price": null,
    "early_bird_until": null,
    "group_discount_threshold": null,
    "group_discount_percent": null,
    "access_type": null
  },
  {
    "id": "447023b3-2d3e-473b-837c-fe766839769b",
    "ticket_id": "vip-day",
    "name": "VIP Day Pass",
    "description": "For 1 day only, get 3 for the 3 days",
    "price": 50000,
    "benefits": [
      "VIP lounge access",
      "Priority seating",
      "All standard benefits"
    ],
    "available_quantity": null,
    "sold_quantity": 0,
    "is_active": false,
    "category": "vip",
    "duration": "1-day",
    "display_order": 3,
    "valid_from": null,
    "valid_until": null,
    "created_at": "2026-01-08T11:43:31.666106+00:00",
    "updated_at": "2026-01-20T07:00:00.869653+00:00",
    "requires_validation": true,
    "max_per_order": 10,
    "min_per_order": 1,
    "early_bird_price": null,
    "early_bird_until": null,
    "group_discount_threshold": null,
    "group_discount_percent": null,
    "access_type": null
  },
  {
    "id": "54dda731-d4f8-432d-9cd2-fd5c3060ad55",
    "ticket_id": "vip-plus",
    "name": "VIP+",
    "description": "Single-day premium access with enhanced perks",
    "price": 50000,
    "benefits": [
      "All VIP benefits",
      "Priority seating",
      "Exclusive networking lounge",
      "Lunch included",
      "Premium swag bag"
    ],
    "available_quantity": null,
    "sold_quantity": 0,
    "is_active": true,
    "category": "vip-plus",
    "duration": "day",
    "display_order": 2,
    "valid_from": null,
    "valid_until": null,
    "created_at": "2026-01-20T07:00:00.869653+00:00",
    "updated_at": "2026-01-20T07:00:00.869653+00:00",
    "requires_validation": true,
    "max_per_order": 10,
    "min_per_order": 1,
    "early_bird_price": null,
    "early_bird_until": null,
    "group_discount_threshold": null,
    "group_discount_percent": null,
    "access_type": "day"
  },
  {
    "id": "adc472ff-3592-4efb-8106-4365cdffc804",
    "ticket_id": "vvip",
    "name": "VVIP",
    "description": "Full festival access across all event days",
    "price": 100000,
    "benefits": [
      "Full festival access",
      "All keynotes & panels",
      "VIP lounge access",
      "All meals included",
      "Official swag bag",
      "Priority registration"
    ],
    "available_quantity": null,
    "sold_quantity": 0,
    "is_active": true,
    "category": "vvip",
    "duration": "full-event",
    "display_order": 3,
    "valid_from": null,
    "valid_until": null,
    "created_at": "2026-01-20T07:00:00.869653+00:00",
    "updated_at": "2026-01-20T07:00:00.869653+00:00",
    "requires_validation": true,
    "max_per_order": 10,
    "min_per_order": 1,
    "early_bird_price": null,
    "early_bird_until": null,
    "group_discount_threshold": null,
    "group_discount_percent": null,
    "access_type": "full"
  },
  {
    "id": "3417b0a6-29b7-400c-9dbb-562023ea0902",
    "ticket_id": "3day-vip",
    "name": "3-Day VIP Access Pass",
    "description": "Premium experience",
    "price": 150000,
    "benefits": [
      "VIP lounge access",
      "Priority seating",
      "Speaker dinner invite"
    ],
    "available_quantity": null,
    "sold_quantity": 0,
    "is_active": false,
    "category": "vip",
    "duration": "3-day",
    "display_order": 4,
    "valid_from": null,
    "valid_until": null,
    "created_at": "2026-01-08T11:43:31.666106+00:00",
    "updated_at": "2026-01-20T07:00:00.869653+00:00",
    "requires_validation": true,
    "max_per_order": 10,
    "min_per_order": 1,
    "early_bird_price": null,
    "early_bird_until": null,
    "group_discount_threshold": null,
    "group_discount_percent": null,
    "access_type": null
  },
  {
    "id": "653ffc92-188f-4615-974e-3dd1c2c18dd2",
    "ticket_id": "priority-pass",
    "name": "Priority Pass",
    "description": "Ultimate premium experience with exclusive access",
    "price": 150000,
    "benefits": [
      "All VVIP benefits",
      "Front-row reserved seating",
      "Exclusive speaker dinner invite",
      "Meet & greet with speakers",
      "Backstage access",
      "Dedicated concierge",
      "VIP transport included"
    ],
    "available_quantity": null,
    "sold_quantity": 0,
    "is_active": true,
    "category": "priority",
    "duration": "full-event",
    "display_order": 4,
    "valid_from": null,
    "valid_until": null,
    "created_at": "2026-01-20T07:00:00.869653+00:00",
    "updated_at": "2026-01-20T07:00:00.869653+00:00",
    "requires_validation": true,
    "max_per_order": 10,
    "min_per_order": 1,
    "early_bird_price": null,
    "early_bird_until": null,
    "group_discount_threshold": null,
    "group_discount_percent": null,
    "access_type": "full"
  }
] as const

export type TicketTypeId = typeof TICKET_TYPES_DATA[number]['id']
