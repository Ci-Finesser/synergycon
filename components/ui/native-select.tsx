import * as React from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string
  error?: boolean
  fullWidth?: boolean
}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, children, placeholder, value, error, disabled, fullWidth = false, ...props }, ref) => {
    const hasValue = value !== undefined && value !== ''

    return (
      <div className={cn("relative", fullWidth ? "w-full" : "w-fit")}>
        <select
          className={cn(
            // Base styles
            "peer flex h-10 cursor-pointer appearance-none rounded-md border bg-background px-3 py-2 pr-10 text-sm transition-all duration-200",
            // Width - fit content by default
            fullWidth ? "w-full" : "w-auto min-w-[180px]",
            // Border and ring styles
            "border-input shadow-xs",
            "focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring",
            // Hover state
            "hover:border-foreground/50",
            // Placeholder/empty state
            !hasValue && "text-muted-foreground",
            hasValue && "text-foreground",
            // Error state
            error && "border-destructive focus:border-destructive focus:ring-destructive/20",
            // Disabled state
            disabled && "cursor-not-allowed opacity-50 hover:border-input",
            // Dark mode adjustments
            "dark:bg-input/30 dark:hover:bg-input/50",
            // Custom className
            className
          )}
          ref={ref}
          value={value}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-muted-foreground">
              {placeholder}
            </option>
          )}
          {children}
        </select>
        
        {/* Chevron icon with animation */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ChevronDownIcon 
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-200",
              "peer-focus:text-foreground",
              disabled && "opacity-50"
            )} 
          />
        </div>
        
        {/* Focus ring overlay for better visual */}
        <div 
          className={cn(
            "pointer-events-none absolute inset-0 rounded-md ring-0 transition-all duration-200",
            "peer-focus:ring-2 peer-focus:ring-ring/20"
          )} 
        />
      </div>
    )
  }
)
NativeSelect.displayName = 'NativeSelect'

export { NativeSelect }
