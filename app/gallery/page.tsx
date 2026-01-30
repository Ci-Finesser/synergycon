"use client"

import { useState, useEffect } from "react"
import { Play, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ImageLightbox } from "@/components/image-lightbox"
import { VideoLightbox } from "@/components/video-lightbox"
import { createClient } from "@/lib/supabase/client"
import { GALLERY_ITEMS_DATA } from "@/lib/constants/data/gallery"

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic'

type GalleryItem = {
  id: string
  type: "image" | "video"
  media_url?: string
  youtube_url?: string
  title: string
  description?: string
  category: string
  display_order: number
}

// Fallback data from constants
const FALLBACK_GALLERY_ITEMS: GalleryItem[] = GALLERY_ITEMS_DATA
  .filter((item) => item.is_active)
  .map((item) => ({
    id: item.id,
    type: item.type as "image" | "video",
    media_url: item.media_url ?? undefined,
    youtube_url: item.youtube_url ?? undefined,
    title: item.title,
    description: item.description ?? undefined,
    category: item.category ?? "Highlights",
    display_order: item.display_order,
  }))

export default function GalleryPage() {
  const [filter, setFilter] = useState<string>("all")
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null)
  const [lightboxVideo, setLightboxVideo] = useState<string | null>(null)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGalleryItems = async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("gallery_items")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })

      if (error || !data || data.length === 0) {
        if (error) {
          console.error("Error fetching gallery items:", error)
        }
        // Use fallback data from constants
        setGalleryItems(FALLBACK_GALLERY_ITEMS)
      } else {
        setGalleryItems(data)
      }
      setLoading(false)
    }

    fetchGalleryItems()
  }, [])

  const getYouTubeId = (url: string): string => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    return match ? match[1] : ""
  }

  const categories = [
    { label: "All", value: "all" },
    { label: "Pictures", value: "pictures" },
    { label: "Videos", value: "videos" },
  ]

  const filteredItems =
    filter === "all"
      ? galleryItems
      : filter === "pictures"
        ? galleryItems.filter((item) => item.type === "image")
        : galleryItems.filter((item) => item.type === "video")

  return (
    <main className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 py-3 md:py-4 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="group -ml-2 rounded-md">
              <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      <section className="pt-8 md:pt-12 pb-6 md:pb-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4 text-balance">
              SynergyCon 1.0 Gallery
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-pretty max-w-3xl">
              Browse through photos, videos, and memorable moments from our inaugural conference.
            </p>
          </div>

          {/* Filter */}
          <div className="flex flex-wrap gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={filter === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(category.value)}
                className="rounded-xl"
              >
                {category.label}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Gallery Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <div key={item.id}>
                    {item.type === "image" && (
                      <div
                        className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted cursor-pointer"
                        onClick={() =>
                          setLightboxImage({
                            src: item.media_url || "/placeholder.svg",
                            alt: item.title,
                          })
                        }
                      >
                        <img
                          src={item.media_url || "/placeholder.svg"}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            {item.category && (
                              <div className="text-xs font-medium mb-2 opacity-80">{item.category}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {item.type === "video" && item.youtube_url && (
                      <div
                        onClick={() => setLightboxVideo(getYouTubeId(item.youtube_url!))}
                        className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted cursor-pointer"
                      >
                        <img
                          src={`https://img.youtube.com/vi/${getYouTubeId(item.youtube_url)}/maxresdefault.jpg`}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="w-8 h-8 text-foreground ml-1" fill="currentColor" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <div className="text-lg font-bold">{item.title}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage.src || "/placeholder.svg"}
          alt={lightboxImage.alt}
          onClose={() => setLightboxImage(null)}
        />
      )}

      {lightboxVideo && <VideoLightbox youtubeId={lightboxVideo} onClose={() => setLightboxVideo(null)} />}
    </main>
  )
}
