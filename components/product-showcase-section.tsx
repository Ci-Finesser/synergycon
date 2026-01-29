"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PartnerCard } from "@/components/partner-card"
import type { Partner } from "@/types/components"

export function ProductShowcaseSection() {
  const [products, setProducts] = useState<Partner[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("sponsors")
      .select("*")
      .eq("category", "Product Showcase")
      .order("display_order")
    if (data) setProducts(data)
  }

  return (
    <section id="product-showcase" className="py-16 md:py-20 px-4 md:px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">Product Showcase</h2>
            <p className="text-sm md:text-base text-muted-foreground">Explore innovative products from our community</p>
          </div>
          <Link href="/product-showcase" className="group inline-flex items-center text-sm font-semibold hover:underline">
            View All Products
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.slice(0, 8).map((product) => (
            <PartnerCard key={product.id} partner={product} viewMode="grid" onClick={() => {}} />
          ))}
        </div>
      </div>
    </section>
  )
}

