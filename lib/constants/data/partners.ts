/**
 * Partner Data Constants
 * 
 * Comprehensive partner data for SynergyCon 2026 - Nigeria's Premier Creative Economy Conference
 * Edit this file and run db:seed to push changes back to the database.
 * 
 * Partner Categories:
 * - Strategic Partners: Key collaborators driving the event
 * - Media Partners: Press, publications, and content platforms
 * - Ecosystem Partners: Industry networks and communities
 * - Technology Partners: Tech platforms and service providers
 * - Venue Partners: Location and hospitality collaborators
 * - Creative Partners: Design, production, and creative agencies
 * 
 * Last updated: 2026-01-29
 */

export interface PartnerData {
  id: string
  name: string
  logo_url: string | null
  website: string | null
  description: string | null
  bio: string | null
  tier: 'strategic' | 'media' | 'ecosystem' | 'technology' | 'venue' | 'creative' | 'community'
  category: string
  sub_category: string | null
  contact_email: string | null
  featured: boolean
  display_order: number
  status: 'pending' | 'approved' | 'live'
  created_at: string
  updated_at: string
}

export const PARTNERS_DATA: PartnerData[] = [
  // ============================================
  // STRATEGIC PARTNERS
  // ============================================
  {
    id: "partner-001",
    name: "Lagos State Ministry of Tourism, Arts and Culture",
    logo_url: "/images/lagos-tourism.svg",
    website: "https://lagosstate.gov.ng",
    description: "Official government partner for creative economy initiatives",
    bio: "The Lagos State Ministry of Tourism, Arts and Culture is the government body responsible for developing and promoting Lagos as a global destination for tourism, arts, and cultural experiences. As a strategic partner of SynergyCon 2026, the Ministry underscores its commitment to supporting the creative economy and positioning Lagos as Africa's creative capital. The partnership brings government support, policy insights, and access to state resources that will enhance the conference experience.",
    tier: "strategic",
    category: "Government",
    sub_category: "State Ministry",
    contact_email: "info@lagostourism.gov.ng",
    featured: true,
    display_order: 1,
    status: "live",
    created_at: "2025-10-15T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-002",
    name: "Bank of Industry",
    logo_url: "/images/boi.svg",
    website: "https://www.boi.ng",
    description: "Nigeria's oldest and largest development finance institution",
    bio: "Bank of Industry (BOI) is Nigeria's oldest and largest development finance institution, providing financial assistance for the establishment of large, medium, and small projects. As a strategic partner of SynergyCon 2026, BOI brings its expertise in funding creative enterprises and will be hosting exclusive sessions on accessing creative economy financing, grants, and low-interest loans for entrepreneurs in the arts, fashion, tech, and entertainment sectors.",
    tier: "strategic",
    category: "Finance",
    sub_category: "Development Finance",
    contact_email: "enquiries@boi.ng",
    featured: true,
    display_order: 2,
    status: "live",
    created_at: "2025-10-20T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-003",
    name: "Nigerian Copyright Commission",
    logo_url: "/images/ncc.svg",
    website: "https://www.copyright.gov.ng",
    description: "Government agency responsible for copyright administration in Nigeria",
    bio: "The Nigerian Copyright Commission (NCC) is the government agency responsible for the administration of copyright law in Nigeria. As a strategic partner, NCC will be hosting workshops on intellectual property protection, copyright registration, and anti-piracy measures for creatives. Their participation ensures that SynergyCon 2026 addresses critical issues around protecting creative works and monetizing intellectual property in the digital age.",
    tier: "strategic",
    category: "Government",
    sub_category: "Regulatory Agency",
    contact_email: "info@copyright.gov.ng",
    featured: true,
    display_order: 3,
    status: "live",
    created_at: "2025-11-01T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },

  // ============================================
  // MEDIA PARTNERS
  // ============================================
  {
    id: "partner-004",
    name: "Guardian Nigeria",
    logo_url: "/images/guardian.svg",
    website: "https://guardian.ng",
    description: "Nigeria's leading independent newspaper",
    bio: "The Guardian Nigeria is one of Nigeria's most respected and widely-read newspapers, known for its in-depth journalism and coverage of arts, culture, and business. As a media partner, The Guardian will provide extensive pre-event coverage, live reporting during SynergyCon 2026, and post-event analysis. Their readership of decision-makers and influencers ensures that the conference reaches key stakeholders in Nigeria's creative economy.",
    tier: "media",
    category: "Print Media",
    sub_category: "Newspaper",
    contact_email: "editor@guardian.ng",
    featured: true,
    display_order: 4,
    status: "live",
    created_at: "2025-11-05T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-005",
    name: "Pulse Nigeria",
    logo_url: "/images/pulse.svg",
    website: "https://www.pulse.ng",
    description: "Africa's leading innovative media company",
    bio: "Pulse Nigeria is Africa's leading digital media company, reaching over 100 million Africans monthly across its platforms. Known for its youth-focused content covering entertainment, lifestyle, news, and sports, Pulse brings unmatched digital reach to SynergyCon 2026. As a media partner, they will provide social media amplification, video content creation, and real-time coverage that resonates with the young creative professionals who form the backbone of Nigeria's creative economy.",
    tier: "media",
    category: "Digital Media",
    sub_category: "Online Publication",
    contact_email: "partnerships@pulse.ng",
    featured: true,
    display_order: 5,
    status: "live",
    created_at: "2025-11-08T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-006",
    name: "TechCabal",
    logo_url: "/images/techcabal.svg",
    website: "https://techcabal.com",
    description: "Africa's leading technology publication",
    bio: "TechCabal is Africa's leading technology media company, providing news, analysis, and insights on African technology and startups. With a readership of tech founders, investors, and industry leaders, TechCabal's partnership ensures SynergyCon 2026 reaches the intersection of technology and creativity. They will be covering the Tech & Gaming District extensively, bringing attention to how technology is transforming creative industries across Africa.",
    tier: "media",
    category: "Digital Media",
    sub_category: "Tech Publication",
    contact_email: "hello@techcabal.com",
    featured: true,
    display_order: 6,
    status: "live",
    created_at: "2025-11-10T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-007",
    name: "BellaNaija",
    logo_url: "/images/bellanaija.svg",
    website: "https://www.bellanaija.com",
    description: "Nigeria's leading lifestyle, entertainment and fashion website",
    bio: "BellaNaija is Nigeria's pioneering and most influential lifestyle, entertainment, and fashion media platform. With over 15 years of shaping conversations around Nigerian culture, weddings, fashion, and entertainment, BellaNaija brings a massive audience of style-conscious, culturally-engaged Nigerians to SynergyCon 2026. Their coverage of the Fashion & Film District will bring the glamour and excitement of the event to millions of readers.",
    tier: "media",
    category: "Digital Media",
    sub_category: "Lifestyle Publication",
    contact_email: "info@bellanaija.com",
    featured: true,
    display_order: 7,
    status: "live",
    created_at: "2025-11-12T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-008",
    name: "Cool FM / Wazobia FM / Nigeria Info",
    logo_url: "/images/cool-fm.svg",
    website: "https://www.coolfm.ng",
    description: "Nigeria's premier radio network",
    bio: "Cool FM, Wazobia FM, and Nigeria Info form Nigeria's largest and most influential radio network, reaching millions of listeners daily across the country. As a media partner, the network will provide on-air promotions, live broadcasts from the event, and exclusive interviews with speakers and attendees. Their multi-station approach ensures SynergyCon 2026 reaches diverse demographics from urban professionals to grassroots creatives.",
    tier: "media",
    category: "Broadcast Media",
    sub_category: "Radio Network",
    contact_email: "info@coolfm.ng",
    featured: true,
    display_order: 8,
    status: "live",
    created_at: "2025-11-15T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-009",
    name: "Notjustok",
    logo_url: "/images/notjustok.svg",
    website: "https://notjustok.com",
    description: "Africa's #1 music website and online radio",
    bio: "Notjustok is Africa's #1 music website and online radio station, with a massive following among music enthusiasts and industry professionals. Known for breaking new artists and covering the African music scene comprehensively, Notjustok's partnership brings authenticity and deep music industry connections to SynergyCon 2026. They will be covering the music sessions and providing exclusive content from performers and music industry speakers.",
    tier: "media",
    category: "Digital Media",
    sub_category: "Music Publication",
    contact_email: "contact@notjustok.com",
    featured: false,
    display_order: 9,
    status: "live",
    created_at: "2025-11-18T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },

  // ============================================
  // ECOSYSTEM PARTNERS
  // ============================================
  {
    id: "partner-010",
    name: "Creative Nigeria",
    logo_url: "/images/creative-nigeria.svg",
    website: "https://creativenigeria.ng",
    description: "National platform for Nigeria's creative economy",
    bio: "Creative Nigeria is the national platform dedicated to supporting and promoting Nigeria's creative economy. The organization works to connect creatives with opportunities, provide capacity building, and advocate for policies that support the creative sector. As an ecosystem partner, Creative Nigeria brings its extensive network of artists, designers, filmmakers, musicians, and tech creatives to SynergyCon 2026, ensuring representation from all corners of Nigeria's vibrant creative community.",
    tier: "ecosystem",
    category: "Creative Economy",
    sub_category: "Industry Body",
    contact_email: "hello@creativenigeria.ng",
    featured: true,
    display_order: 10,
    status: "live",
    created_at: "2025-11-20T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-011",
    name: "Lagos Fashion Week",
    logo_url: "/images/lfw.svg",
    website: "https://lagosfashionweek.ng",
    description: "West Africa's premier fashion platform",
    bio: "Lagos Fashion Week (LFW) is West Africa's premier fashion event, showcasing African designers to global audiences. Founded in 2011, LFW has become the launchpad for many successful African fashion brands and a key platform for African fashion on the global stage. As an ecosystem partner, LFW brings its network of designers, models, stylists, and fashion industry professionals to SynergyCon 2026, enriching the Fashion & Film District programming.",
    tier: "ecosystem",
    category: "Fashion",
    sub_category: "Industry Event",
    contact_email: "info@lagosfashionweek.ng",
    featured: true,
    display_order: 11,
    status: "live",
    created_at: "2025-11-22T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-012",
    name: "Nollywood Filmmakers Association",
    logo_url: "/images/nfa.svg",
    website: "https://nollywoodfilmmakers.org",
    description: "Professional body for Nigerian filmmakers",
    bio: "The Nollywood Filmmakers Association represents the interests of filmmakers across Nigeria's thriving movie industry. With Nollywood being the world's second-largest film industry by volume, this partnership brings incredible depth of experience and insight to SynergyCon 2026. Members will participate in panels on film financing, distribution, and the future of African cinema, sharing practical knowledge with the next generation of filmmakers.",
    tier: "ecosystem",
    category: "Film & Entertainment",
    sub_category: "Industry Association",
    contact_email: "info@nollywoodfilmmakers.org",
    featured: true,
    display_order: 12,
    status: "live",
    created_at: "2025-11-25T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-013",
    name: "Society of Nigerian Artists",
    logo_url: "/images/sna.svg",
    website: "https://sna.org.ng",
    description: "Nigeria's foremost visual arts organization",
    bio: "The Society of Nigerian Artists (SNA) is Nigeria's foremost organization for visual artists, established to promote and protect the interests of artists in Nigeria. With chapters across the country, SNA represents painters, sculptors, digital artists, and mixed media artists. As an ecosystem partner, SNA brings its network of established and emerging artists to the Arts, Sculpture & Design District at SynergyCon 2026.",
    tier: "ecosystem",
    category: "Visual Arts",
    sub_category: "Professional Society",
    contact_email: "info@sna.org.ng",
    featured: false,
    display_order: 13,
    status: "live",
    created_at: "2025-11-28T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-014",
    name: "MUSON Centre",
    logo_url: "/images/muson.svg",
    website: "https://muson.org",
    description: "Nigeria's premier center for music education and performance",
    bio: "The Musical Society of Nigeria (MUSON) Centre is Nigeria's premier institution for music education and performance. Home to the MUSON School of Music and the iconic MUSON Centre performance venues, the organization has been instrumental in developing classical and contemporary music talent in Nigeria. As an ecosystem partner, MUSON brings its expertise in music education and performance to SynergyCon 2026.",
    tier: "ecosystem",
    category: "Music",
    sub_category: "Education & Performance",
    contact_email: "info@muson.org",
    featured: false,
    display_order: 14,
    status: "live",
    created_at: "2025-12-01T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-015",
    name: "Gaming Nigeria",
    logo_url: "/images/gaming-nigeria.svg",
    website: "https://gamingnigeria.com",
    description: "Nigeria's leading gaming and esports community",
    bio: "Gaming Nigeria is the leading platform for gaming and esports in Nigeria, connecting gamers, game developers, and esports enthusiasts across the country. The organization hosts tournaments, provides resources for game developers, and advocates for the growth of the gaming industry in Nigeria. As an ecosystem partner, Gaming Nigeria brings its vibrant community to the Tech & Gaming District at SynergyCon 2026.",
    tier: "ecosystem",
    category: "Gaming & Esports",
    sub_category: "Community Platform",
    contact_email: "hello@gamingnigeria.com",
    featured: true,
    display_order: 15,
    status: "live",
    created_at: "2025-12-03T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },

  // ============================================
  // TECHNOLOGY PARTNERS
  // ============================================
  {
    id: "partner-016",
    name: "Paystack",
    logo_url: "/images/paystack.svg",
    website: "https://paystack.com",
    description: "Africa's leading payments technology company",
    bio: "Paystack is Africa's leading payments technology company, helping businesses accept payments from anyone, anywhere. Acquired by Stripe in 2020, Paystack powers payments for over 200,000 businesses across Africa. As a technology partner, Paystack powers all ticket sales and payments for SynergyCon 2026, ensuring seamless, secure transactions for attendees. They will also be sharing insights on fintech innovation in the creative economy.",
    tier: "technology",
    category: "Fintech",
    sub_category: "Payments",
    contact_email: "hello@paystack.com",
    featured: true,
    display_order: 16,
    status: "live",
    created_at: "2025-12-05T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-017",
    name: "Flutterwave",
    logo_url: "/images/flutterwave.svg",
    website: "https://flutterwave.com",
    description: "Africa's leading payments technology company",
    bio: "Flutterwave is a leading African payments technology company that enables businesses and individuals to make and receive payments from anywhere in the world. With a valuation of over $3 billion, Flutterwave represents the pinnacle of African tech success. As a technology partner, Flutterwave brings its expertise in scaling tech businesses and will host sessions on payment innovation and building technology companies in Africa.",
    tier: "technology",
    category: "Fintech",
    sub_category: "Payments",
    contact_email: "hi@flutterwave.com",
    featured: true,
    display_order: 17,
    status: "live",
    created_at: "2025-12-07T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-018",
    name: "Vercel",
    logo_url: "/images/vercel.svg",
    website: "https://vercel.com",
    description: "Frontend cloud platform for developers",
    bio: "Vercel is the leading frontend cloud platform, enabling developers to build and deploy websites and applications with speed and scale. As the creators of Next.js, Vercel powers some of the world's largest websites. As a technology partner, Vercel hosts the SynergyCon 2026 website and provides developer-focused content on building modern web applications for creative businesses.",
    tier: "technology",
    category: "Cloud & Infrastructure",
    sub_category: "Hosting Platform",
    contact_email: "hello@vercel.com",
    featured: false,
    display_order: 18,
    status: "live",
    created_at: "2025-12-08T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-019",
    name: "Audiomack",
    logo_url: "/images/audiomack.svg",
    website: "https://audiomack.com",
    description: "Free music streaming and discovery platform",
    bio: "Audiomack is a free music streaming and discovery platform that has become incredibly popular in Africa, particularly for African music. The platform provides a space for artists to upload, share, and monetize their music, with a massive user base in Nigeria and across the continent. As a technology partner, Audiomack brings insights on music distribution, streaming economics, and artist empowerment in the digital age.",
    tier: "technology",
    category: "Music Technology",
    sub_category: "Streaming Platform",
    contact_email: "partnerships@audiomack.com",
    featured: true,
    display_order: 19,
    status: "live",
    created_at: "2025-12-10T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-020",
    name: "Boomplay",
    logo_url: "/images/boomplay.svg",
    website: "https://www.boomplay.com",
    description: "Africa's biggest music streaming platform",
    bio: "Boomplay is Africa's biggest music streaming platform with over 100 million users across the continent. The platform offers African music to global audiences and has become a key distribution channel for African artists. As a technology partner, Boomplay brings its expertise in music technology, artist services, and the business of music streaming to SynergyCon 2026.",
    tier: "technology",
    category: "Music Technology",
    sub_category: "Streaming Platform",
    contact_email: "info@boomplay.com",
    featured: true,
    display_order: 20,
    status: "live",
    created_at: "2025-12-12T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },

  // ============================================
  // VENUE PARTNERS
  // ============================================
  {
    id: "partner-021",
    name: "National Theatre",
    logo_url: "/images/national-theatre.svg",
    website: "https://nationaltheatre.ng",
    description: "Nigeria's premier arts and culture venue",
    bio: "The National Theatre in Iganmu, Lagos is Nigeria's most iconic cultural landmark and the official venue for SynergyCon 2026. Built in 1976 to host FESTAC '77, the National Theatre has been the heart of Nigerian arts and culture for nearly 50 years. Its distinctive hat-shaped structure houses multiple performance halls, galleries, and exhibition spaces that will be transformed into the four creative districts for this landmark event.",
    tier: "venue",
    category: "Event Venue",
    sub_category: "Cultural Centre",
    contact_email: "info@nationaltheatre.ng",
    featured: true,
    display_order: 21,
    status: "live",
    created_at: "2025-12-14T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-022",
    name: "Radisson Blu Anchorage Hotel",
    logo_url: "/images/radisson.svg",
    website: "https://www.radissonhotels.com/lagos",
    description: "Luxury hotel and hospitality partner",
    bio: "Radisson Blu Anchorage Hotel Lagos is a luxury waterfront hotel located in Victoria Island, Lagos. As the official hospitality partner for SynergyCon 2026, Radisson Blu offers exclusive accommodation packages for VIP attendees and speakers, providing world-class comfort and convenient access to the event venue. Their expertise in hosting high-profile events ensures a premium experience for international guests.",
    tier: "venue",
    category: "Hospitality",
    sub_category: "Hotel",
    contact_email: "events@radissonblu.com",
    featured: true,
    display_order: 22,
    status: "live",
    created_at: "2025-12-16T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },

  // ============================================
  // CREATIVE PARTNERS
  // ============================================
  {
    id: "partner-023",
    name: "Lagos Photo Festival",
    logo_url: "/images/lagos-photo.svg",
    website: "https://lagosphoto.com",
    description: "West Africa's premier photography festival",
    bio: "Lagos Photo Festival is West Africa's largest annual international arts festival of photography. Since 2010, the festival has showcased contemporary photography from Africa and the diaspora, while also providing educational programs for emerging photographers. As a creative partner, Lagos Photo Festival brings its expertise in visual arts curation and will contribute to the Arts, Sculpture & Design District programming.",
    tier: "creative",
    category: "Photography",
    sub_category: "Festival & Exhibition",
    contact_email: "info@lagosphoto.com",
    featured: true,
    display_order: 23,
    status: "live",
    created_at: "2025-12-18T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-024",
    name: "Terra Kulture",
    logo_url: "/images/terra-kulture.svg",
    website: "https://terrakulture.com",
    description: "Nigeria's premier arts and culture centre",
    bio: "Terra Kulture is Nigeria's leading arts and culture centre, featuring an art gallery, bookshop, restaurant, and performance theatre. For over two decades, Terra Kulture has been a hub for Nigerian arts, hosting exhibitions, theatrical productions, and cultural events. As a creative partner, Terra Kulture brings its experience in arts programming and its network of Nigerian artists and performers to SynergyCon 2026.",
    tier: "creative",
    category: "Arts & Culture",
    sub_category: "Cultural Centre",
    contact_email: "info@terrakulture.com",
    featured: true,
    display_order: 24,
    status: "live",
    created_at: "2025-12-20T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-025",
    name: "ArtX Lagos",
    logo_url: "/images/artx.svg",
    website: "https://artxlagos.com",
    description: "West Africa's premier art fair",
    bio: "ArtX Lagos is West Africa's premier international art fair, bringing together galleries, artists, collectors, and art enthusiasts from across the globe. The annual fair showcases contemporary African art and has become a key event in the global art calendar. As a creative partner, ArtX Lagos brings its curatorial expertise and network of galleries and collectors to enhance the art programming at SynergyCon 2026.",
    tier: "creative",
    category: "Visual Arts",
    sub_category: "Art Fair",
    contact_email: "hello@artxlagos.com",
    featured: true,
    display_order: 25,
    status: "live",
    created_at: "2025-12-22T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },

  // ============================================
  // COMMUNITY PARTNERS
  // ============================================
  {
    id: "partner-026",
    name: "Google Developers Lagos",
    logo_url: "/images/gdg-lagos.svg",
    website: "https://gdg.community.dev/gdg-lagos",
    description: "Lagos chapter of Google Developer Groups",
    bio: "Google Developer Groups (GDG) Lagos is a vibrant community of developers passionate about Google technologies. The group hosts regular meetups, workshops, and hackathons, fostering a culture of learning and collaboration among tech enthusiasts in Lagos. As a community partner, GDG Lagos brings its network of developers and tech enthusiasts to the Tech & Gaming District at SynergyCon 2026.",
    tier: "community",
    category: "Technology",
    sub_category: "Developer Community",
    contact_email: "gdglagos@gmail.com",
    featured: false,
    display_order: 26,
    status: "live",
    created_at: "2025-12-24T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-027",
    name: "She Code Africa",
    logo_url: "/images/sca.svg",
    website: "https://shecodeafrica.org",
    description: "A non-profit organization focused on celebrating and empowering women in tech across Africa",
    bio: "She Code Africa is a non-profit organization dedicated to celebrating and empowering young girls and women in technology across Africa. Through mentorship programs, bootcamps, and community events, She Code Africa has impacted thousands of women in tech across the continent. As a community partner, they bring their mission of diversity and inclusion to SynergyCon 2026, ensuring women are well-represented in tech and creative sessions.",
    tier: "community",
    category: "Technology",
    sub_category: "Women in Tech",
    contact_email: "info@shecodeafrica.org",
    featured: true,
    display_order: 27,
    status: "live",
    created_at: "2025-12-26T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-028",
    name: "Founders' Forum Africa",
    logo_url: "/images/ffa.svg",
    website: "https://foundersforum.africa",
    description: "Network of Africa's most successful entrepreneurs",
    bio: "Founders' Forum Africa is an exclusive network of Africa's most successful technology and creative entrepreneurs. The organization connects founders for peer learning, collaboration, and investment opportunities. As a community partner, Founders' Forum Africa brings its network of successful founders to mentor and inspire the next generation of creative economy entrepreneurs at SynergyCon 2026.",
    tier: "community",
    category: "Entrepreneurship",
    sub_category: "Founder Network",
    contact_email: "africa@ff.co",
    featured: true,
    display_order: 28,
    status: "live",
    created_at: "2025-12-28T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-029",
    name: "Lagos Creative Industries Cluster",
    logo_url: "/images/lcic.svg",
    website: "https://lagoscreative.ng",
    description: "Hub connecting creative businesses in Lagos",
    bio: "Lagos Creative Industries Cluster is a hub connecting creative businesses, freelancers, and entrepreneurs across Lagos. The organization provides co-working spaces, business support services, and networking opportunities for creatives. As a community partner, LCIC brings its grassroots network of creative entrepreneurs and small businesses to SynergyCon 2026, ensuring representation from all levels of the creative economy.",
    tier: "community",
    category: "Creative Economy",
    sub_category: "Business Hub",
    contact_email: "hello@lagoscreative.ng",
    featured: false,
    display_order: 29,
    status: "live",
    created_at: "2025-12-30T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  },
  {
    id: "partner-030",
    name: "Pan-Atlantic University Enterprise Development Centre",
    logo_url: "/images/pau-edc.svg",
    website: "https://pau.edu.ng/edc",
    description: "Premier entrepreneurship education and support centre",
    bio: "The Enterprise Development Centre at Pan-Atlantic University is Nigeria's premier centre for entrepreneurship education and business development support. The centre has trained thousands of entrepreneurs and provided incubation services for innovative startups. As a community partner, PAU-EDC brings its expertise in entrepreneurship education and its network of alumni entrepreneurs to SynergyCon 2026.",
    tier: "community",
    category: "Education",
    sub_category: "Entrepreneurship Centre",
    contact_email: "edc@pau.edu.ng",
    featured: false,
    display_order: 30,
    status: "live",
    created_at: "2026-01-02T10:00:00.000Z",
    updated_at: "2026-01-29T00:00:00.000Z"
  }
]

// Helper function to get partners by tier
export function getPartnersByTier(tier: PartnerData['tier']): PartnerData[] {
  return PARTNERS_DATA.filter(partner => partner.tier === tier && partner.status === 'live')
}

// Helper function to get featured partners
export function getFeaturedPartners(): PartnerData[] {
  return PARTNERS_DATA.filter(partner => partner.featured && partner.status === 'live')
}

// Helper function to get partners by category
export function getPartnersByCategory(category: string): PartnerData[] {
  return PARTNERS_DATA.filter(partner => partner.category === category && partner.status === 'live')
}

// Partner statistics
export const PARTNER_STATS = {
  total: PARTNERS_DATA.length,
  strategic: PARTNERS_DATA.filter(p => p.tier === 'strategic').length,
  media: PARTNERS_DATA.filter(p => p.tier === 'media').length,
  ecosystem: PARTNERS_DATA.filter(p => p.tier === 'ecosystem').length,
  technology: PARTNERS_DATA.filter(p => p.tier === 'technology').length,
  venue: PARTNERS_DATA.filter(p => p.tier === 'venue').length,
  creative: PARTNERS_DATA.filter(p => p.tier === 'creative').length,
  community: PARTNERS_DATA.filter(p => p.tier === 'community').length,
  featured: PARTNERS_DATA.filter(p => p.featured).length,
}

export type PartnerId = typeof PARTNERS_DATA[number]['id']
