"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Calendar, Grid3x3, List, Mic } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SpeakerBioModal } from "@/components/speaker-bio-modal"
import { SpeakersNotice } from "@/components/speakers-notice"
import { createClient } from "@/lib/supabase/client"
import { useSearchParams } from "next/navigation"

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic'

const CATEGORIES = ["Special Guest", "Guest", "Panelist", "Speaker"] as const

type Speaker = {
  id: string
  name: string
  title: string
  company: string | null
  bio: string
  image_url: string | null
  topic: string | null
  linkedin_url: string | null
  twitter_url: string | null
  instagram_url: string | null
  website_url: string | null
  featured: boolean
  event_day: number | null
  tags: string | null
  speaker_role: string | null
}

export default function SpeakersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryFromUrl = searchParams.get("category")

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl ?? "all")
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchSpeakers() {
      try {
        const { data, error } = await supabase
          .from("speakers")
          .select("*")
          .order("display_order", { ascending: true })
          .order("name", { ascending: true })

        if (error) throw error
        setSpeakers(data || [])
      } catch (error) {
        console.error("Error fetching speakers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSpeakers()
  }, [])

  useEffect(() => {
    const fromUrl = searchParams.get("category")
    setSelectedCategory(fromUrl ?? "all")
  }, [searchParams])

  function updateCategory(next: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (next === "all") {
      params.delete("category")
    } else {
      params.set("category", next)
    }
    router.replace(`/speakers?${params.toString()}`, { scroll: false })
    setSelectedCategory(next)
  }

  const categoryGroups = CATEGORIES
    .map((category) => ({
      category,
      speakers: speakers.filter((s) => {
        const raw = s.speaker_role ?? ''
        const roles = raw.split(',').map((t) => t.trim()).filter(Boolean)
        const normalized = roles.length > 0 ? roles : ["Speaker"]
        return normalized.includes(category)
      }),
    }))
    .filter((group) => group.speakers.length > 0)

  const filteredGroups =
    selectedCategory === "all" ? categoryGroups : categoryGroups.filter((g) => g.category === selectedCategory)

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading speakers...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-foreground">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5">
          <Link href="/#speakers">
            <Button variant="ghost" size="sm" className="group -ml-2 rounded-md">
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      <section className="py-6 md:py-8 lg:py-10 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-5 md:mb-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-2.5 md:mb-3 text-balance">
              SynergyCon 2.0 Speakers
            </h1>
            <p className="text-sm md:text-base text-muted-foreground text-pretty leading-relaxed">
              Meet the thought leaders, innovators, and change-makers sharing insights across our three-day festival.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 md:mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => updateCategory("all")}
                className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border-[1.5px] transition-colors ${
                  selectedCategory === "all"
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent border-foreground hover:bg-neutral-50"
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => updateCategory(category)}
                  className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border-[1.5px] transition-colors ${
                    selectedCategory === category
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent border-foreground hover:bg-neutral-50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* View mode toggle */}
            <div className="flex items-center gap-1 border-[1.5px] border-foreground rounded-md p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "grid" ? "bg-foreground text-background" : "hover:bg-neutral-100"
                }`}
                aria-label="Grid view"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "list" ? "bg-foreground text-background" : "hover:bg-neutral-100"
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-10 md:pb-12 lg:pb-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-10">
          {filteredGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <div className="flex items-center gap-2.5 mb-4 md:mb-5">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border border-foreground">
                  {group.category}
                </div>
              </div>

              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 items-start"
                    : "flex flex-col gap-4 md:gap-5"
                }
              >
                {group.speakers.map((speaker) => {
                  const roleRaw = speaker.speaker_role ?? ''
                  const roleTags = roleRaw ? roleRaw.split(',').map((t) => t.trim()).filter(Boolean) : ["Speaker"]
                  const extraTags = speaker.tags ? speaker.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
                  const tags = [...roleTags, ...extraTags]

                  return (
                    <SpeakerBioModal
                      key={speaker.id}
                      speaker={{
                        name: speaker.name,
                        title: speaker.title,
                        bio: speaker.bio,
                        image: speaker.image_url || "/placeholder.svg",
                        tags,
                        speakingOn: speaker.topic || undefined,
                        socials: {
                          twitter: speaker.twitter_url || undefined,
                          linkedin: speaker.linkedin_url || undefined,
                          instagram: speaker.instagram_url || undefined,
                        },
                      }}
                    >
                      <div
                        className={`group cursor-pointer bg-background border-[1.5px] border-foreground rounded-xl p-3.5 md:p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                          viewMode === "list" ? "flex gap-4 items-start" : "flex flex-col"
                        }`}
                      >
                        {/* Speaker Image */}
                        <div
                          className={`relative rounded-lg overflow-hidden bg-muted border-[1.5px] border-transparent group-hover:border-foreground transition-all duration-200 flex-shrink-0 ${
                            viewMode === "list" ? "w-24 h-24" : "w-full aspect-square mb-3"
                          }`}
                        >
                          <img
                            src={speaker.image_url || "/placeholder.svg"}
                            alt={speaker.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-sm md:text-base font-bold mb-1 text-balance">{speaker.name}</h3>
                          <p className="text-xs md:text-sm text-muted-foreground font-medium mb-2.5">{speaker.title}</p>

                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2.5">
                              {tags.slice(0, 2).map((tag, tagIndex) => (
                                <span key={tagIndex} className="px-2 py-0.5 text-xs border border-foreground rounded">
                                  {tag}
                                </span>
                              ))}
                              {tags.length > 2 && (
                                <span className="px-2 py-0.5 text-xs border border-foreground rounded bg-muted">
                                  +{tags.length - 2} more
                                </span>
                              )}
                            </div>
                          )}

                          {speaker.topic && (
                            <div className="flex items-start gap-1.5 mb-2 text-xs md:text-sm font-medium text-muted-foreground">
                              <Calendar className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span className="text-xs">
                                <span className="font-semibold">Speaking on:</span> {speaker.topic}
                              </span>
                            </div>
                          )}

                          <span className="inline-flex items-center gap-1 text-xs md:text-sm font-medium text-foreground group-hover:underline underline-offset-4">
                            View Bio
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </SpeakerBioModal>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="pt-4 md:pt-6">
            <SpeakersNotice />
          </div>
        </div>
      </section>

      <section className="pb-12 md:pb-16 lg:pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-foreground text-background rounded-2xl md:rounded-3xl p-8 md:p-12 lg:p-16 text-center">
            <div className="max-w-3xl mx-auto">
              <Mic className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 md:mb-6" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-balance">
                Share Your Story at SynergyCon 2.0
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-background/80 mb-6 md:mb-8 text-pretty leading-relaxed">
                Are you a leader in Nigeria's creative or digital economy? Apply to join our lineup of speakers and
                inspire the next generation of innovators.
              </p>
              <Link href="/apply-speaker">
                <Button
                  size="lg"
                  className="bg-background text-foreground hover:bg-background/90 h-auto px-6 md:px-8 py-3 md:py-4 text-sm md:text-base rounded-xl"
                >
                  Apply to Become a Speaker
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
