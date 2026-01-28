"use client"

import { cn } from "@/lib/utils"
import type { Partner, PartnerCardProps } from '@/types/components'

// Re-export for backward compatibility
export type { Partner, PartnerCardProps }

const getTierColor = (subCategory: string | null) => {
  if (!subCategory) return "text-muted-foreground"
  const subCategoryLower = subCategory.toLowerCase()
  const colors: Record<string, string> = {
    headline: "text-rose-600",
    silver: "text-gray-400",
    gold: "text-amber-500",
    platinum: "text-cyan-400",
    diamond: "text-purple-500",
    principal: "text-blue-600",
    community: "text-green-600",
    ecosystem: "text-teal-600",
    "brand collaboration": "text-orange-600",
  }
  return colors[subCategoryLower] || "text-muted-foreground"
}

const formatSubCategory = (subCategory: string | null, category: string | null) => {
  if (!subCategory) return null

  // Determine if it should be "Partner" or "Sponsor" based on category
  const suffix = category?.toLowerCase().includes("sponsor") ? "Sponsor" : "Partner"

  return `${subCategory} ${suffix}`
}

export function PartnerCard({ partner, viewMode, onClick }: PartnerCardProps) {
  return (
    <button
      onClick={() => onClick(partner)}
      className={cn(
        "group bg-background border-[1.5px] border-foreground rounded-xl p-3 md:p-3.5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left",
        viewMode === "list" ? "flex gap-3 items-center" : "flex flex-col",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center bg-muted rounded-lg border-[1.5px] border-transparent group-hover:border-foreground transition-all duration-200 flex-shrink-0",
          viewMode === "list" ? "w-20 h-20" : "h-24 w-full mb-2.5",
        )}
      >
        <img
          src={partner.logo_url || "/placeholder.svg"}
          alt={partner.name}
          className="max-w-full max-h-full object-contain p-1.5"
        />
      </div>
      <div className="flex-1">
        {partner.sub_category && (
          <div
            className={`text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 ${getTierColor(partner.sub_category)}`}
          >
            {formatSubCategory(partner.sub_category, partner.category || null)}
          </div>
        )}
        <h3 className="text-xs md:text-sm font-bold mb-1 text-balance">{partner.name}</h3>
        {partner.bio && (
          <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed line-clamp-3">{partner.bio}</p>
        )}
        <div className="mt-2 pt-2 border-t border-neutral-200">
          <span className="text-[10px] md:text-xs font-medium group-hover:underline">View Bio →</span>
        </div>
      </div>
    </button>
  )
}
