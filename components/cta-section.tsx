"use client"

import { ArrowRight, Calendar, Sparkles, Check, Bell } from "lucide-react"
import Link from "next/link"
import { openRegistrationModal } from "@/components/registration-modal"
import { EVENT_NAME, EVENT_DATES, VENUES, TICKET_TYPES, EVENT_STATS } from "@/lib/constants"

export function CtaSection() {
  return (
    <section className="py-12 md:py-20 text-white relative overflow-hidden bg-black">
      {/* Decorative geometric shapes with rainbow accents */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Grid pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>
      </div>

      <div className="absolute top-20 left-4 md:top-36 md:left-16 opacity-20">
        <div className="w-12 h-12 md:w-20 md:h-20 rotate-45 border-2 rounded-sm border-white" />
      </div>

      <div className="hidden lg:block absolute top-8 right-8 opacity-30 animate-[float_9s_ease-in-out_infinite_1.5s]">
        <div className="bg-[#e4e4e7] w-32 h-14 md:w-36 md:h-16 transform -rotate-6 flex rounded-sm overflow-hidden shadow-2xl border-l border-dashed border-zinc-900/20">
          <div className="w-10 md:w-12 border-r border-dashed border-zinc-900/20 h-full flex flex-col items-center justify-center bg-zinc-50">
            <span className="text-[10px] font-black text-zinc-900 tracking-tighter">+234</span>
            <span className="text-[4px] uppercase tracking-widest text-zinc-400 mt-1 font-bold">LAGOS</span>
          </div>
          <div className="flex-1 p-2 flex flex-col justify-between relative bg-white">
            <div
              className="absolute inset-0 opacity-5"
              style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "4px 4px" }}
            ></div>
            <div className="flex justify-between items-start relative z-10">
              <span className="text-[6px] font-bold uppercase tracking-widest text-green-700 bg-green-50 px-1.5 py-[1px] rounded-full border border-green-100">
                Admit One
              </span>
              <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="white" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" fill="white" />
                </svg>
              </div>
            </div>
            <div className="relative z-10">
              <span className="block text-[10px] md:text-[12px] font-black italic text-zinc-900 leading-none tracking-tight">
                CONNECT.
              </span>
              <span className="text-[6px] text-zinc-400 font-bold uppercase tracking-wider">Access Pass 2026</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block absolute bottom-32 left-4 md:left-16 opacity-30 animate-[float_7s_ease-in-out_infinite_2s]">
        <div className="relative group transform rotate-[8deg]">
          <div className="absolute bottom-0 left-4 right-4 h-4 bg-black/10 blur-xl rounded-full translate-y-4"></div>
          <div className="relative w-40 h-24">
            <svg viewBox="0 0 200 140" className="w-full h-full drop-shadow-2xl">
              <path
                d="M10,40 L190,40 C195,40 200,45 200,60 L200,110 L0,110 L0,60 C0,45 5,40 10,40 Z"
                fill="#facc15"
                stroke="#18181b"
                strokeWidth="2"
              />
              <path d="M15,35 L185,35 L190,40 L10,40 Z" fill="#fef08a" stroke="#18181b" strokeWidth="2" />
              <rect x="0" y="75" width="200" height="15" fill="#18181b" />
              <rect x="10" y="48" width="30" height="20" rx="2" fill="#bae6fd" stroke="#18181b" strokeWidth="1.5" />
              <rect x="45" y="48" width="40" height="20" rx="2" fill="#bae6fd" stroke="#18181b" strokeWidth="1.5" />
              <rect x="90" y="48" width="40" height="20" rx="2" fill="#bae6fd" stroke="#18181b" strokeWidth="1.5" />
              <rect x="135" y="48" width="55" height="20" rx="2" fill="#bae6fd" stroke="#18181b" strokeWidth="1.5" />
              <circle cx="40" cy="110" r="14" fill="#18181b" />
              <circle cx="40" cy="110" r="6" fill="#52525b" />
              <circle cx="160" cy="110" r="14" fill="#18181b" />
              <circle cx="160" cy="110" r="6" fill="#52525b" />
              <rect x="190" y="95" width="8" height="10" fill="#fbbf24" stroke="#18181b" strokeWidth="1" />
              <rect x="2" y="95" width="5" height="10" fill="#ef4444" stroke="#18181b" strokeWidth="1" />
            </svg>
            <div className="absolute top-[28%] left-1/2 -translate-x-1/2 bg-black text-yellow-400 text-[7px] font-bold px-2 py-0.5 border border-yellow-400 rounded-sm whitespace-nowrap">
              SYNERGYCON 2.0
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-32 right-4 md:bottom-40 md:right-16 opacity-20">
        <div className="w-12 h-12 md:w-20 md:h-20 rotate-45 border-2 rounded-sm border-white" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-8 md:mb-10">
          <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:px-4 md:py-2 rounded-full bg-amber-500/5 text-amber-500 border border-amber-500/30 mb-4 md:mb-5">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-[11px] md:text-sm font-medium">Limited Free Spots Available (Register Now 🎟️)</span>
          </div>

          <h2 className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-4 md:mb-5 text-balance">
            <span className="text-white">One Day That Could Change Everything</span>
          </h2>

          <p className="text-xs md:text-base text-gray-400 mb-5 md:mb-8 text-pretty leading-relaxed max-w-2xl mx-auto">
            On March 26, 2026, the brightest minds in Nigeria&apos;s creative economy converge at National Theatre. 
            {EVENT_STATS.maximumAttendeeCapacity.toLocaleString()}+ innovators. Four immersive districts. Countless opportunities to collaborate, learn, and launch what&apos;s next.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-6xl mx-auto mb-6 md:mb-8">
            {/* VIP - Red */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-5 border border-red-500/30 hover:bg-red-500/5 transition-all hover:scale-[1.02] flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 md:px-3 md:py-1 bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full">
                {TICKET_TYPES.vip.accessType === "day" ? "DAY ACCESS" : "FULL ACCESS"}
              </div>
              <div className="mb-3 md:mb-4">
                <h3 className="text-base md:text-xl font-bold text-red-400 mb-1 md:mb-2">{TICKET_TYPES.vip.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl md:text-3xl font-bold text-white">{TICKET_TYPES.vip.priceDisplay}</span>
                  <span className="text-xs md:text-sm text-gray-400">/day</span>
                </div>
                <p className="text-[11px] md:text-sm text-gray-300">{TICKET_TYPES.vip.description}</p>
              </div>
              <ul className="space-y-1.5 md:space-y-2 text-left flex-1">
                {TICKET_TYPES.vip.features.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-start gap-1.5 md:gap-2 text-[11px] md:text-sm text-gray-300">
                    <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* VIP+ - Blue */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-5 border border-blue-500/30 hover:bg-blue-500/5 transition-all hover:scale-[1.02] relative flex flex-col">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 md:px-3 md:py-1 bg-blue-500 text-white text-[10px] md:text-xs font-bold rounded-full">
                {TICKET_TYPES["vip-plus"].accessType === "day" ? "DAY ACCESS" : "FULL ACCESS"}
              </div>
              <div className="mb-3 md:mb-4">
                <h3 className="text-base md:text-xl font-bold text-blue-400 mb-1 md:mb-2">{TICKET_TYPES["vip-plus"].name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl md:text-3xl font-bold text-white">{TICKET_TYPES["vip-plus"].priceDisplay}</span>
                  <span className="text-xs md:text-sm text-gray-400">/day</span>
                </div>
                <p className="text-[11px] md:text-sm text-gray-300">{TICKET_TYPES["vip-plus"].description}</p>
              </div>
              <ul className="space-y-1.5 md:space-y-2 text-left flex-1">
                {TICKET_TYPES["vip-plus"].features.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-start gap-1.5 md:gap-2 text-[11px] md:text-sm text-gray-300">
                    <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* VVIP - Green */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-5 border border-green-500/30 hover:bg-green-500/5 transition-all hover:scale-[1.02] flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 md:px-3 md:py-1 bg-green-500 text-white text-[10px] md:text-xs font-bold rounded-full">
                ALL-ACCESS PASS
              </div>
              <div className="mb-3 md:mb-4">
                <h3 className="text-base md:text-xl font-bold text-green-400 mb-1 md:mb-2">{TICKET_TYPES.vvip.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl md:text-3xl font-bold text-white">{TICKET_TYPES.vvip.priceDisplay}</span>
                </div>
                <p className="text-[11px] md:text-sm text-gray-300">{TICKET_TYPES.vvip.description}</p>
              </div>
              <ul className="space-y-1.5 md:space-y-2 text-left flex-1">
                {TICKET_TYPES.vvip.features.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-start gap-1.5 md:gap-2 text-[11px] md:text-sm text-gray-300">
                    <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Priority Pass - Gold */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-5 border border-amber-500/30 hover:bg-amber-500/5 transition-all hover:scale-[1.02] flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 md:px-3 md:py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[10px] md:text-xs font-bold rounded-full">
                PREMIUM ACCESS
              </div>
              <div className="mb-3 md:mb-4">
                <h3 className="text-base md:text-xl font-bold text-amber-400 mb-1 md:mb-2">{TICKET_TYPES["priority-pass"].name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl md:text-3xl font-bold text-white">{TICKET_TYPES["priority-pass"].priceDisplay}</span>
                </div>
                <p className="text-[11px] md:text-sm text-gray-300">{TICKET_TYPES["priority-pass"].description}</p>
              </div>
              <ul className="space-y-1.5 md:space-y-2 text-left flex-1">
                {TICKET_TYPES["priority-pass"].features.slice(0, 3).map((feature, i) => (
                  <li key={i} className="flex items-start gap-1.5 md:gap-2 text-[11px] md:text-sm text-gray-300">
                    <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-6 md:mb-8">
            <Link
              href="/register"
              className="group px-5 py-2.5 md:px-8 md:py-4 bg-white text-black rounded-xl font-medium text-sm md:text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              Secure Your Spot Now
              <ArrowRight className="w-3.5 h-3.5 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={openRegistrationModal}
              className="group px-5 py-2.5 md:px-8 md:py-4 bg-transparent text-white rounded-xl font-medium text-sm md:text-lg hover:bg-white/10 transition-all duration-300 border border-white/30 hover:border-white/50 flex items-center gap-2"
            >
              <Bell className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Join Waitlist
            </button>

            <Link
              href="/schedule"
              className="px-5 py-2.5 md:px-8 md:py-4 bg-transparent text-white rounded-xl font-medium text-sm md:text-lg hover:bg-white/10 transition-all duration-300 border border-white/30 hover:border-white/50"
            >
              View Full Schedule
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 md:gap-3 text-gray-300">
            <Calendar className="w-3.5 h-3.5 md:w-5 md:h-5 text-accent-purple" />
            <span className="text-xs md:text-base lg:text-lg">
              <span className="font-semibold text-white">{EVENT_DATES.displayRange}</span>
              <span className="mx-2">•</span>
              <span>9:00 AM - 6:00 PM WAT</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
