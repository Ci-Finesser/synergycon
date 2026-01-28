import { Info } from 'lucide-react'

export function PartnersNotice() {
  return (
    <div className="flex items-start gap-3 md:gap-3.5 p-4 md:p-5 rounded-xl border border-neutral-200 bg-neutral-50">
      <div className="flex-shrink-0">
        <Info className="w-5 h-5 text-blue-600" />
      </div>
      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
        Stay tuned. Full list of organizations supporting SynergyCon 2.0 will be available closer to the event.
      </p>
    </div>
  )
}
