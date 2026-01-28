import { Info } from 'lucide-react'

export function ScheduleNotice() {
  return (
    <div className="bg-neutral-50 border-2 border-neutral-200 rounded-xl p-4 md:p-5 flex items-start gap-3">
      <Info className="w-5 h-5 text-accent-blue flex-shrink-0 mt-0.5" />
      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
        <span className="font-semibold text-foreground">Full details coming soon.</span> Complete session descriptions and registration links will be available closer to the event.
      </p>
    </div>
  )
}
