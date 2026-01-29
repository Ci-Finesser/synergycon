"use client"

import { Mic2, ArrowRight } from "lucide-react"
import { SpeakerBioModal } from "./speaker-bio-modal"
import { SpeakersNotice } from "./speakers-notice"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { getCachedData, setCachedData } from "@/lib/supabase/cache"
import type { Speaker } from '@/types/components'

// Re-export for backward compatibility
export type { Speaker }

export function SpeakersSection() {
  const [featuredSpeakers, setFeaturedSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cacheKey = "featured-speakers"
    const cached = getCachedData<Speaker[]>(cacheKey)

    if (cached) {
      setFeaturedSpeakers(cached)
      setLoading(false)
      return
    }

    const supabase = createClient()

    async function fetchFeaturedSpeakers() {
      try {
        const { data, error } = await supabase
          .from("speakers")
          .select("*")
          .eq("featured", true)
          .order("name", { ascending: true })
          .limit(6)

        if (error) throw error
        if (data) {
          setFeaturedSpeakers(data)
          setCachedData(cacheKey, data)
        }
      } catch (error) {
        // Enhanced error logging for better debugging
        if (error instanceof Error) {
          console.error("Error fetching featured speakers:", error.message, error.stack, error);
        } else {
          console.error("Error fetching featured speakers:", error, JSON.stringify(error));
        }
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedSpeakers()
  }, [])

  if (loading) {
    return (
      <section id="speakers" className="py-16 md:py-20 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-6 md:mb-8 lg:mb-10">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4 text-balance">
                Meet Our Speakers
              </h2>
              <p className="text-sm md:text-base text-muted-foreground text-pretty leading-relaxed">
                Learn from visionaries who are shaping Nigeria's creative and digital economy.
              </p>
            </div>
          </div>
          <div className="relative -mx-4 md:mx-0">
            <div className="overflow-x-auto scrollbar-hide px-4 md:px-0 pt-2">
              <div className="flex gap-5 md:gap-6 pb-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-64 md:w-72">
                    <div className="animate-pulse space-y-3">
                      <div className="aspect-square bg-muted rounded-lg" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
      </section>
    )
  }

  return (
    <section id="speakers" className="py-16 md:py-20 px-4 md:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-6 md:mb-8 lg:mb-10">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4 text-balance">
              Voices Shaping the Future
            </h2>
            <p className="text-sm md:text-base text-muted-foreground text-pretty leading-relaxed">
              From Grammy-winning producers to tech unicorn founders, meet the trailblazers who&apos;ll share battle-tested insights on March 27.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/apply-speaker"
              className="inline-flex items-center justify-center h-auto px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base rounded-md font-medium bg-foreground text-background border-2 border-foreground hover:bg-foreground/90 transition-all"
            >
              <Mic2 className="mr-2 w-4 h-4" />
              Apply to Speak
            </a>
            <a
              href="/speakers"
              className="group inline-flex items-center justify-center h-auto px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base rounded-md font-medium bg-background border-2 border-gray-300 hover:bg-gray-50 transition-all"
            >
              View All Speakers
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      <div className="relative -mx-4 md:-mx-6">
        <div className="overflow-x-auto scrollbar-hide pt-2 px-4 md:px-6">
          <div className="flex gap-5 md:gap-6 pb-4">
            {featuredSpeakers.map((speaker) => {
              const roleRaw = speaker.speaker_role ?? speaker.role
              const roleTags = roleRaw ? roleRaw.split(',').map((t) => t.trim()).filter(Boolean) : []
              const tags = [...roleTags, ...([speaker.title, speaker.company].filter(Boolean) as string[])]

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
                  <div className="group flex-shrink-0 w-64 md:w-72 cursor-pointer">
                    <div className="bg-background border-[1.5px] border-foreground rounded-xl p-3.5 md:p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-72 md:h-80 overflow-hidden">
                      {/* Speaker Image */}
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted border-2 border-transparent group-hover:border-foreground transition-all duration-200 mb-2.5">
                        <img
                          src={speaker.image_url || "/placeholder.svg"}
                          alt={speaker.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      {/* Speaker Info */}
                      <div>
                        <h3 className="font-bold text-sm md:text-base text-balance mb-1">{speaker.name}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground text-pretty">{speaker.title}</p>
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
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
                      </div>
                    </div>
                  </div>
                </SpeakerBioModal>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6 md:mt-8 px-4 md:px-6">
        <SpeakersNotice />
      </div>
    </section>
  )
}
