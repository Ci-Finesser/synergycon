/**
 * Single source of truth for partnership and sponsorship tiers.
 * Used across partners, vendors, and product showcase pages.
 */

export interface TierItem {
  name: string
  titleColor: string
  price: string
  popular?: boolean
  benefits: readonly string[]
}

export const SPONSORSHIP_TIERS: TierItem[] = [
  {
    name: "Silver Sponsor",
    titleColor: "text-gray-400",
    price: "₦4M",
    benefits: [
      "Shared exhibition space",
      "2 VIP passes",
      "Logo on website",
      "Social media recognition",
      "Listing in event program",
    ],
  },
  {
    name: "Gold Sponsor",
    titleColor: "text-amber-500",
    price: "₦8M",
    popular: true,
    benefits: [
      "Standard exhibition booth",
      "4 VIP passes",
      "Logo on website and materials",
      "Social media mentions",
      "Quarter-page ad in program",
      "Networking opportunities",
    ],
  },
  {
    name: "Platinum Sponsor",
    titleColor: "text-cyan-300",
    price: "₦15M",
    benefits: [
      "Premium booth at exhibition space",
      "Speaking opportunity in panel discussion",
      "6 VIP passes",
      "Logo on stage backdrop and website",
      "Social media recognition",
      "Half-page ad in event program",
      "Attendee networking access",
    ],
  },
  {
    name: "Diamond Sponsor",
    titleColor: "text-purple-400",
    price: "₦25M",
    benefits: [
      "Exclusive title sponsor recognition",
      "Prime booth location at exhibition",
      "Speaking slot in keynote session",
      "10 VIP passes with premium seating",
      "Logo on all marketing materials",
      "Dedicated social media campaign",
      "Full-page ad in event program",
      "Post-event attendee data access",
    ],
  },
]

export const VENDOR_TIERS: TierItem[] = [
  {
    name: "Standard Vendor",
    titleColor: "text-gray-500",
    price: "₦500K",
    benefits: [
      "6x6 booth space",
      "1 vendor pass",
      "Basic listing in vendor directory",
      "Access to attendees",
    ],
  },
  {
    name: "Premium Vendor",
    titleColor: "text-amber-500",
    price: "₦1M",
    popular: true,
    benefits: [
      "10x10 booth space",
      "2 vendor passes",
      "Featured listing in vendor directory",
      "Logo on event website",
      "Social media mention",
    ],
  },
  {
    name: "Elite Vendor",
    titleColor: "text-cyan-400",
    price: "₦2M",
    benefits: [
      "Premium corner booth (12x12)",
      "4 vendor passes",
      "Top listing in vendor directory",
      "Logo on signage and website",
      "Dedicated social media feature",
      "Priority customer access",
    ],
  },
]

export const PRODUCT_SHOWCASE_TIERS: TierItem[] = [
  {
    name: "Starter Showcase",
    titleColor: "text-gray-500",
    price: "₦250K",
    benefits: [
      "Display table space",
      "1 exhibitor pass",
      "Product listing in catalog",
      "Basic signage",
    ],
  },
  {
    name: "Growth Showcase",
    titleColor: "text-green-500",
    price: "₦500K",
    popular: true,
    benefits: [
      "Dedicated display area",
      "2 exhibitor passes",
      "Featured product listing",
      "Logo in event materials",
      "Product demo time slot",
    ],
  },
  {
    name: "Launch Showcase",
    titleColor: "text-purple-500",
    price: "₦1M",
    benefits: [
      "Premium display zone",
      "4 exhibitor passes",
      "Spotlight in product catalog",
      "Logo on website and signage",
      "Dedicated demo session",
      "Social media product feature",
      "Press release inclusion",
    ],
  },
]

export type SponsorshipTier = TierItem
export type VendorTier = TierItem
export type ProductShowcaseTier = TierItem
