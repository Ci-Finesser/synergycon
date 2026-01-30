"use client"
import type React from "react"
import { ArrowRight, MapPin, Calendar, Sparkles } from "lucide-react"
import Countdown, { CountdownMobile } from "./countdown"
import Link from "next/link"

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center py-16 md:py-20 lg:py-24 bg-white overflow-hidden">
      {/* --- DECORATIVE OBJECTS LAYER --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-visible select-none">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{ 
            backgroundImage: "radial-gradient(circle at 1px 1px, #000 1px, transparent 0)",
            backgroundSize: "40px 40px"
          }}
        />
        
        {/* === LAGOS-THEMED SVG DECORATIONS === */}
        
        {/* Lekki-Ikoyi Bridge - Top Left */}
        <svg
          className="absolute top-12 left-4 md:left-12 lg:left-20 w-28 md:w-40 lg:w-52 h-auto text-zinc-300 opacity-0 animate-[fadeIn_1s_ease-out_0.4s_forwards]"
          viewBox="0 0 200 80"
          fill="none"
        >
          <path
            d="M10 70 Q50 20 100 40 Q150 60 190 30"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
          />
          <line x1="30" y1="70" x2="50" y2="35" stroke="currentColor" strokeWidth="1.5" />
          <line x1="70" y1="70" x2="75" y2="38" stroke="currentColor" strokeWidth="1.5" />
          <line x1="110" y1="70" x2="100" y2="42" stroke="currentColor" strokeWidth="1.5" />
          <line x1="150" y1="70" x2="130" y2="48" stroke="currentColor" strokeWidth="1.5" />
          <line x1="180" y1="70" x2="170" y2="35" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 70 L195 70" stroke="currentColor" strokeWidth="2" />
        </svg>

        {/* Danfo Bus - Top Right */}
        <svg
          className="absolute top-16 right-4 md:right-12 lg:right-24 w-16 md:w-24 lg:w-32 h-auto text-zinc-400 opacity-0 animate-[fadeIn_1s_ease-out_0.5s_forwards]"
          viewBox="0 0 100 60"
          fill="none"
        >
          <rect x="10" y="15" width="80" height="35" rx="5" stroke="currentColor" strokeWidth="2" />
          <rect x="15" y="20" width="15" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="35" y="20" width="15" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="55" y="20" width="15" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="75" y="20" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="25" cy="55" r="5" stroke="currentColor" strokeWidth="2" />
          <circle cx="75" cy="55" r="5" stroke="currentColor" strokeWidth="2" />
          <path d="M5 35 L10 35" stroke="currentColor" strokeWidth="2" />
          <path d="M90 35 L95 35" stroke="currentColor" strokeWidth="2" />
        </svg>

        {/* National Theatre - Bottom Left */}
        <svg
          className="absolute bottom-16 md:bottom-24 left-4 md:left-16 lg:left-28 w-24 md:w-36 lg:w-44 h-auto text-zinc-300 opacity-0 animate-[fadeIn_1s_ease-out_0.7s_forwards]"
          viewBox="0 0 120 80"
          fill="none"
        >
          <ellipse cx="60" cy="60" rx="55" ry="15" stroke="currentColor" strokeWidth="2" />
          <path
            d="M20 60 Q20 20 60 10 Q100 20 100 60"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path d="M35 60 L35 35" stroke="currentColor" strokeWidth="1.5" />
          <path d="M60 60 L60 15" stroke="currentColor" strokeWidth="1.5" />
          <path d="M85 60 L85 35" stroke="currentColor" strokeWidth="1.5" />
          <ellipse cx="60" cy="60" rx="40" ry="10" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
        </svg>

        {/* BRT Bus - Bottom Right */}
        <svg
          className="absolute bottom-12 md:bottom-20 right-4 md:right-12 lg:right-20 w-20 md:w-32 lg:w-40 h-auto text-zinc-400 opacity-0 animate-[fadeIn_1s_ease-out_0.8s_forwards]"
          viewBox="0 0 140 50"
          fill="none"
        >
          <rect x="5" y="10" width="130" height="30" rx="8" stroke="currentColor" strokeWidth="2" />
          <rect x="12" y="15" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="35" y="15" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="58" y="15" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="81" y="15" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="104" y="15" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="30" cy="45" r="4" stroke="currentColor" strokeWidth="2" />
          <circle cx="70" cy="45" r="4" stroke="currentColor" strokeWidth="2" />
          <circle cx="110" cy="45" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>

        {/* Blue Rail Train - Left Middle */}
        <svg
          className="hidden lg:block absolute top-1/2 -translate-y-1/2 left-6 w-20 h-auto text-zinc-300 opacity-0 animate-[fadeIn_1s_ease-out_1s_forwards]"
          viewBox="0 0 80 100"
          fill="none"
        >
          <rect x="15" y="5" width="50" height="90" rx="10" stroke="currentColor" strokeWidth="2" />
          <rect x="22" y="12" width="36" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <rect x="22" y="38" width="36" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="22" y="58" width="36" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="30" cy="82" r="4" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="50" cy="82" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 50 L15 50" stroke="currentColor" strokeWidth="2" />
          <path d="M65 50 L75 50" stroke="currentColor" strokeWidth="2" />
        </svg>

        {/* Ticket Stub - Right Middle */}
        <svg
          className="hidden lg:block absolute top-1/2 -translate-y-1/2 right-8 w-16 h-auto text-zinc-400 rotate-6 opacity-0 animate-[fadeIn_1s_ease-out_1.1s_forwards]"
          viewBox="0 0 60 100"
          fill="none"
        >
          <rect x="5" y="5" width="50" height="90" rx="4" stroke="currentColor" strokeWidth="2" />
          <path d="M5 25 L55 25" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
          <path d="M5 75 L55 75" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
          <circle cx="30" cy="50" r="12" stroke="currentColor" strokeWidth="1.5" />
          <text x="30" y="54" textAnchor="middle" fontSize="8" fill="currentColor" fontWeight="bold">VIP</text>
          <rect x="15" y="80" width="30" height="8" rx="2" stroke="currentColor" strokeWidth="1" />
        </svg>

        {/* === FLOATING GEOMETRIC SHAPES === */}
        <div className="hidden lg:block absolute top-[15%] left-[8%] w-20 h-20 border-2 border-zinc-200 rounded-full animate-[float_8s_ease-in-out_infinite]" />
        <div className="hidden lg:block absolute top-[25%] right-[12%] w-16 h-16 border-2 border-zinc-200 rotate-45 animate-[float_10s_ease-in-out_infinite_1s]" />
        <div className="hidden lg:block absolute bottom-[20%] left-[15%] w-12 h-12 bg-zinc-100 rounded-lg animate-[float_9s_ease-in-out_infinite_0.5s]" />
        <div className="hidden lg:block absolute bottom-[30%] right-[8%] w-24 h-24 border border-zinc-100 rounded-full animate-[float_11s_ease-in-out_infinite_2s]" />
        
        {/* === ACCENT DOTS === */}
        <div className="hidden md:block absolute top-[20%] left-[25%] w-2 h-2 bg-black rounded-full animate-[pulse_3s_ease-in-out_infinite]" />
        <div className="hidden md:block absolute top-[40%] right-[20%] w-3 h-3 bg-zinc-300 rounded-full animate-[pulse_4s_ease-in-out_infinite_1s]" />
        <div className="hidden md:block absolute bottom-[25%] left-[30%] w-2 h-2 bg-zinc-400 rounded-full animate-[pulse_3.5s_ease-in-out_infinite_0.5s]" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          
          {/* Eyebrow Tag */}
          <div className="mb-6 md:mb-8 opacity-0 animate-[fadeIn_1s_ease-out_0.2s_forwards]">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Nigeria&apos;s Premier Creative Economy Conference
            </span>
          </div>

          {/* Main Title */}
          <h1 className="relative z-10 text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.85] text-zinc-900 mb-6 md:mb-8 opacity-0 animate-[slideUp_1s_ease-out_0.3s_forwards] tracking-tight">
            <span className="font-light block">SYNERGY</span>
            <span className="font-serif italic font-bold block text-zinc-800">CON 2.0</span>
          </h1>

          {/* Tagline */}
          <div className="mb-6 md:mb-8 opacity-0 animate-[fadeIn_1s_ease-out_0.5s_forwards]">
            <p className="text-lg md:text-xl lg:text-2xl text-zinc-600 font-light leading-relaxed max-w-2xl">
              Where <span className="font-semibold text-black">creativity</span>, <span className="font-semibold text-black">technology</span>, and <span className="font-semibold text-black">culture</span> converge to shape Nigeria&apos;s tomorrow.
            </p>
            <p className="mt-2 text-sm md:text-base text-zinc-500">
              One powerful day. Four creative districts. Infinite possibilities.
            </p>
          </div>

          {/* Event Info Tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 md:mb-10 opacity-0 animate-[slideUp_1s_ease-out_0.6s_forwards]">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-zinc-200 shadow-sm text-xs md:text-sm font-medium text-zinc-700">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span>March 26, 2026</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-zinc-200 shadow-sm text-xs md:text-sm font-medium text-zinc-700">
              <MapPin className="w-4 h-4 text-zinc-400" />
              <span>National Theatre, Lagos</span>
            </div>
          </div>

          {/* Track Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10 md:mb-12 opacity-0 animate-[fadeIn_1s_ease-out_0.7s_forwards]">
            {["Arts & Design", "Fashion & Film", "Music", "Tech & Gaming"].map((track) => (
              <span 
                key={track}
                className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-[10px] md:text-xs font-medium"
              >
                {track}
              </span>
            ))}
          </div>

          {/* Countdown Section - Desktop */}
          <div className="hidden md:block w-full max-w-lg mb-10 opacity-0 animate-[slideUp_1s_ease-out_0.8s_forwards]">
            <div className="bg-zinc-900 rounded-2xl p-6 shadow-2xl shadow-black/20">
              <div className="text-center mb-4">
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400 border-b border-zinc-700 pb-2">
                  Event Starts In
                </span>
              </div>
              <Countdown targetDate="2026-03-26T08:00:00" />
              <div className="mt-4 flex justify-center items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">
                  Registration is live
                </span>
              </div>
            </div>
          </div>

          {/* Countdown Section - Mobile */}
          <div className="md:hidden w-full mb-8 opacity-0 animate-[slideUp_1s_ease-out_0.8s_forwards]">
            <div className="bg-zinc-900 rounded-2xl p-5 shadow-xl">
              <div className="text-center mb-3">
                <span className="inline-block text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-700 pb-2">
                  Event Starts In
                </span>
              </div>
              <CountdownMobile targetDate="2026-03-26T08:00:00" />
              <div className="mt-3 flex justify-center items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
                </span>
                <span className="text-[9px] uppercase tracking-[0.15em] font-bold text-zinc-400">
                  Registration is live
                </span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto opacity-0 animate-[slideUp_1s_ease-out_0.9s_forwards]">
            <Link
              href="/register"
              className="group relative px-8 py-4 bg-zinc-900 text-white font-bold text-sm uppercase tracking-[0.15em] overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/20 rounded-xl flex items-center justify-center gap-3"
            >
              <span className="relative z-10">Secure Your Spot</span>
              <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-zinc-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out"></div>
            </Link>
            <Link
              href="/schedule"
              className="group px-8 py-4 bg-white text-zinc-900 font-bold text-sm uppercase tracking-[0.15em] border-2 border-zinc-200 overflow-hidden transition-all duration-300 hover:border-zinc-900 hover:bg-zinc-50 rounded-xl flex items-center justify-center"
            >
              View Agenda
            </Link>
          </div>

        </div>
      </div>

      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </section>
  )
}

export default Hero
