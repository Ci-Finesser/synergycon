"use client"

import { Play, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { VideoLightbox } from "@/components/video-lightbox"
import { ImageLightbox } from "@/components/image-lightbox"
import { createClient } from "@/lib/supabase/client"
import { getCachedData, setCachedData } from "@/lib/supabase/cache"

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

export function GallerySection() {
  const [lightboxVideo, setLightboxVideo] = useState<string | null>(null)
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null)
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([])
  const [galleryVideos, setGalleryVideos] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGalleryItems = async () => {
      const imageCacheKey = "gallery-images-preview"
      const videoCacheKey = "gallery-videos-preview"

      const cachedImages = getCachedData<GalleryItem[]>(imageCacheKey)
      const cachedVideos = getCachedData<GalleryItem[]>(videoCacheKey)

      if (cachedImages && cachedVideos) {
        setGalleryImages(cachedImages)
        setGalleryVideos(cachedVideos)
        setLoading(false)
        return
      }

      const supabase = createClient()

      const [imagesResult, videosResult] = await Promise.all([
        supabase
          .from("gallery_items")
          .select("*")
          .eq("type", "image")
          .order("display_order", { ascending: true })
          .limit(2),
        supabase
          .from("gallery_items")
          .select("*")
          .eq("type", "video")
          .order("display_order", { ascending: true })
          .limit(2),
      ])

      if (imagesResult.error) {
        // Enhanced error logging for better debugging
        if (imagesResult.error instanceof Error) {
          console.error("Error fetching gallery images:", imagesResult.error.message, imagesResult.error.stack, imagesResult.error);
        } else {
          console.error("Error fetching gallery images:", imagesResult.error, JSON.stringify(imagesResult.error));
        }
      } else if (imagesResult.data) {
        setGalleryImages(imagesResult.data)
        setCachedData(imageCacheKey, imagesResult.data, 10 * 60 * 1000)
      }

      if (videosResult.error) {
        // Enhanced error logging for better debugging
        if (videosResult.error instanceof Error) {
          console.error("Error fetching gallery videos:", videosResult.error.message, videosResult.error.stack, videosResult.error);
        } else {
          console.error("Error fetching gallery videos:", videosResult.error, JSON.stringify(videosResult.error));
        }
      } else if (videosResult.data) {
        setGalleryVideos(videosResult.data)
        setCachedData(videoCacheKey, videosResult.data, 10 * 60 * 1000)
      }

      setLoading(false)
    }

    fetchGalleryItems()
  }, [])

  const getYouTubeId = (url: string): string => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    return match ? match[1] : ""
  }

  const galleryItems = [
    galleryImages[0]
      ? {
          type: "image" as const,
          url: galleryImages[0].media_url,
          alt: galleryImages[0].title,
          category: galleryImages[0].category,
        }
      : null,
    galleryVideos[0]
      ? {
          type: "video" as const,
          youtubeId: getYouTubeId(galleryVideos[0].youtube_url || ""),
          thumbnail: `https://img.youtube.com/vi/${getYouTubeId(galleryVideos[0].youtube_url || "")}/maxresdefault.jpg`,
          title: galleryVideos[0].title,
          category: galleryVideos[0].category,
        }
      : null,
    {
      type: "text" as const,
      title: "A Milestone Event",
      description:
        "SynergyCon 1.0 brought together 500+ creatives, 50+ speakers, and countless opportunities for collaboration and growth.",
      gradient: "from-accent-red/10 to-accent-orange/10",
    },
    galleryVideos[1]
      ? {
          type: "video" as const,
          youtubeId: getYouTubeId(galleryVideos[1].youtube_url || ""),
          thumbnail: `https://img.youtube.com/vi/${getYouTubeId(galleryVideos[1].youtube_url || "")}/maxresdefault.jpg`,
          title: galleryVideos[1].title,
          category: galleryVideos[1].category,
        }
      : null,
    {
      type: "text" as const,
      title: "Building Connections",
      description:
        "Meaningful conversations that sparked partnerships, investments, and collaborations that continue to thrive today.",
      gradient: "from-accent-blue/10 to-accent-purple/10",
    },
    galleryImages[1]
      ? {
          type: "image" as const,
          url: galleryImages[1].media_url,
          alt: galleryImages[1].title,
          category: galleryImages[1].category,
        }
      : null,
  ].filter(Boolean)

  if (loading) {
    return (
      <section id="gallery" className="py-16 md:py-20 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-5 mb-8 md:mb-12 lg:mb-14">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4">
                SynergyCon 1.0 Highlights
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Relive the moments that made our inaugural conference unforgettable.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="gallery" className="py-16 md:py-20 px-4 md:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-5 mb-8 md:mb-12 lg:mb-14">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4">
              SynergyCon 1.0 Highlights
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Relive the moments that made our inaugural conference unforgettable.
            </p>
          </div>
          <a
            href="/gallery"
            className="group inline-flex items-center justify-center h-auto px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base rounded-md font-medium bg-background border-2 border-gray-300 hover:bg-gray-50 transition-all"
          >
            View Full Gallery
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {galleryItems.filter((item): item is NonNullable<typeof item> => item !== null).map((item, index) => (
            <div key={index}>
              {item.type === "text" && (
                <div
                  className={`relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br ${item.gradient} border border-border flex items-center justify-center p-5 sm:p-6`}
                >
                  <div className="text-center space-y-2 sm:space-y-3">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-balance">{item.title}</h3>
                    <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{item.description}</p>
                  </div>
                </div>
              )}

              {item.type === "image" && (
                <div
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted cursor-pointer"
                  onClick={() => setLightboxImage({ src: item.url || "", alt: item.alt })}
                >
                  <img
                    src={item.url || "/placeholder.svg"}
                    alt={item.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}

              {item.type === "video" && (
                <div
                  onClick={() => setLightboxVideo(item.youtubeId)}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted cursor-pointer"
                >
                  <img
                    src={item.thumbnail || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 sm:w-8 sm:h-8 text-foreground ml-1" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                    <div className="text-xs font-medium mb-1 sm:mb-2 opacity-80">{item.category}</div>
                    <div className="text-base sm:text-lg font-bold">{item.title}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {lightboxVideo && <VideoLightbox youtubeId={lightboxVideo} onClose={() => setLightboxVideo(null)} />}
      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage.src || "/placeholder.svg"}
          alt={lightboxImage.alt}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </section>
  )
}
