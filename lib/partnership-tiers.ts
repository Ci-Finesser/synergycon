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
    price: "₦10M",
    benefits: [
      "Major branding in one district",
      "Power a panel session",
      "Premium exhibition booth",
      "Digital campaign inclusion",
    ],
  },
  {
    name: "Gold Sponsor",
    titleColor: "text-amber-500",
    price: "₦15M",
    benefits: [
      "Major branding across districts",
      "Power a panel/lecture/masterclass session",
      "Premium exhibition booth",
      "Digital campaign inclusion",
    ],
  },
  {
    name: "Platinum Sponsor",
    titleColor: "text-cyan-300",
    price: "₦25M",
    popular: true,
    benefits: [
      "Category Exclusivity (Industry Lockout)",
      "Naming rights to a district (e.g., \"XYZ Fashion & Film District\")",
      "Speaking slots + masterclass rights",
      "360° branding across all festival districts",
      "Dedicated creative recruitment & demo activation",
      "Multi-channel media coverage (TV, Radio, Print, Digital)",
    ],
  },
  {
    name: "Diamond Sponsor",
    titleColor: "text-purple-400",
    price: "₦50M",
    benefits: [
      "Headline Sponsor Exclusivity (Industry Lockout)",
      "Naming rights to SynergyCon 2.0 (e.g., \"XYZ SynergyCon 2.0\")",
      "Earn a Speaking slot",
      "360° branding across all festival districts",
      "Access to Finesser 200,000+ creator ecosystem",
      "Multi-channel media coverage (Cable & Terrestrial TV, Radio, Print, Social Media Ads, Influencer marketing, Billboards)",
      "Marketplace directory presence",
      "Power music performances/festival (e.g., \"Brainwork Festival Powered by XYZ\")",
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
