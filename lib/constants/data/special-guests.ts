/**
 * SpecialGuest Data Constants
 * 
 * Auto-generated from database by sync-db-to-constants.ts
 * Edit this file and run db:seed to push changes back to the database.
 * 
 * Last synced: 2026-01-20T07:25:43.556Z
 */

export interface SpecialGuestData {
  id: string
  name: string
  title: string | null
  image_url: string | null
  category: string | null
  description: string | null
  social_links: Record<string, string> | null
  display_order: number
  is_featured: boolean
  created_at: string
  updated_at: string
}

export const SPECIAL_GUESTS_DATA = [
  {
    "id": "ed1b9e31-b786-4a5f-a283-17259c9250bd",
    "name": "Adaeze Okonkwo",
    "title": "Tech Entrepreneur & Investor",
    "company": "Horizon Ventures Africa",
    "image": "https://randomuser.me/api/portraits/women/44.jpg",
    "bio": "Adaeze Okonkwo is a visionary tech entrepreneur who has built and scaled multiple startups across Africa. With over 15 years of experience in the technology sector, she has invested in more than 50 early-stage companies and mentored hundreds of founders. Her fund, Horizon Ventures Africa, focuses on empowering the next generation of African innovators. She is passionate about closing the gender gap in tech and has launched initiatives that have trained over 10,000 women in coding and entrepreneurship.",
    "short_bio": "Visionary tech investor empowering the next generation of African innovators.",
    "achievements": [
      "Founded 3 successful tech startups",
      "Invested in 50+ African companies",
      "Forbes Africa 30 Under 30 Alumna",
      "Trained 10,000+ women in tech"
    ],
    "session_title": "The Future of Tech Investment in Africa",
    "session_date": "Day 1 (Date TBA)",
    "session_time": "10:00 AM - 11:30 AM",
    "session_venue": "National Theatre - Main Stage",
    "video_url": null,
    "website_url": null,
    "socials": {
      "twitter": "https://twitter.com/adaeze_tech",
      "linkedin": "https://linkedin.com/in/adaezeokonkwo",
      "instagram": "https://instagram.com/adaeze.okonkwo"
    },
    "tags": [
      "Keynote",
      "Tech",
      "Investment"
    ],
    "featured": true,
    "display_order": 1,
    "is_active": true,
    "created_at": "2026-01-20T07:00:00.021794+00:00",
    "updated_at": "2026-01-20T07:00:00.021794+00:00"
  },
  {
    "id": "52a702dc-8ed0-4611-8701-85d2ba822adf",
    "name": "Emeka Nwosu",
    "title": "Creative Director & Brand Strategist",
    "company": "Pulse Creative Agency",
    "image": "https://randomuser.me/api/portraits/men/32.jpg",
    "bio": "Emeka Nwosu is an award-winning creative director who has shaped the visual identity of some of Africa's most recognized brands. His work spans advertising, film, and digital media, earning him international recognition including Cannes Lions and One Show awards. Emeka believes in the power of African storytelling to connect with global audiences and has worked with major international brands looking to authentically engage African markets.",
    "short_bio": "Award-winning creative director shaping Africa's most iconic brand identities.",
    "achievements": [
      "Cannes Lions Award Winner",
      "One Show Gold Pencil",
      "Rebranded 100+ African companies",
      "TEDx Speaker on African Creativity"
    ],
    "session_title": "Building Iconic African Brands",
    "session_date": "Day 1 (Date TBA)",
    "session_time": "2:00 PM - 3:30 PM",
    "session_venue": "National Theatre - Main Stage",
    "video_url": null,
    "website_url": null,
    "socials": {
      "twitter": "https://twitter.com/emeka_creates",
      "instagram": "https://instagram.com/emekanwosu"
    },
    "tags": [
      "Branding",
      "Design",
      "Strategy"
    ],
    "featured": true,
    "display_order": 2,
    "is_active": true,
    "created_at": "2026-01-20T07:00:00.021794+00:00",
    "updated_at": "2026-01-20T07:00:00.021794+00:00"
  },
  {
    "id": "284ce45e-dd66-4b24-98d6-584e8a203f5f",
    "name": "Fatima Hassan",
    "title": "Fashion Designer & Sustainability Advocate",
    "company": "Sahel Couture",
    "image": "https://randomuser.me/api/portraits/women/68.jpg",
    "bio": "Fatima Hassan is a pioneering fashion designer known for blending traditional African textiles with contemporary silhouettes. Her brand, Sahel Couture, has been featured in Vogue, Elle, and has dressed celebrities on red carpets worldwide. Beyond fashion, Fatima is a passionate advocate for sustainable practices in the industry, working with artisan communities across West Africa to preserve traditional craftsmanship while providing fair wages.",
    "short_bio": "Pioneering sustainable fashion with traditional African craftsmanship.",
    "achievements": [
      "Featured in Vogue & Elle Magazine",
      "Dressed 20+ A-list celebrities",
      "Employs 500+ local artisans",
      "UN Sustainability Ambassador"
    ],
    "session_title": "Sustainable Fashion: The African Advantage",
    "session_date": "Day 2 (Date TBA)",
    "session_time": "11:00 AM - 12:30 PM",
    "session_venue": "Royal Box - Fashion Stage",
    "video_url": null,
    "website_url": null,
    "socials": {
      "twitter": "https://twitter.com/sahel_couture",
      "linkedin": "https://linkedin.com/in/fatimahassan",
      "instagram": "https://instagram.com/sahelcouture"
    },
    "tags": [
      "Fashion",
      "Sustainability",
      "Design"
    ],
    "featured": true,
    "display_order": 3,
    "is_active": true,
    "created_at": "2026-01-20T07:00:00.021794+00:00",
    "updated_at": "2026-01-20T07:00:00.021794+00:00"
  },
  {
    "id": "66a825de-dc0a-4a2a-82f8-1546136f3aff",
    "name": "Chidi Amaechi",
    "title": "Film Director & Producer",
    "company": "Nollywood Studios International",
    "image": "https://randomuser.me/api/portraits/men/75.jpg",
    "bio": "Chidi Amaechi is a renowned film director whose works have premiered at major international film festivals including Toronto, Sundance, and Cannes. His storytelling captures the complexity of African experiences with cinematic brilliance. With over two decades in the industry, Chidi has directed 25+ feature films and mentored a new generation of African filmmakers. He is currently developing Africa's largest film production hub.",
    "short_bio": "Acclaimed filmmaker bringing African stories to the global stage.",
    "achievements": [
      "25+ Feature Films Directed",
      "Toronto Film Festival Selection",
      "Africa Movie Academy Award Winner",
      "Mentored 200+ filmmakers"
    ],
    "session_title": "African Cinema: Beyond Borders",
    "session_date": "Day 2 (Date TBA)",
    "session_time": "3:00 PM - 4:30 PM",
    "session_venue": "Royal Box - Cinema Hall",
    "video_url": null,
    "website_url": null,
    "socials": {
      "twitter": "https://twitter.com/chidiamaechi",
      "linkedin": "https://linkedin.com/in/chidiamaechi"
    },
    "tags": [
      "Film",
      "Storytelling",
      "Production"
    ],
    "featured": true,
    "display_order": 4,
    "is_active": true,
    "created_at": "2026-01-20T07:00:00.021794+00:00",
    "updated_at": "2026-01-20T07:00:00.021794+00:00"
  },
  {
    "id": "0f3e2a67-851e-4b3b-b1c3-bd8101811c1f",
    "name": "Ngozi Eze",
    "title": "Music Producer & Sound Engineer",
    "company": "SoundWave Studios",
    "image": "https://randomuser.me/api/portraits/women/33.jpg",
    "bio": "Ngozi Eze is a Grammy-nominated music producer who has worked with top artists across Afrobeats, R&B, and Hip-Hop. Her production style seamlessly blends traditional African rhythms with modern sounds, creating chart-topping hits. She runs SoundWave Studios, one of Africa's premier recording facilities, and is dedicated to developing the technical skills of upcoming producers through her annual masterclass series.",
    "short_bio": "Grammy-nominated producer crafting the future of African music.",
    "achievements": [
      "Grammy Nomination for Best African Album",
      "Produced 50+ Gold/Platinum records",
      "Trained 500+ upcoming producers",
      "Built Africa's top recording studio"
    ],
    "session_title": "The Science of Sound: Producing Global Hits",
    "session_date": "Day 2 (Date TBA)",
    "session_time": "10:00 AM - 11:30 AM",
    "session_venue": "Lion Wonder Arena - Music Stage",
    "video_url": null,
    "website_url": null,
    "socials": {
      "twitter": "https://twitter.com/ngozi_beats",
      "instagram": "https://instagram.com/soundwave_ngozi"
    },
    "tags": [
      "Music",
      "Production",
      "Technology"
    ],
    "featured": true,
    "display_order": 5,
    "is_active": true,
    "created_at": "2026-01-20T07:00:00.021794+00:00",
    "updated_at": "2026-01-20T07:00:00.021794+00:00"
  },
  {
    "id": "974dc655-4962-4354-bcfc-cf2212b61640",
    "name": "Olumide Johnson",
    "title": "Game Developer & XR Pioneer",
    "company": "AfroGaming Labs",
    "image": "https://randomuser.me/api/portraits/men/52.jpg",
    "bio": "Olumide Johnson is a pioneering game developer who founded AfroGaming Labs, a studio focused on creating games that celebrate African culture and mythology. His flagship title, \"Kingdoms of Ife,\" has been downloaded over 5 million times globally. Olumide is also a leading voice in the XR (Extended Reality) space, developing immersive experiences that showcase African heritage. He actively contributes to growing the gaming ecosystem across the continent.",
    "short_bio": "Game developer bringing African mythology to the digital world.",
    "achievements": [
      "5M+ Game Downloads Worldwide",
      "Unity Certified Developer",
      "Founded Africa's largest game studio",
      "XR Africa Pioneer Award"
    ],
    "session_title": "Gaming Africa: From Stories to Screens",
    "session_date": "Day 3 (Date TBA)",
    "session_time": "11:00 AM - 12:30 PM",
    "session_venue": "Lion Wonder Arena - Tech Stage",
    "video_url": null,
    "website_url": null,
    "socials": {
      "twitter": "https://twitter.com/olumide_games",
      "linkedin": "https://linkedin.com/in/olumidejohnson"
    },
    "tags": [
      "Gaming",
      "Tech",
      "XR"
    ],
    "featured": true,
    "display_order": 6,
    "is_active": true,
    "created_at": "2026-01-20T07:00:00.021794+00:00",
    "updated_at": "2026-01-20T07:00:00.021794+00:00"
  },
  {
    "id": "6713779a-bef7-4e44-a8a0-4ae6df195955",
    "name": "Amara Obi",
    "title": "Visual Artist & Sculptor",
    "company": "Obi Art Foundation",
    "image": "https://randomuser.me/api/portraits/women/57.jpg",
    "bio": "Amara Obi is an internationally acclaimed visual artist and sculptor whose works have been exhibited at the Smithsonian, Tate Modern, and the Museum of African Art in Paris. Her large-scale installations explore themes of identity, migration, and cultural preservation. Through the Obi Art Foundation, she provides residencies and grants to emerging African artists, helping them gain international exposure and develop their craft.",
    "short_bio": "World-renowned sculptor exhibiting at major global museums.",
    "achievements": [
      "Exhibited at Smithsonian & Tate Modern",
      "Installed 15+ public sculptures",
      "Founded arts residency program",
      "African Artist of the Year 2024"
    ],
    "session_title": "Art as Activism: Sculpting Change",
    "session_date": "Day 1 (Date TBA)",
    "session_time": "4:00 PM - 5:30 PM",
    "session_venue": "J. Randle Centre - Main Gallery",
    "video_url": null,
    "website_url": null,
    "socials": {
      "twitter": "https://twitter.com/amara_sculpts",
      "instagram": "https://instagram.com/amaraobi_art"
    },
    "tags": [
      "Art",
      "Sculpture",
      "Culture"
    ],
    "featured": true,
    "display_order": 7,
    "is_active": true,
    "created_at": "2026-01-20T07:00:00.021794+00:00",
    "updated_at": "2026-01-20T07:00:00.021794+00:00"
  }
] as const

export type SpecialGuestId = typeof SPECIAL_GUESTS_DATA[number]['id']
