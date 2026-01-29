"use client"

import { useState, useCallback } from "react"
import { Star, ExternalLink, Twitter, Linkedin, Instagram, Play, X, Share2, Calendar, MapPin } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { EVENT_NAME, EVENT_YEAR, VENUES, EVENT_DATES } from "@/lib/constants"

// Types
export interface SpecialGuest {
  id: string
  name: string
  title: string
  company?: string
  image: string
  bio: string
  shortBio?: string
  achievements?: string[]
  sessionTitle?: string
  sessionDate?: string
  sessionTime?: string
  sessionVenue?: string
  videoUrl?: string
  websiteUrl?: string
  socials?: {
    twitter?: string
    linkedin?: string
    instagram?: string
  }
  tags?: string[]
  featured?: boolean
}

// Sample data - replace with API call or props
const sampleGuests: SpecialGuest[] = [
  {
    id: "1",
    name: "Adaeze Okonkwo",
    title: "Tech Entrepreneur & Investor",
    company: "Horizon Ventures Africa",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Adaeze Okonkwo is a visionary tech entrepreneur who has built and scaled multiple startups across Africa. With over 15 years of experience in the technology sector, she has invested in more than 50 early-stage companies and mentored hundreds of founders. Her fund, Horizon Ventures Africa, focuses on empowering the next generation of African innovators. She is passionate about closing the gender gap in tech and has launched initiatives that have trained over 10,000 women in coding and entrepreneurship.",
    shortBio: "Visionary tech investor empowering the next generation of African innovators.",
    achievements: [
      "Founded 3 successful tech startups",
      "Invested in 50+ African companies",
      "Forbes Africa 30 Under 30 Alumna",
      "Trained 10,000+ women in tech"
    ],
    sessionTitle: "The Future of Tech Investment in Africa",
    sessionDate: EVENT_DATES.datesAnnounced ? "Day 1" : "Day 1 (Date TBA)",
    sessionTime: "10:00 AM - 11:30 AM",
    sessionVenue: `${VENUES.nationalTheatre.shortName} - Main Stage`,
    socials: {
      twitter: "https://twitter.com/adaeze_tech",
      linkedin: "https://linkedin.com/in/adaezeokonkwo",
      instagram: "https://instagram.com/adaeze.okonkwo"
    },
    tags: ["Keynote", "Tech", "Investment"],
    featured: true
  },
  {
    id: "2",
    name: "Emeka Nwosu",
    title: "Creative Director & Brand Strategist",
    company: "Pulse Creative Agency",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Emeka Nwosu is an award-winning creative director who has shaped the visual identity of some of Africa's most recognized brands. His work spans advertising, film, and digital media, earning him international recognition including Cannes Lions and One Show awards. Emeka believes in the power of African storytelling to connect with global audiences and has worked with major international brands looking to authentically engage African markets.",
    shortBio: "Award-winning creative director shaping Africa's most iconic brand identities.",
    achievements: [
      "Cannes Lions Award Winner",
      "One Show Gold Pencil",
      "Rebranded 100+ African companies",
      "TEDx Speaker on African Creativity"
    ],
    sessionTitle: "Building Iconic African Brands",
    sessionDate: EVENT_DATES.datesAnnounced ? "Day 1" : "Day 1 (Date TBA)",
    sessionTime: "2:00 PM - 3:30 PM",
    sessionVenue: `${VENUES.nationalTheatre.shortName} - Main Stage`,
    videoUrl: "https://youtube.com/watch?v=example",
    socials: {
      twitter: "https://twitter.com/emeka_creates",
      instagram: "https://instagram.com/emekanwosu"
    },
    tags: ["Branding", "Design", "Strategy"],
    featured: true
  },
  {
    id: "3",
    name: "Fatima Hassan",
    title: "Fashion Designer & Sustainability Advocate",
    company: "Sahel Couture",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    bio: "Fatima Hassan is a pioneering fashion designer known for blending traditional African textiles with contemporary silhouettes. Her brand, Sahel Couture, has been featured in Vogue, Elle, and has dressed celebrities on red carpets worldwide. Beyond fashion, Fatima is a passionate advocate for sustainable practices in the industry, working with artisan communities across West Africa to preserve traditional craftsmanship while providing fair wages.",
    shortBio: "Pioneering sustainable fashion with traditional African craftsmanship.",
    achievements: [
      "Featured in Vogue & Elle Magazine",
      "Dressed 20+ A-list celebrities",
      "Employs 500+ local artisans",
      "UN Sustainability Ambassador"
    ],
    sessionTitle: "Sustainable Fashion: The African Way",
    sessionDate: EVENT_DATES.datesAnnounced ? "Day 2" : "Day 2 (Date TBA)",
    sessionTime: "10:00 AM - 11:30 AM",
    sessionVenue: `${VENUES.royalBox.shortName} - Workshop Hall`,
    socials: {
      instagram: "https://instagram.com/sahelcouture",
      twitter: "https://twitter.com/fatimahassan"
    },
    tags: ["Fashion", "Sustainability", "Craftsmanship"],
    featured: false
  },
  {
    id: "4",
    name: "Chidi Amaechi",
    title: "Film Producer & Director",
    company: "Lagos Film Collective",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    bio: "Chidi Amaechi is a critically acclaimed filmmaker whose works have premiered at major international film festivals including Toronto, Sundance, and Berlin. His films explore themes of identity, migration, and the African diaspora experience. Chidi is committed to developing the African film industry, having established a film school in Lagos that has trained over 200 emerging filmmakers. His latest project secured distribution deals across 40 countries.",
    shortBio: "Acclaimed filmmaker bringing African stories to the global stage.",
    achievements: [
      "Sundance Film Festival Official Selection",
      "Africa Movie Academy Award Winner",
      "Founded Lagos Film School",
      "Films distributed in 40+ countries"
    ],
    sessionTitle: "African Cinema's Global Moment",
    sessionDate: EVENT_DATES.datesAnnounced ? "Day 2" : "Day 2 (Date TBA)",
    sessionTime: "2:00 PM - 3:30 PM",
    sessionVenue: `${VENUES.royalBox.shortName} - Cinema Hall`,
    videoUrl: "https://youtube.com/watch?v=example2",
    socials: {
      twitter: "https://twitter.com/chidifilms",
      instagram: "https://instagram.com/chidiamaechi"
    },
    tags: ["Film", "Entertainment", "Storytelling"],
    featured: false
  },
  {
    id: "5",
    name: "Amina Diallo",
    title: "Music Producer & Label Executive",
    company: "Afrowave Records",
    image: "https://randomuser.me/api/portraits/women/63.jpg",
    bio: "Amina Diallo is a trailblazing music producer who has worked behind the scenes on some of the biggest Afrobeats and Afropop hits of the last decade. As founder of Afrowave Records, she has discovered and developed numerous platinum-selling artists. Amina is known for her innovative approach to music production, blending traditional African rhythms with modern electronic sounds. She is also an advocate for fair royalty structures and artist rights in the African music industry.",
    shortBio: "Hitmaker behind the Afrobeats revolution and champion of artist rights.",
    achievements: [
      "Produced 15+ platinum records",
      "Discovered 8 Grammy-nominated artists",
      "Billboard Top 100 producer",
      "Music industry rights advocate"
    ],
    sessionTitle: "The Business of African Music",
    sessionDate: EVENT_DATES.datesAnnounced ? "Day 3" : "Day 3 (Date TBA)",
    sessionTime: "10:00 AM - 11:30 AM",
    sessionVenue: `${VENUES.lionWonderArena.shortName} - Main Stage`,
    socials: {
      twitter: "https://twitter.com/aminadiallo",
      instagram: "https://instagram.com/afrowaveamina"
    },
    tags: ["Music", "Business", "Production"],
    featured: false
  },
  {
    id: "6",
    name: "Olumide Adebayo",
    title: "Digital Art Pioneer & NFT Curator",
    company: "ArtBlock Lagos",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
    bio: "Olumide Adebayo is at the forefront of Africa's digital art revolution. As a visual artist and technologist, he has created groundbreaking works that have sold for record prices in the NFT space. His gallery, ArtBlock Lagos, is the first dedicated digital art space in West Africa, showcasing works from emerging African digital artists. Olumide's mission is to democratize art ownership and provide African artists with new revenue streams through blockchain technology.",
    shortBio: "Leading Africa's digital art revolution through blockchain and NFTs.",
    achievements: [
      "NFT sales exceeding $2M",
      "Founded first African NFT gallery",
      "Exhibited at Art Basel Miami",
      "Mentored 100+ digital artists"
    ],
    sessionTitle: "Digital Art & The New Creative Economy",
    sessionDate: EVENT_DATES.datesAnnounced ? "Day 3" : "Day 3 (Date TBA)",
    sessionTime: "2:00 PM - 3:30 PM",
    sessionVenue: `${VENUES.jRandleCentre.shortName} - Innovation Hub`,
    socials: {
      twitter: "https://twitter.com/olumide_art",
      instagram: "https://instagram.com/artblocklagos"
    },
    tags: ["Digital Art", "NFT", "Technology"],
    featured: false
  },
  {
    id: "7",
    name: "Zainab Musa",
    title: "Content Creator & Media Entrepreneur",
    company: "AfriTrend Media",
    image: "https://randomuser.me/api/portraits/women/26.jpg",
    bio: "Zainab Musa built a media empire from her bedroom, growing from a content creator to the CEO of AfriTrend Media, a multi-platform media company reaching over 50 million viewers monthly. Her authentic approach to content creation has made her one of Africa's most influential digital voices. Zainab is passionate about helping young Africans monetize their creativity and has launched creator economy programs that have helped thousands turn their passion into profitable careers.",
    shortBio: "From content creator to media mogul with 50M+ monthly viewers.",
    achievements: [
      "50M+ monthly audience reach",
      "Built $10M media company",
      "YouTube Diamond Play Button",
      "Forbes 30 Under 30 Africa"
    ],
    sessionTitle: "Monetizing Your Creativity Online",
    sessionDate: EVENT_DATES.datesAnnounced ? "Day 3" : "Day 3 (Date TBA)",
    sessionTime: "10:00 AM - 11:30 AM",
    sessionVenue: `${VENUES.lionWonderArena.shortName} - Workshop Hall`,
    socials: {
      twitter: "https://twitter.com/zainabmusa",
      instagram: "https://instagram.com/zainab.musa"
    },
    tags: ["Content", "Social Media", "Entrepreneurship"],
    featured: false
  }
]

// Guest Card Component - Compact style similar to SpeakerCard
function GuestCard({ 
  guest, 
  onClick
}: { 
  guest: SpecialGuest
  onClick: () => void
}) {
  const displayTags = guest.tags?.slice(0, 2) || []
  const remainingCount = (guest.tags?.length || 0) - 2

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl border-2 border-foreground overflow-hidden transition-all hover:shadow-lg h-72 md:h-80"
    >
      {/* Guest Image - Square like SpeakerCard */}
      <div className="aspect-square overflow-hidden bg-neutral-100 relative">
        <img
          src={guest.image}
          alt={guest.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Featured Badge */}
        {guest.featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
            <Star className="w-3 h-3 fill-current" />
            Special Guest
          </div>
        )}
      </div>

      {/* Guest Info */}
      <div className="p-5">
        <h3 className="font-bold text-lg mb-0.5 text-balance">{guest.name}</h3>
        <p className="text-sm text-muted-foreground mb-3">{guest.title}</p>

        {/* Tags - Only show 2 with +X more */}
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {displayTags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 text-xs border border-foreground rounded-md font-medium bg-white"
              >
                {tag}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs border border-foreground rounded-md font-medium bg-muted">
                +{remainingCount} more
              </span>
            )}
          </div>
        )}

        {/* Speaking On */}
        {guest.sessionTitle && (
          <div className="flex items-start gap-1.5 mb-4 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold block">Speaking on:</span>
              <span>{guest.sessionTitle}</span>
            </div>
          </div>
        )}

        {/* View Profile Button */}
        <button className="group/btn inline-flex items-center text-sm font-semibold hover:underline">
          View Profile
          <svg
            className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Full Bio Modal Component
function GuestBioModal({
  guest,
  isOpen,
  onClose
}: {
  guest: SpecialGuest | null
  isOpen: boolean
  onClose: () => void
}) {
  const [showVideo, setShowVideo] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    const shareData = {
      title: `${guest?.name} at SynergyCon 2026`,
      text: `Check out ${guest?.name} speaking at SynergyCon 2026!`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      console.error("Error sharing:", err)
    }
  }, [guest])

  if (!guest) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden max-h-[90vh]">
        <VisuallyHidden>
          <DialogTitle>{guest.name} - Special Guest Biography</DialogTitle>
          <DialogDescription>
            Detailed biography and session information for {guest.name}
          </DialogDescription>
        </VisuallyHidden>

        <div className="overflow-y-auto max-h-[90vh]">
          {/* Hero Section */}
          <div className="relative h-64 md:h-80">
            <img
              src={guest.image}
              alt={guest.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            
            {/* Video Play Button */}
            {guest.videoUrl && !showVideo && (
              <button
                onClick={() => setShowVideo(true)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors group"
              >
                <Play className="w-10 h-10 text-white ml-1 group-hover:scale-110 transition-transform" />
              </button>
            )}

            {/* Guest Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-amber-400 font-semibold text-sm">Special Guest</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">{guest.name}</h2>
              <p className="text-white/90 text-lg">{guest.title}</p>
              {guest.company && (
                <p className="text-white/70 text-sm mt-1">{guest.company}</p>
              )}
            </div>

            {/* Actions */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleShare}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                title="Share"
              >
                {copied ? (
                  <span className="text-xs text-white">Copied!</span>
                ) : (
                  <Share2 className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Video Embed */}
          {showVideo && guest.videoUrl && (
            <div className="relative aspect-video bg-black">
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <iframe
                src={guest.videoUrl.replace("watch?v=", "embed/")}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Tags */}
            {guest.tags && guest.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {guest.tags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="px-4 py-1.5 text-sm font-semibold bg-amber-100 text-amber-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Session Details */}
            {guest.sessionTitle && (
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-2 border-amber-200 rounded-2xl p-6">
                <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">Session Details</h3>
                <h4 className="text-xl font-bold mb-4">{guest.sessionTitle}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {guest.sessionDate && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">{guest.sessionDate}</p>
                        {guest.sessionTime && (
                          <p className="text-sm text-muted-foreground">{guest.sessionTime}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {guest.sessionVenue && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">{guest.sessionVenue}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bio */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3">About</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {guest.bio}
              </p>
            </div>

            {/* Achievements */}
            {guest.achievements && guest.achievements.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3">Notable Achievements</h3>
                <ul className="space-y-2">
                  {guest.achievements.map((achievement, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Star className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Social Links */}
            {guest.socials && Object.values(guest.socials).some(Boolean) && (
              <div className="pt-4 border-t">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3">Connect</h3>
                <div className="flex gap-3">
                  {guest.socials.twitter && (
                    <a
                      href={guest.socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-neutral-100 hover:bg-neutral-200 rounded-xl flex items-center justify-center transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {guest.socials.linkedin && (
                    <a
                      href={guest.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-neutral-100 hover:bg-neutral-200 rounded-xl flex items-center justify-center transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {guest.socials.instagram && (
                    <a
                      href={guest.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-neutral-100 hover:bg-neutral-200 rounded-xl flex items-center justify-center transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {guest.websiteUrl && (
                    <a
                      href={guest.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-neutral-100 hover:bg-neutral-200 rounded-xl flex items-center justify-center transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Main Section Component
export function SpecialGuestSection({ 
  guests = sampleGuests,
  title = "Special Guests",
  subtitle = "Meet the extraordinary personalities joining us at SynergyCon 2026"
}: {
  guests?: SpecialGuest[]
  title?: string
  subtitle?: string
}) {
  const [selectedGuest, setSelectedGuest] = useState<SpecialGuest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = (guest: SpecialGuest) => {
    setSelectedGuest(guest)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedGuest(null)
  }

  return (
    <section id="special-guests" className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-b from-amber-50/50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 md:mb-10">
          <div className="flex items-center justify-between">
            <div className="text-center mx-auto">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Star className="w-4 h-4 fill-current" />
                Featured Appearances
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2">
                {title}
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
                {subtitle}
              </p>
            </div>
            <a
              href="/speakers?category=Special%20Guest"
              className="hidden md:inline-flex items-center text-sm font-semibold hover:underline"
            >
              View All Special Guests
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4">
            {guests.map((guest) => (
              <div key={guest.id} className="w-64 md:w-72 flex-shrink-0">
                <GuestCard guest={guest} onClick={() => handleOpenModal(guest)} />
              </div>
            ))}
          </div>
        </div>

        <GuestBioModal guest={selectedGuest} isOpen={isModalOpen} onClose={handleCloseModal} />
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}
