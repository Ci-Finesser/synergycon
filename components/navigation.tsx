"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [showBanner, setShowBanner] = useState(true)

  const navItems = [
    { label: "Agenda", href: "/schedule" },
    { label: "Speakers", href: "/speakers" },
    { label: "Venue", href: "#venue" },
    { label: "Sponsors", href: "/partners" },
  ]

  useEffect(() => {
    const spacer = document.getElementById("nav-spacer")
    if (spacer) {
      spacer.style.height = showBanner ? "97px" : "56px"
    }
  }, [showBanner])

  return (
    <>
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-foreground text-background">
          <div className="container mx-auto px-4 md:px-6 py-2 flex items-center justify-between gap-4">
            <div className="flex-1 overflow-hidden">
              <div className="md:block hidden">
                <p className="text-xs md:text-sm font-medium tracking-wide">
                  Partnership Opportunities Now Open • Vendors • Sponsors • Media • Exhibitors
                </p>
              </div>
              <div className="md:hidden block whitespace-nowrap animate-scroll">
                <p className="text-xs font-medium tracking-wide inline-block">
                  Partnership Opportunities Now Open • Vendors • Sponsors • Media • Exhibitors • Partnership
                  Opportunities Now Open • Vendors • Sponsors • Media • Exhibitors
                </p>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              className="bg-background text-foreground hover:bg-background/90 border-2 border-background/20 rounded-md flex-shrink-0 h-7 px-3 text-xs"
            >
              <Link href="/become-partner" className="flex items-center gap-1.5">
                <span className="hidden md:inline">Collaborate Now</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
            <button
              onClick={() => setShowBanner(false)}
              className="hover:opacity-70 transition-opacity flex-shrink-0 p-2 -m-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <nav
        className={`fixed left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 transition-all ${showBanner ? "top-[41px]" : "top-0"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center group cursor-pointer">
              <div className="w-8 h-8 bg-black text-white flex items-center justify-center relative overflow-hidden transition-transform duration-500 group-hover:rotate-180 rounded-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 12L12 22L22 12L12 2Z" stroke="white" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" fill="white" />
                </svg>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/register">
                <Button size="sm" className="bg-black text-white hover:bg-gray-800 h-8 px-4 text-sm">
                  Get Tickets
                </Button>
              </Link>
            </div>

            <button 
              className="md:hidden p-2 -m-2 min-h-[44px] min-w-[44px] flex items-center justify-center" 
              onClick={() => setIsOpen(!isOpen)} 
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 pt-4 pb-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-base font-medium text-gray-700 hover:text-gray-900"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/register" onClick={() => setIsOpen(false)} className="block pt-4">
                <Button className="w-full bg-black text-white hover:bg-gray-800">Get Tickets</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
      <div id="nav-spacer" className="h-[97px] md:h-[56px]"></div>
    </>
  )
}
