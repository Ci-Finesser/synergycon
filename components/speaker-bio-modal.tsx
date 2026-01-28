import type React from "react"
import { Calendar, Linkedin, Instagram } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import type { SpeakerSocials, Speaker, SpeakerBioModalProps } from '@/types/components'

// Re-export for backward compatibility
export type { Speaker, SpeakerSocials, SpeakerBioModalProps }

export function SpeakerBioModal({ speaker, children, isOpen, onClose }: SpeakerBioModalProps) {
  const displayTitle = speaker.role || speaker.title

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent className="max-w-4xl p-5 md:p-6 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>{speaker.name} - Biography</DialogTitle>
          <DialogDescription>
            Detailed biography and information about {speaker.name}
          </DialogDescription>
        </VisuallyHidden>
        <div className="space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Header with small avatar */}
          <div className="flex items-center gap-3.5">
            {/* Avatar image - 100x100 */}
            <div className="flex-shrink-0 w-25 h-25 rounded-xl overflow-hidden border-2 border-foreground">
              <img
                src={speaker.image || "/placeholder.svg"}
                alt={speaker.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Speaker name and title - vertically centered with avatar */}
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold mb-1 text-balance">{speaker.name}</h2>
              {displayTitle && <p className="text-xs md:text-sm text-muted-foreground font-medium">{displayTitle}</p>}
            </div>
          </div>

          {/* Tags Section */}
          {speaker.tags && speaker.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {speaker.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-2.5 py-0.5 text-xs border-2 border-foreground rounded-md font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Speaking Topic Section */}
          {speaker.speakingOn && (
            <div className="flex items-start gap-2 p-2.5 bg-neutral-50 rounded-lg border-2 border-neutral-200">
              <Calendar className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-foreground" />
              <div className="text-xs">
                <span className="font-bold block mb-0.5">Speaking On</span>
                <span className="text-muted-foreground">{speaker.speakingOn}</span>
              </div>
            </div>
          )}

          {/* Bio content - main focus */}
          <div className="pt-2.5 border-t-2 border-neutral-200">
            <h3 className="text-xs font-bold mb-2.5 uppercase tracking-wider">About</h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed text-pretty">{speaker.bio}</p>
          </div>

          {/* Social Links */}
          {speaker.socials && Object.keys(speaker.socials).length > 0 && (
            <div className="pt-2.5 border-t-2 border-neutral-200">
              <h3 className="text-xs font-bold mb-2.5 uppercase tracking-wider">Connect</h3>
              <div className="flex items-center gap-2">
                {speaker.socials.twitter && (
                  <a
                    href={speaker.socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-label="X (formerly Twitter)">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                )}
                {speaker.socials.linkedin && (
                  <a
                    href={speaker.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {speaker.socials.instagram && (
                  <a
                    href={speaker.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
