import type React from "react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import type { Partner } from '@/types/components'

// Re-export for backward compatibility
export type { Partner }

interface PartnerBioModalProps {
  partner: Partner
  children?: React.ReactNode
  isOpen?: boolean
  onClose?: () => void
}

export function PartnerBioModal({ partner, children, isOpen, onClose }: PartnerBioModalProps) {
  const bioText = partner.bio || partner.description

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent className="max-w-4xl p-5 md:p-6 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>{partner.name} - Partner Information</DialogTitle>
          <DialogDescription>
            Detailed information about {partner.name}
          </DialogDescription>
        </VisuallyHidden>
        <div className="space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Header with partner logo */}
          <div className="flex items-center gap-3.5">
            {/* Partner logo */}
            <div className="flex-shrink-0 w-25 h-25 rounded-xl overflow-hidden border-2 border-foreground bg-white flex items-center justify-center p-2">
              <img
                src={partner.logo_url || "/placeholder.svg"}
                alt={partner.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Partner name and tier */}
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold mb-1 text-balance">{partner.name}</h2>
              {partner.tiers && partner.tiers.length > 0 && (
                <p className="text-xs md:text-sm text-muted-foreground font-medium">{partner.tiers.join(" & ")}</p>
              )}
            </div>
          </div>

          {/* Partner Tier Tags */}
          {partner.tiers && partner.tiers.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {partner.tiers.map((tier, index) => (
                <span key={index} className="px-2.5 py-0.5 text-xs border-2 border-foreground rounded-md font-medium">
                  {tier}
                </span>
              ))}
            </div>
          )}

          {/* Bio content */}
          {bioText && (
            <div className="pt-2.5 border-t-2 border-neutral-200">
              <h3 className="text-xs font-bold mb-2.5 uppercase tracking-wider">About</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed text-pretty">{bioText}</p>
            </div>
          )}

          {/* Website Link */}
          {partner.website && (
            <div className="pt-2.5 border-t-2 border-neutral-200">
              <h3 className="text-xs font-bold mb-2.5 uppercase tracking-wider">Website</h3>
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs md:text-sm text-foreground hover:underline font-medium"
              >
                {partner.website}
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
