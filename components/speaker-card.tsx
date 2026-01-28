import { Calendar } from "lucide-react"
import { SpeakerBioModal } from "./speaker-bio-modal"
import type { Speaker } from '@/types/components'

// Re-export for backward compatibility
export type { Speaker }

export function SpeakerCard({ speaker, tags }: { speaker: Speaker; tags?: string[] }) {
  const displayTags = tags?.slice(0, 2) || []
  const remainingCount = (tags?.length || 0) - 2

  return (
    <div className="group bg-white rounded-2xl border-2 border-foreground overflow-hidden transition-all hover:shadow-lg">
      {/* Speaker Image */}
      <div className="aspect-square overflow-hidden bg-neutral-100">
        <img src={speaker.image_url || "/placeholder.svg"} alt={speaker.name} className="w-full h-full object-cover" />
      </div>

      {/* Speaker Info */}
      <div className="p-5">
        <h3 className="font-bold text-lg mb-0.5 text-balance">{speaker.name}</h3>
        <p className="text-sm text-muted-foreground mb-3">{speaker.title}</p>

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
        {speaker.topic && (
          <div className="flex items-start gap-1.5 mb-4 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold block">Speaking on:</span>
              <span>{speaker.topic}</span>
            </div>
          </div>
        )}

        {/* View Bio Button */}
        <SpeakerBioModal
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
          <button className="group/btn inline-flex items-center text-sm font-semibold hover:underline">
            View Bio
            <svg
              className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </SpeakerBioModal>
      </div>
    </div>
  )
}
