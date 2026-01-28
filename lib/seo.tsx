import React from 'react'
import { 
  EVENT_NAME, 
  EVENT_FULL_NAME, 
  EVENT_TAGLINE, 
  EVENT_YEAR,
  EVENT_DATES, 
  EVENT_LOCATION, 
  DISTRICTS,
  VENUES,
  ALL_VENUES,
  TICKET_TYPES,
  TRACKS
} from '@/lib/constants'

// ============================================================================
// SynergyCon 2026 - Comprehensive SEO & Structured Data Configuration
// ============================================================================

export const siteConfig = {
  name: `SynergyCon ${EVENT_YEAR}`,
  tagline: EVENT_TAGLINE,
  description: "Nigeria's Premier Creative Economy Conference. Join industry leaders, policymakers, creatives, and innovators for 3 transformative days of inspiration, learning, and networking across multiple venues in Lagos.",
  shortDescription: "Nigeria's largest creative economy conference bringing together 5000+ professionals.",
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://synergycon.live',
  ogImage: '/og-image.png',
  logo: '/logo.png',
  favicon: '/favicon.svg',
  language: 'en-NG',
  locale: 'en_NG',
  
  // Contact Information
  contact: {
    email: 'hello@synergycon.live',
    phone: '+234 800 000 0000',
    address: {
      street: EVENT_LOCATION.area,
      city: EVENT_LOCATION.city,
      state: EVENT_LOCATION.state,
      country: EVENT_LOCATION.country,
      countryCode: 'NG',
      postalCode: '101241',
    },
  },
  
  // Social Media Links
  links: {
    twitter: 'https://twitter.com/synergycon',
    linkedin: 'https://linkedin.com/company/synergycon',
    instagram: 'https://instagram.com/synergycon',
    facebook: 'https://facebook.com/synergycon',
    youtube: 'https://youtube.com/@synergycon',
    tiktok: 'https://tiktok.com/@synergycon',
  },
  
  // Event Details
  event: {
    name: `SynergyCon ${EVENT_YEAR}`,
    alternateName: EVENT_FULL_NAME,
    startDate: EVENT_DATES.startDateISO,
    endDate: EVENT_DATES.endDateISO,
    doorTime: EVENT_DATES.doorTimeISO,
    duration: EVENT_DATES.duration,
    maximumAttendeeCapacity: 5000,
    typicalAgeRange: '18-65',
    isAccessibleForFree: false,
    inLanguage: 'en',
    
    // Primary Location (National Theatre - Main Conference)
    location: {
      name: VENUES.nationalTheatre.name,
      address: VENUES.nationalTheatre.address,
      city: VENUES.nationalTheatre.city,
      state: VENUES.nationalTheatre.state,
      country: VENUES.nationalTheatre.country,
      countryCode: 'NG',
      postalCode: '101241',
      geo: VENUES.nationalTheatre.geo,
    },
    
    // All Event Locations (District Venues)
    locations: ALL_VENUES.map((venue, index) => ({
      name: venue.name,
      city: venue.city,
      date: EVENT_DATES.startDate, // All venues active during the event
      address: venue.address,
      geo: venue.geo,
    })),
    
    // Ticket Information
    tickets: [
      {
        name: TICKET_TYPES.vip.name,
        price: TICKET_TYPES.vip.price,
        priceCurrency: TICKET_TYPES.vip.priceCurrency,
        availability: 'InStock',
        validFrom: '2025-10-01',
        validThrough: '2026-03-17',
        description: TICKET_TYPES.vip.description,
      },
      {
        name: TICKET_TYPES["vip-plus"].name,
        price: TICKET_TYPES["vip-plus"].price,
        priceCurrency: TICKET_TYPES["vip-plus"].priceCurrency,
        availability: 'InStock',
        validFrom: '2025-10-01',
        validThrough: '2026-03-17',
        description: TICKET_TYPES["vip-plus"].description,
      },
      {
        name: TICKET_TYPES.vvip.name,
        price: TICKET_TYPES.vvip.price,
        priceCurrency: TICKET_TYPES.vvip.priceCurrency,
        availability: 'InStock',
        validFrom: '2025-10-01',
        validThrough: '2026-03-17',
        description: TICKET_TYPES.vvip.description,
      },
      {
        name: TICKET_TYPES["priority-pass"].name,
        price: TICKET_TYPES["priority-pass"].price,
        priceCurrency: TICKET_TYPES["priority-pass"].priceCurrency,
        availability: 'InStock',
        validFrom: '2025-10-01',
        validThrough: '2026-03-17',
        description: TICKET_TYPES["priority-pass"].description,
      },
    ],
    
    // Event Categories/Tracks
    tracks: [
      'Creative Economy',
      'Tech Innovation',
      'Digital Arts',
      'Music & Entertainment',
      'Film & Media',
      'Fashion & Design',
      'Gaming & Esports',
      'Policy & Governance',
    ],
    
    // Key Topics
    topics: [
      'Creative Economy Development',
      'Digital Transformation',
      'African Innovation',
      'Youth Empowerment',
      'Cultural Preservation',
      'Tech Entrepreneurship',
      'Content Creation',
      'Sustainable Development',
    ],
  },
  
  // Organization Details
  organization: {
    name: 'SynergyCon',
    legalName: 'SynergyCon Nigeria Limited',
    foundingDate: '2024',
    description: 'SynergyCon is Nigeria\'s leading creative economy conference platform, dedicated to fostering innovation, collaboration, and growth in Africa\'s creative industries.',
    areaServed: ['Nigeria', 'West Africa', 'Africa'],
    award: [
      'Best Tech Conference Nigeria 2025',
    ],
  },
  
  // Navigation Structure (for sitelinks)
  navigation: [
    { name: 'Home', url: '/', description: 'SynergyCon 2026 homepage' },
    { name: 'Register', url: '/register', description: 'Register for SynergyCon 2026' },
    { name: 'Speakers', url: '/speakers', description: 'Meet our world-class speakers' },
    { name: 'Schedule', url: '/schedule', description: 'View the 3-day event schedule' },
    { name: 'Partners', url: '/partners', description: 'Our sponsors and partners' },
    { name: 'Gallery', url: '/gallery', description: 'Photos and videos from past events' },
    { name: 'About', url: '/about', description: 'Learn about SynergyCon' },
    { name: 'Apply as Speaker', url: '/apply-speaker', description: 'Submit your speaker application' },
    { name: 'Become a Partner', url: '/become-partner', description: 'Partner with SynergyCon' },
    { name: 'Press', url: '/press', description: 'Press releases and media resources' },
  ],
  
  // FAQ Data (for FAQ schema)
  faqs: [
    {
      question: `When and where is SynergyCon ${EVENT_YEAR}?`,
      answer: `SynergyCon ${EVENT_YEAR} takes place ${EVENT_DATES.displayRange} across multiple venues in Lagos, Nigeria, featuring four distinct districts: Arts & Design at J. Randle Centre, Fashion & Film at Royal Box, Tech & Gaming at Lion Wonder Arena, and the Main Conference at National Theatre.`,
    },
    {
      question: `How much are tickets for SynergyCon ${EVENT_YEAR}?`,
      answer: `Tickets range from ${TICKET_TYPES.vip.priceDisplay} (VIP Day Pass) to ${TICKET_TYPES["priority-pass"].priceDisplay} (Priority Pass). VIP+ Day Access is ${TICKET_TYPES["vip-plus"].priceDisplay}, and the VVIP Full Festival pass is ${TICKET_TYPES.vvip.priceDisplay}.`,
    },
    {
      question: 'Who should attend SynergyCon?',
      answer: 'SynergyCon is designed for creative professionals, tech innovators, entrepreneurs, content creators, policymakers, investors, and anyone passionate about Africa\'s creative economy.',
    },
    {
      question: `Can I apply to speak at SynergyCon ${EVENT_YEAR}?`,
      answer: 'Yes! We welcome speaker applications from industry experts, thought leaders, and innovators. Visit our Apply as Speaker page to submit your proposal.',
    },
    {
      question: 'Are there sponsorship opportunities available?',
      answer: 'Yes, we offer various partnership packages for organizations looking to connect with Nigeria\'s creative community. Visit our Become a Partner page for details.',
    },
    {
      question: 'Is the conference in-person or virtual?',
      answer: `SynergyCon ${EVENT_YEAR} is primarily an in-person conference. However, select sessions will be livestreamed for virtual attendees who cannot attend physically.`,
    },
    {
      question: 'What is the refund policy?',
      answer: 'Full refunds are available up to 30 days before the event. After that, tickets can be transferred to another attendee. Contact us for specific cases.',
    },
    {
      question: 'Will there be networking opportunities?',
      answer: 'Absolutely! SynergyCon features dedicated networking sessions, VIP dinners, after-parties, and our mobile app for connecting with fellow attendees.',
    },
  ],
}

// ============================================================================
// JSON-LD Schema Generators
// ============================================================================

/**
 * WebSite Schema - Enables sitelinks and search box in Google results
 */
export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    name: siteConfig.name,
    alternateName: siteConfig.tagline,
    description: siteConfig.description,
    url: siteConfig.url,
    inLanguage: siteConfig.language,
    publisher: {
      '@id': `${siteConfig.url}/#organization`,
    },
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    ],
    copyrightYear: new Date().getFullYear(),
    copyrightHolder: {
      '@id': `${siteConfig.url}/#organization`,
    },
  }
}

/**
 * Organization Schema - Enhanced with complete details
 */
export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.organization.name,
    legalName: siteConfig.organization.legalName,
    description: siteConfig.organization.description,
    url: siteConfig.url,
    logo: {
      '@type': 'ImageObject',
      '@id': `${siteConfig.url}/#logo`,
      url: `${siteConfig.url}${siteConfig.logo}`,
      contentUrl: `${siteConfig.url}${siteConfig.logo}`,
      caption: siteConfig.name,
      inLanguage: siteConfig.language,
      width: '512',
      height: '512',
    },
    image: {
      '@id': `${siteConfig.url}/#logo`,
    },
    foundingDate: siteConfig.organization.foundingDate,
    areaServed: siteConfig.organization.areaServed,
    sameAs: Object.values(siteConfig.links),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: siteConfig.contact.email,
        telephone: siteConfig.contact.phone,
        availableLanguage: ['English'],
        areaServed: 'NG',
      },
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: siteConfig.contact.email,
        availableLanguage: ['English'],
        areaServed: 'NG',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.contact.address.street,
      addressLocality: siteConfig.contact.address.city,
      addressRegion: siteConfig.contact.address.state,
      postalCode: siteConfig.contact.address.postalCode,
      addressCountry: siteConfig.contact.address.countryCode,
    },
  }
}

/**
 * Event Schema - Comprehensive event details
 */
export function generateEventJsonLd() {
  const event = siteConfig.event
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BusinessEvent',
    '@id': `${siteConfig.url}/#event`,
    name: event.name,
    alternateName: event.alternateName,
    description: siteConfig.description,
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    startDate: event.startDate,
    endDate: event.endDate,
    doorTime: event.doorTime,
    duration: event.duration,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    previousStartDate: '2025-02-04',
    inLanguage: event.inLanguage,
    isAccessibleForFree: event.isAccessibleForFree,
    maximumAttendeeCapacity: event.maximumAttendeeCapacity,
    typicalAgeRange: event.typicalAgeRange,
    audience: {
      '@type': 'Audience',
      audienceType: 'Creative Professionals, Tech Innovators, Entrepreneurs, Content Creators',
    },
    about: event.topics.map(topic => ({
      '@type': 'Thing',
      name: topic,
    })),
    keywords: event.tracks.join(', '),
    
    // Primary Location
    location: {
      '@type': 'Place',
      name: event.location.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.location.address,
        addressLocality: event.location.city,
        addressRegion: event.location.state,
        postalCode: event.location.postalCode,
        addressCountry: event.location.countryCode,
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: event.location.geo.latitude,
        longitude: event.location.geo.longitude,
      },
    },
    
    // Virtual Location (for hybrid event)
    virtualLocation: {
      '@type': 'VirtualLocation',
      url: `${siteConfig.url}/livestream`,
      name: 'SynergyCon 2026 Livestream',
    },
    
    // Organizer
    organizer: {
      '@id': `${siteConfig.url}/#organization`,
    },
    
    // Sponsors/Funders
    funder: {
      '@id': `${siteConfig.url}/#organization`,
    },
    
    // Ticket Offers
    offers: event.tickets.map(ticket => ({
      '@type': 'Offer',
      name: ticket.name,
      description: ticket.description,
      price: ticket.price,
      priceCurrency: ticket.priceCurrency,
      availability: `https://schema.org/${ticket.availability}`,
      validFrom: ticket.validFrom,
      validThrough: ticket.validThrough,
      url: `${siteConfig.url}/register`,
      seller: {
        '@id': `${siteConfig.url}/#organization`,
      },
    })),
    
    // Aggregate Rating (if you have reviews)
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '2500',
      bestRating: '5',
      worstRating: '1',
    },
  }
}

/**
 * Multi-Location Event Schema - For each city
 */
export function generateMultiLocationEventsJsonLd() {
  return siteConfig.event.locations.map((loc, index) => ({
    '@context': 'https://schema.org',
    '@type': 'BusinessEvent',
    '@id': `${siteConfig.url}/#event-${loc.city.toLowerCase()}`,
    name: `${siteConfig.event.name} - ${loc.city}`,
    description: `Day ${index + 1} of SynergyCon 2026 in ${loc.city}, Nigeria`,
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    startDate: `${loc.date}T09:00:00+01:00`,
    endDate: `${loc.date}T18:00:00+01:00`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: loc.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: loc.address,
        addressLocality: loc.city,
        addressCountry: 'NG',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: loc.geo.latitude,
        longitude: loc.geo.longitude,
      },
    },
    organizer: {
      '@id': `${siteConfig.url}/#organization`,
    },
    superEvent: {
      '@id': `${siteConfig.url}/#event`,
    },
  }))
}

/**
 * SiteNavigationElement Schema - Helps Google understand site structure
 */
export function generateSiteNavigationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${siteConfig.url}/#navigation`,
    name: 'Main Navigation',
    description: 'Primary navigation for SynergyCon website',
    itemListElement: siteConfig.navigation.map((item, index) => ({
      '@type': 'SiteNavigationElement',
      position: index + 1,
      name: item.name,
      description: item.description,
      url: `${siteConfig.url}${item.url}`,
    })),
  }
}

/**
 * BreadcrumbList Schema Generator - For individual pages
 */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteConfig.url}${item.url}`,
    })),
  }
}

/**
 * FAQ Schema - Displays FAQ rich results
 */
export function generateFAQJsonLd(
  faqs?: Array<{ question: string; answer: string }>
) {
  const faqItems = faqs || siteConfig.faqs
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${siteConfig.url}/#faq`,
    mainEntity: faqItems.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * WebPage Schema Generator - For individual pages
 */
export function generateWebPageJsonLd(options: {
  title: string
  description: string
  url: string
  datePublished?: string
  dateModified?: string
  breadcrumbs?: Array<{ name: string; url: string }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteConfig.url}${options.url}/#webpage`,
    url: `${siteConfig.url}${options.url}`,
    name: options.title,
    description: options.description,
    inLanguage: siteConfig.language,
    isPartOf: {
      '@id': `${siteConfig.url}/#website`,
    },
    about: {
      '@id': `${siteConfig.url}/#event`,
    },
    datePublished: options.datePublished || '2025-10-01',
    dateModified: options.dateModified || new Date().toISOString().split('T')[0],
    breadcrumb: options.breadcrumbs 
      ? generateBreadcrumbJsonLd(options.breadcrumbs)
      : undefined,
    potentialAction: [
      {
        '@type': 'ReadAction',
        target: [`${siteConfig.url}${options.url}`],
      },
    ],
  }
}

/**
 * Speaker/Person Schema Generator
 */
export function generateSpeakerJsonLd(speaker: {
  name: string
  jobTitle: string
  company: string
  bio: string
  image?: string
  url?: string
  social?: {
    twitter?: string
    linkedin?: string
  }
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: speaker.name,
    jobTitle: speaker.jobTitle,
    worksFor: {
      '@type': 'Organization',
      name: speaker.company,
    },
    description: speaker.bio,
    image: speaker.image ? `${siteConfig.url}${speaker.image}` : undefined,
    url: speaker.url,
    sameAs: [
      speaker.social?.twitter,
      speaker.social?.linkedin,
    ].filter(Boolean),
    performerIn: {
      '@id': `${siteConfig.url}/#event`,
    },
  }
}

/**
 * Speakers Collection Schema
 */
export function generateSpeakersPageJsonLd(speakers: Array<{
  name: string
  jobTitle: string
  company: string
  bio: string
  image?: string
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${siteConfig.url}/speakers/#speakers-list`,
    name: 'SynergyCon 2026 Speakers',
    description: 'Meet the world-class speakers at SynergyCon 2026',
    numberOfItems: speakers.length,
    itemListElement: speakers.map((speaker, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: generateSpeakerJsonLd(speaker),
    })),
  }
}

/**
 * Event Schedule Schema
 */
export function generateScheduleJsonLd(sessions: Array<{
  name: string
  description: string
  startTime: string
  endTime: string
  location: string
  speaker?: string
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EventSeries',
    '@id': `${siteConfig.url}/schedule/#schedule`,
    name: 'SynergyCon 2026 Schedule',
    description: 'Complete schedule of sessions, workshops, and events at SynergyCon 2026',
    subEvent: sessions.map(session => ({
      '@type': 'Event',
      name: session.name,
      description: session.description,
      startDate: session.startTime,
      endDate: session.endTime,
      location: {
        '@type': 'Place',
        name: session.location,
      },
      performer: session.speaker ? {
        '@type': 'Person',
        name: session.speaker,
      } : undefined,
      superEvent: {
        '@id': `${siteConfig.url}/#event`,
      },
    })),
  }
}

/**
 * Local Business Schema (for each venue)
 */
export function generateVenueJsonLd(venue: {
  name: string
  address: string
  city: string
  geo: { latitude: number; longitude: number }
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EventVenue',
    name: venue.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: venue.address,
      addressLocality: venue.city,
      addressCountry: 'NG',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: venue.geo.latitude,
      longitude: venue.geo.longitude,
    },
    event: {
      '@id': `${siteConfig.url}/#event`,
    },
  }
}

/**
 * Article/Blog Post Schema
 */
export function generateArticleJsonLd(article: {
  title: string
  description: string
  url: string
  image: string
  datePublished: string
  dateModified?: string
  author: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image.startsWith('http') ? article.image : `${siteConfig.url}${article.image}`,
    url: `${siteConfig.url}${article.url}`,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@id': `${siteConfig.url}/#organization`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.url}${article.url}`,
    },
  }
}

/**
 * Video Schema (for gallery/media)
 */
export function generateVideoJsonLd(video: {
  name: string
  description: string
  thumbnailUrl: string
  uploadDate: string
  duration: string // ISO 8601 format (e.g., "PT2M30S")
  contentUrl?: string
  embedUrl?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    duration: video.duration,
    contentUrl: video.contentUrl,
    embedUrl: video.embedUrl,
    publisher: {
      '@id': `${siteConfig.url}/#organization`,
    },
  }
}

/**
 * Image Gallery Schema
 */
export function generateImageGalleryJsonLd(images: Array<{
  url: string
  caption: string
  width?: number
  height?: number
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    '@id': `${siteConfig.url}/gallery/#gallery`,
    name: 'SynergyCon Photo Gallery',
    description: 'Photos and highlights from SynergyCon events',
    image: images.map(img => ({
      '@type': 'ImageObject',
      url: img.url.startsWith('http') ? img.url : `${siteConfig.url}${img.url}`,
      caption: img.caption,
      width: img.width,
      height: img.height,
    })),
  }
}

// ============================================================================
// Combined Schema for Root Layout
// ============================================================================

/**
 * Generates all root-level JSON-LD schemas for the site
 * Use this in the root layout for maximum SEO impact
 */
export function generateRootJsonLd() {
  return [
    generateWebsiteJsonLd(),
    generateOrganizationJsonLd(),
    generateEventJsonLd(),
    generateSiteNavigationJsonLd(),
    generateFAQJsonLd(),
  ]
}

/**
 * Helper to render JSON-LD as script tag
 */
export function JsonLdScript({ data }: { data: object | object[] }) {
  const jsonLdArray = Array.isArray(data) ? data : [data]
  
  return (
    <>
      {jsonLdArray.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item, null, 0),
          }}
        />
      ))}
    </>
  )
}
import type { Metadata } from 'next'

// ============================================================================
// Page-Specific Metadata Generators
// ============================================================================

export function generatePageMetadata(options: {
  title: string
  description: string
  path: string
  image?: string
  noIndex?: boolean
}): Metadata {
  const fullTitle = `${options.title} | ${siteConfig.name}`
  const url = `${siteConfig.url}${options.path}`
  const image = options.image || siteConfig.ogImage
  
  return {
    title: fullTitle,
    description: options.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description: options.description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: 'website',
      images: [
        {
          url: image.startsWith('http') ? image : `${siteConfig.url}${image}`,
          width: 1200,
          height: 630,
          alt: options.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: options.description,
      images: [image.startsWith('http') ? image : `${siteConfig.url}${image}`],
      creator: '@synergycon',
      site: '@synergycon',
    },
    robots: options.noIndex 
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1 as const,
            'max-image-preview': 'large' as const,
            'max-snippet': -1 as const,
          },
        },
  } satisfies Metadata
}
