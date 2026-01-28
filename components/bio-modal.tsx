"use client"

import type React from "react"
import { Globe } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

interface BioModalProps {
  name: string
  role?: string
  title?: string
  bio: string
  image: string
  website?: string | null
  tags?: string[]
  additionalInfo?: string
  children?: React.ReactNode
  isOpen?: boolean
  onClose?: () => void
}

export function BioModal({
  name,
  role,
  title,
  bio,
  image,
  website,
  tags,
  additionalInfo,
  children,
  isOpen,
  onClose,
}: BioModalProps) {
  const displayTitle = role || title

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent className="max-w-4xl p-5 md:p-6 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>{name} - Biography</DialogTitle>
          <DialogDescription>
            Detailed biography and information about {name}
          </DialogDescription>
        </VisuallyHidden>
        <div className="space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Header with small avatar */}
          <div className="flex items-center gap-3.5">
            {/* Avatar image - 100x100 */}
            <div className="flex-shrink-0 w-25 h-25 rounded-xl overflow-hidden border-2 border-foreground">
              <img src={image || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
            </div>

            {/* Name and title - vertically centered with avatar */}
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold mb-1 text-balance">{name}</h2>
              {displayTitle && <p className="text-xs md:text-sm text-muted-foreground font-medium">{displayTitle}</p>}
            </div>
          </div>

          {/* Tags Section */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-2.5 py-0.5 text-xs border-2 border-foreground rounded-md font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Additional Info Section */}
          {additionalInfo && (
            <div className="flex items-start gap-2 p-2.5 bg-neutral-50 rounded-lg border-2 border-neutral-200">
              <div className="text-xs">
                <span className="text-muted-foreground">{additionalInfo}</span>
              </div>
            </div>
          )}

          {/* Bio content - main focus */}
          <div className="pt-2.5 border-t-2 border-neutral-200">
            <h3 className="text-xs font-bold mb-2.5 uppercase tracking-wider">About</h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed text-pretty">{bio}</p>
          </div>

          {/* Website Section */}
          {website && (
            <div className="pt-2.5 border-t-2 border-neutral-200">
              <h3 className="text-xs font-bold mb-2.5 uppercase tracking-wider">Learn More</h3>
              <div className="flex flex-wrap gap-2">
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-foreground hover:bg-foreground hover:text-background transition-colors text-sm font-medium"
                  title="Visit Website"
                >
                  <Globe className="w-4 h-4" />
                  Visit Website
                </a>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
