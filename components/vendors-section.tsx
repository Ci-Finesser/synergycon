"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PartnerCard } from "@/components/partner-card"
import type { Partner } from "@/types/components"

export function VendorsSection() {
  const [vendors, setVendors] = useState<Partner[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    const { data } = await supabase
      .from("sponsors")
      .select("*")
      .eq("category", "Vendors")
      .order("display_order")
    if (data) setVendors(data)
  }

  return (
    <section id="vendors" className="py-16 md:py-20 px-4 md:px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">Vendors</h2>
            <p className="text-sm md:text-base text-muted-foreground">Discover brands showcasing at the event</p>
          </div>
          <Link href="/vendors" className="group inline-flex items-center text-sm font-semibold hover:underline">
            View All Vendors
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {vendors.slice(0, 8).map((vendor) => (
            <PartnerCard key={vendor.id} partner={vendor} viewMode="grid" onClick={() => {}} />
          ))}
        </div>
      </div>
    </section>
  )
}

