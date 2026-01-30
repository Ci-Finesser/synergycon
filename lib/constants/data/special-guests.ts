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
    "company": "Horizon Ventures Nigeria",
    "image": "https://randomuser.me/api/portraits/women/44.jpg",
    "bio": "Adaeze Okonkwo is a visionary tech entrepreneur who has built and scaled multiple startups across Nigeria. With over 15 years of experience in the technology sector, she has invested in more than 50 early-stage companies and mentored hundreds of founders. Her fund, Horizon Ventures Nigeria, focuses on empowering the next generation of Nigerian innovators. She is passionate about closing the gender gap in tech and has launched initiatives that have trained over 10,000 women in coding and entrepreneurship.",
    "short_bio": "Visionary tech investor empowering the next generation of Nigerian innovators.",
    "achievements": [
      "Founded 3 successful tech startups",
      "Invested in 50+ Nigerian companies",
      "Forbes Nigeria 30 Under 30 Alumna",
      "Trained 10,000+ women in tech"
    ],
    "session_title": "The Future of Tech Investment in Nigeria",
    "session_date": "March 26, 2026",
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
    "bio": "Emeka Nwosu is an award-winning creative director who has shaped the visual identity of some of Nigeria's most recognized brands. His work spans advertising, film, and digital media, earning him international recognition including Cannes Lions and One Show awards. Emeka believes in the power of Nigerian storytelling to connect with global audiences and has worked with major international brands looking to authentically engage Nigerian markets.",
    "short_bio": "Award-winning creative director shaping Nigeria's most iconic brand identities.",
    "achievements": [
      "Cannes Lions Award Winner",
      "One Show Gold Pencil",
      "Rebranded 100+ Nigerian companies",
      "TEDx Speaker on Nigerian Creativity"
    ],
    "session_title": "Building Iconic Nigerian Brands",
    "session_date": "March 26, 2026",
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
    "bio": "Fatima Hassan is a pioneering fashion designer known for blending traditional Nigerian textiles with contemporary silhouettes. Her brand, Sahel Couture, has been featured in Vogue, Elle, and has dressed celebrities on red carpets worldwide. Beyond fashion, Fatima is a passionate advocate for sustainable practices in the industry, working with artisan communities across West Nigeria to preserve traditional craftsmanship while providing fair wages.",
    "short_bio": "Pioneering sustainable fashion with traditional Nigerian craftsmanship.",
    "achievements": [
      "Featured in Vogue & Elle Magazine",
      "Dressed 20+ A-list celebrities",
      "Employs 500+ local artisans",
      "UN Sustainability Ambassador"
    ],
    "session_title": "Sustainable Fashion: The Nigerian Advantage",
    "session_date": "March 26, 2026",
    "session_time": "11:00 AM - 12:30 PM",
    "session_venue": "National Theatre - Fashion Stage",
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
    "bio": "Chidi Amaechi is a renowned film director whose works have premiered at major international film festivals including Toronto, Sundance, and Cannes. His storytelling captures the complexity of Nigerian experiences with cinematic brilliance. With over two decades in the industry, Chidi has directed 25+ feature films and mentored a new generation of Nigerian filmmakers. He is currently developing Nigeria's largest film production hub.",
    "short_bio": "Acclaimed filmmaker bringing Nigerian stories to the global stage.",
    "achievements": [
      "25+ Feature Films Directed",
      "Toronto Film Festival Selection",
      "Nigeria Movie Academy Award Winner",
      "Mentored 200+ filmmakers"
    ],
    "session_title": "Nigerian Cinema: Beyond Borders",
    "session_date": "March 26, 2026",
    "session_time": "3:00 PM - 4:30 PM",
    "session_venue": "National Theatre - Cinema Hall",
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
    "bio": "Ngozi Eze is a Grammy-nominated music producer who has worked with top artists across Afrobeats, R&B, and Hip-Hop. Her production style seamlessly blends traditional Nigerian rhythms with modern sounds, creating chart-topping hits. She runs SoundWave Studios, one of Nigeria's premier recording facilities, and is dedicated to developing the technical skills of upcoming producers through her annual masterclass series.",
    "short_bio": "Grammy-nominated producer crafting the future of Nigerian music.",
    "achievements": [
      "Grammy Nomination for Best Nigerian Album",
      "Produced 50+ Gold/Platinum records",
      "Trained 500+ upcoming producers",
      "Built Nigeria's top recording studio"
    ],
    "session_title": "The Science of Sound: Producing Global Hits",
    "session_date": "March 26, 2026",
    "session_time": "10:00 AM - 11:30 AM",
    "session_venue": "National Theatre - Music Stage",
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
    "bio": "Olumide Johnson is a pioneering game developer who founded AfroGaming Labs, a studio focused on creating games that celebrate Nigerian culture and mythology. His flagship title, \"Kingdoms of Ife,\" has been downloaded over 5 million times globally. Olumide is also a leading voice in the XR (Extended Reality) space, developing immersive experiences that showcase Nigerian heritage. He actively contributes to growing the gaming ecosystem across the continent.",
    "short_bio": "Game developer bringing Nigerian mythology to the digital world.",
    "achievements": [
      "5M+ Game Downloads Worldwide",
      "Unity Certified Developer",
      "Founded Nigeria's largest game studio",
      "XR Nigeria Pioneer Award"
    ],
    "session_title": "Gaming Nigeria: From Stories to Screens",
    "session_date": "March 26, 2026",
    "session_time": "11:00 AM - 12:30 PM",
    "session_venue": "National Theatre - Tech Stage",
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
    "bio": "Amara Obi is an internationally acclaimed visual artist and sculptor whose works have been exhibited at the Smithsonian, Tate Modern, and the Museum of Nigerian Art in Paris. Her large-scale installations explore themes of identity, migration, and cultural preservation. Through the Obi Art Foundation, she provides residencies and grants to emerging Nigerian artists, helping them gain international exposure and develop their craft.",
    "short_bio": "World-renowned sculptor exhibiting at major global museums.",
    "achievements": [
      "Exhibited at Smithsonian & Tate Modern",
      "Installed 15+ public sculptures",
      "Founded arts residency program",
      "Nigerian Artist of the Year 2024"
    ],
    "session_title": "Art as Activism: Sculpting Change",
    "session_date": "March 26, 2026",
    "session_time": "4:00 PM - 5:30 PM",
    "session_venue": "National Theatre - Main Gallery",
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
