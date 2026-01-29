import { Info } from 'lucide-react'

export function PartnersNotice() {
  return (
    <div className="flex items-start gap-3 md:gap-3.5 p-4 md:p-5 rounded-xl border border-neutral-200 bg-neutral-50">
      <div className="flex-shrink-0">
        <Info className="w-5 h-5 text-blue-600" />
      </div>
      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
        <span className="font-semibold text-foreground">Partnership opportunities still available.</span> Join leading brands supporting Nigeria&apos;s creative economy on March 27 at National Theatre.
      </p>
    </div>
  )
}
