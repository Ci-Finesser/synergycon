"use client"
import type React from "react"
import { ArrowRight, ArrowUpRight, MapPin, Calendar } from "lucide-react"
import Countdown, { CountdownMobile } from "./countdown"
import Link from "next/link"

const Hero: React.FC = () => {
  return (
    <section className="relative flex-grow flex flex-col justify-center pt-12 pb-16 md:pt-16 md:pb-20 lg:pb-32 bg-white overflow-hidden">
      {/* --- DECORATIVE OBJECTS LAYER --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-visible select-none">
        {/* Decorative Layer */}
        <div className="absolute inset-0 overflow-visible pointer-events-none">
          {/* Lekki Bridge Polaroid */}
          <div className="hidden md:block absolute top-4 right-4 xl:right-8 rotate-6 hover:rotate-12 transition-transform duration-300">
            <div className="relative group transform rotate-3 hover:rotate-0 transition-all duration-700 origin-top-right scale-[0.4]">
              {/* Photo Frame */}
              <div className="w-72 bg-white p-3 pb-16 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-zinc-100">
                {/* Image Area - Poster Recreation with bridge extending to edges */}
                <div className="h-64 w-full relative overflow-hidden bg-gradient-to-b from-[#22d3ee] via-[#60a5fa] to-[#6366f1]">
                  {/* Typographic Elements from Poster */}
                  <div className="absolute top-3 left-3 z-10">
                    <h3 className="text-[10px] font-black uppercase tracking-tighter text-black leading-none mb-1">
                      LEKKI-IKOYI
                    </h3>
                    <p className="text-[5px] text-black font-medium leading-tight max-w-[80px] opacity-70">
                      The first cable-stayed bridge in West Africa. A landmark of Lagos.
                    </p>
                  </div>
                  <div className="absolute top-3 right-3 z-10 text-right">
                    <h3 className="text-[10px] font-black uppercase tracking-tighter text-black leading-none mb-1">
                      001
                    </h3>
                    <p className="text-[5px] text-black font-medium opacity-70">15 OCT 2024</p>
                  </div>

                  {/* Background Text "LAGOS" faded */}
                  <div className="absolute top-10 left-0 right-0 text-center">
                    <span className="text-[80px] font-black text-white/10 tracking-tighter leading-none">LAGOS</span>
                  </div>

                  {/* Bridge Vector Construction - Extended to reach card edges */}
                  <svg
                    viewBox="0 0 288 256"
                    className="absolute bottom-0 left-0 w-full h-full"
                    preserveAspectRatio="xMidYMax slice"
                  >
                    {/* Cable lines extending to edges */}
                    <line x1="144" y1="60" x2="-20" y2="200" stroke="black" strokeWidth="1.2" />
                    <line x1="144" y1="70" x2="-20" y2="256" stroke="black" strokeWidth="1.2" />
                    <line x1="144" y1="80" x2="20" y2="256" stroke="black" strokeWidth="1.2" />
                    <line x1="144" y1="60" x2="308" y2="200" stroke="black" strokeWidth="1.2" />
                    <line x1="144" y1="70" x2="308" y2="256" stroke="black" strokeWidth="1.2" />
                    <line x1="144" y1="80" x2="268" y2="256" stroke="black" strokeWidth="1.2" />

                    {/* Main tower - positioned centrally */}
                    <path d="M122,256 L116,40 L122,28 L144,46 L166,28 L172,40 L166,256 Z" fill="black" />
                    <path d="M132,56 L156,56 L156,68 L132,68 Z" fill="#60a5fa" />
                    <path d="M130,78 L158,78 L158,90 L130,90 Z" fill="#6366f1" />
                    <path d="M128,100 L160,100 L160,112 L128,112 Z" fill="#6366f1" />

                    {/* Road/base extending to full width */}
                    <path d="M-20,210 Q144,185 308,210 L308,256 L-20,256 Z" fill="#18181b" />

                    {/* Tower reflection on road */}
                    <path d="M141,210 L147,210 L152,256 L136,256 Z" fill="white" opacity="0.3" />
                  </svg>
                </div>
                {/* Caption */}
                <div className="absolute bottom-4 left-4">
                  <p className="font-serif italic text-zinc-900 text-lg">Iconic Views.</p>
                </div>
              </div>
              {/* Tape */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-12 bg-zinc-400/40 backdrop-blur-sm rotate-2 border-l border-r border-white/30"></div>
            </div>
          </div>

          {/* 2. ROTATING BADGE (Between title and countdown) */}
          <div className="absolute top-[5%] left-[45%] 2xl:left-[50%] animate-[float_6s_ease-in-out_infinite_1s] z-10 hidden xl:block">
            <div className="relative group cursor-pointer hover:scale-105 transition-transform duration-500">
              <div className="w-24 h-24 md:w-28 md:h-28 relative rounded-full bg-white/40 backdrop-blur-sm shadow-xl flex items-center justify-center border border-zinc-200/50">
                <div className="absolute inset-0 w-full h-full animate-[spin_40s_linear_infinite]">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                      <path id="textCircle" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                    </defs>
                    <text className="text-[6px] md:text-[7px] font-bold uppercase tracking-[0.25em] fill-zinc-900">
                      <textPath href="#textCircle" startOffset="0%">
                        Culture • Tech • Economy • Creativity •
                      </textPath>
                    </text>
                  </svg>
                </div>
                {/* Inner Circle */}
                <div className="w-14 h-14 md:w-16 md:h-16 bg-zinc-900 rounded-full flex items-center justify-center relative shadow-inner z-10">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
                    <path d="M12 2L22 12L12 22L2 12L12 2Z" fill="white" stroke="white" />
                    <circle cx="12" cy="12" r="3" fill="black" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* 3. DANFO BUS (Bottom Right, floating into next section) */}
          <div className="hidden lg:block absolute bottom-4 right-[5%] animate-[float_7s_ease-in-out_infinite_2s] z-20">
            <div className="relative group transform rotate-[8deg] hover:rotate-[5deg] transition-transform duration-500">
              <div className="absolute bottom-0 left-4 right-4 h-6 bg-black/10 blur-xl rounded-full translate-y-4"></div>
              <div className="relative w-48 h-32">
                <svg viewBox="0 0 200 140" className="w-full h-full drop-shadow-2xl">
                  {/* Image Area - Poster Recreation with bridge extending to edges */}
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
                  <rect
                    x="135"
                    y="48"
                    width="55"
                    height="20"
                    rx="2"
                    fill="#bae6fd"
                    stroke="#18181b"
                    strokeWidth="1.5"
                  />
                  <circle cx="40" cy="110" r="14" fill="#18181b" />
                  <circle cx="40" cy="110" r="6" fill="#52525b" />
                  <circle cx="160" cy="110" r="14" fill="#18181b" />
                  <circle cx="160" cy="110" r="6" fill="#52525b" />
                  <rect x="190" y="95" width="8" height="10" fill="#fbbf24" stroke="#18181b" strokeWidth="1" />
                  <rect x="2" y="95" width="5" height="10" fill="#ef4444" stroke="#18181b" strokeWidth="1" />
                </svg>
                <div className="absolute top-[28%] left-[45%] -translate-x-1/2 bg-black text-yellow-400 text-[8px] font-bold px-3 py-[2px] border border-yellow-400 rounded-sm">
                  SYNERGYCON 2.0
                </div>
              </div>
            </div>
          </div>

          {/* 4. TICKET STUB (Bottom Left, floating into next section) */}
          <div className="hidden lg:block absolute bottom-[4.5rem] left-[6%] animate-[float_9s_ease-in-out_infinite_1.5s] z-20">
            <div className="bg-[#e4e4e7] w-44 h-20 transform -rotate-3 flex rounded-sm overflow-hidden shadow-2xl border-l border-dashed border-zinc-900/20 group hover:rotate-0 transition-transform duration-300">
              <div className="w-14 border-r border-dashed border-zinc-900/20 h-full flex flex-col items-center justify-center bg-zinc-50">
                <span className="text-[12px] font-black text-zinc-900 tracking-tighter">+234</span>
                <span className="text-[5px] uppercase tracking-widest text-zinc-400 mt-1 font-bold">LAGOS</span>
              </div>
              <div className="flex-1 p-3 flex flex-col justify-between relative bg-white">
                <div
                  className="absolute inset-0 opacity-5"
                  style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "6px 6px" }}
                ></div>
                <div className="flex justify-between items-start relative z-10">
                  <span className="text-[7px] font-bold uppercase tracking-widest text-green-700 bg-green-50 px-2 py-[2px] rounded-full border border-green-100">
                    Admit One
                  </span>
                  <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="white" strokeWidth="2" />
                      <circle cx="12" cy="12" r="3" fill="white" />
                    </svg>
                  </div>
                </div>
                <div className="relative z-10">
                  <span className="block text-[14px] font-black italic text-zinc-900 leading-none tracking-tight">
                    CONNECT.
                  </span>
                  <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">Access Pass 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT SECTION: Content + Cards */}
          <div className="lg:col-span-8 flex flex-col items-start space-y-6">
            {/* 1. Main Title */}
            <h1 className="relative z-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[0.8] text-zinc-900 mb-4 md:mb-6 opacity-0 animate-[slideUp_1s_ease-out_0.2s_forwards] -ml-1 tracking-tight">
              <span className="font-light block">SYNERGY</span>
              <span className="font-serif italic font-bold block text-zinc-800">CON 2.0</span>
            </h1>

            {/* 2. Description */}
            <div className="mb-4 md:mb-6 opacity-0 animate-[fadeIn_1s_ease-out_0.5s_forwards] border-l-2 border-black pl-3 md:pl-4 ml-2">
              <p className="text-xs md:text-sm lg:text-base text-zinc-600 max-w-2xl font-light leading-relaxed">
                Three days of creativity, technology, economy and culture converging in the heart of Lagos. The{" "}
                <span className="font-semibold text-black">Blueprint for Creative Growth</span>.
              </p>
            </div>

            {/* 3. Global Tags */}
            <div className="flex flex-wrap gap-2 mb-6 md:mb-8 ml-2 opacity-0 animate-[slideUp_1s_ease-out_0.6s_forwards]">
              <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full bg-white border border-black shadow-sm text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-800">
                <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5 text-zinc-500" />
                <span>Feb 04-06, 2026</span>
              </div>
              <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full bg-white border border-black shadow-sm text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-800">
                <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 text-zinc-500" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>

            {/* Desktop Cards Grid */}
            <div className="hidden md:grid grid-cols-3 gap-4 mb-8">
              {/* DAY 01 Card */}
              <Link
                href="/schedule?day=1"
                className="group relative bg-white border border-black p-4 rounded-2xl transition-all duration-300 hover:bg-zinc-50 hover:shadow-lg relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-zinc-100 text-zinc-900 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                    Day 01
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                </div>
                <div className="mb-2">
                  <span className="text-xs font-bold text-zinc-500 block mb-1">FEB 4, 2026</span>
                  <h4 className="text-sm font-bold text-zinc-900 leading-tight">Arts, Sculpture & Design</h4>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-3 line-clamp-3">
                  A celebration of visual storytelling, from traditional sculpture to digital art.
                </p>
                <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-900">
                  <MapPin className="w-3 h-3" />
                  <span>Federal Palace, VI</span>
                </div>
              </Link>

              {/* DAY 02 Card */}
              <Link
                href="/schedule?day=2"
                className="group relative bg-white border border-black p-4 rounded-2xl transition-all duration-300 hover:bg-zinc-50 hover:shadow-lg relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-zinc-100 text-zinc-900 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                    Day 02
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                </div>
                <div className="mb-2">
                  <span className="text-xs font-bold text-zinc-500 block mb-1">FEB 5, 2026</span>
                  <h4 className="text-sm font-bold text-zinc-900 leading-tight">Fashion, Film & Photo</h4>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-3 line-clamp-3">
                  Exploring the narrative power of the lens and the loom.
                </p>
                <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-900">
                  <MapPin className="w-3 h-3" />
                  <span>Royal Box, VI</span>
                </div>
              </Link>

              {/* DAY 03 Card */}
              <Link
                href="/schedule?day=3"
                className="group relative bg-white border border-black p-4 rounded-2xl transition-all duration-300 hover:bg-zinc-50 hover:shadow-lg relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-zinc-100 text-zinc-900 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                    Day 03
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                </div>
                <div className="mb-2">
                  <span className="text-xs font-bold text-zinc-500 block mb-1">FEB 6, 2026</span>
                  <h4 className="text-sm font-bold text-zinc-900 leading-tight">Music, Tech & Gaming</h4>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-3 line-clamp-3">
                  The fusion of sound, code, and play in the digital age.
                </p>
                <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-900">
                  <MapPin className="w-3 h-3" />
                  <span>Police College, Ikeja</span>
                </div>
              </Link>
            </div>
          </div>

          {/* RIGHT SECTION: Countdown Container - Desktop only */}
          <div className="hidden lg:flex lg:col-span-4 justify-center">
            <div className="w-full max-w-md bg-black border border-zinc-800 rounded-[2rem] p-4 md:p-5 lg:p-6 shadow-2xl shadow-black/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              <div className="text-center mb-4 md:mb-6 relative z-10">
                <span className="inline-block text-[9px] md:text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400 border-b border-zinc-700 pb-2">
                  Event Starts In
                </span>
              </div>
              <Countdown targetDate="2026-02-04T09:00:00" />
              <div className="mt-3 md:mt-4 flex justify-center items-center gap-2 md:gap-3 relative z-10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
                </span>
                <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">
                  Registration is live
                </span>
              </div>
              <div className="mt-3 md:mt-4 relative z-10 flex flex-col gap-2">
                <Link
                  href="/register"
                  className="w-full group relative px-4 py-2.5 md:px-5 md:py-3 bg-white text-black font-bold text-xs uppercase tracking-[0.15em] overflow-hidden transition-all duration-300 hover:shadow-lg rounded-xl block"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 md:gap-3">
                    Secure Your Spot
                    <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-zinc-100 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out"></div>
                </Link>
                <Link
                  href="/schedule"
                  className="w-full group relative px-5 py-3 bg-transparent text-white font-bold text-xs uppercase tracking-[0.15em] border border-zinc-700 overflow-hidden transition-all duration-300 hover:bg-zinc-900 rounded-xl block text-center"
                >
                  View Agenda
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden mt-6">
          <div className="overflow-x-auto pb-4 -mx-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex gap-4 px-6">
              {/* DAY 01 Card */}
              <Link
                href="/schedule?day=1"
                className="group relative bg-white border border-black p-4 rounded-2xl transition-all duration-300 hover:bg-zinc-50 hover:shadow-lg overflow-hidden min-w-[85vw] max-w-[85vw] flex-shrink-0"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-zinc-100 text-zinc-900 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                    Day 01
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                </div>
                <div className="mb-2">
                  <span className="text-xs font-bold text-zinc-500 block mb-1">FEB 4, 2026</span>
                  <h4 className="text-sm font-bold text-zinc-900 leading-tight">Arts, Sculpture & Design</h4>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-3 line-clamp-3">
                  A celebration of visual storytelling, from traditional sculpture to digital art.
                </p>
                <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-900">
                  <MapPin className="w-3 h-3" />
                  <span>Federal Palace, VI</span>
                </div>
              </Link>

              {/* DAY 02 Card */}
              <Link
                href="/schedule?day=2"
                className="group relative bg-white border border-black p-4 rounded-2xl transition-all duration-300 hover:bg-zinc-50 hover:shadow-lg overflow-hidden min-w-[85vw] max-w-[85vw] flex-shrink-0"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-zinc-100 text-zinc-900 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                    Day 02
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                </div>
                <div className="mb-2">
                  <span className="text-xs font-bold text-zinc-500 block mb-1">FEB 5, 2026</span>
                  <h4 className="text-sm font-bold text-zinc-900 leading-tight">Fashion, Film & Photo</h4>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-3 line-clamp-3">
                  Exploring the narrative power of the lens and the loom.
                </p>
                <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-900">
                  <MapPin className="w-3 h-3" />
                  <span>Royal Box, VI</span>
                </div>
              </Link>

              {/* DAY 03 Card */}
              <Link
                href="/schedule?day=3"
                className="group relative bg-white border border-black p-4 rounded-2xl transition-all duration-300 hover:bg-zinc-50 hover:shadow-lg overflow-hidden min-w-[85vw] max-w-[85vw] flex-shrink-0"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-zinc-100 text-zinc-900 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                    Day 03
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                </div>
                <div className="mb-2">
                  <span className="text-xs font-bold text-zinc-500 block mb-1">FEB 6, 2026</span>
                  <h4 className="text-sm font-bold text-zinc-900 leading-tight">Music, Tech & Gaming</h4>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-3 line-clamp-3">
                  The fusion of sound, code, and play in the digital age.
                </p>
                <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-900">
                  <MapPin className="w-3 h-3" />
                  <span>Police College, Ikeja</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Countdown - Below day cards, edge to edge */}
        <div className="lg:hidden mt-6 -mx-6">
          <div className="bg-black border-y border-zinc-800 px-6 py-4 shadow-2xl shadow-black/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="text-center mb-4 relative z-10">
              <span className="inline-block text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-400 border-b border-zinc-700 pb-2">
                Event Starts In
              </span>
            </div>
            <CountdownMobile targetDate="2026-02-04T09:00:00" />
            <div className="mt-4 flex justify-center items-center gap-2 relative z-10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-400">
                Registration is live
              </span>
            </div>
            <div className="mt-4 relative z-10 flex flex-col gap-2">
              <Link
                href="/register"
                className="w-full group relative px-4 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-[0.15em] overflow-hidden transition-all duration-300 hover:shadow-lg rounded-xl block"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Secure Your Spot
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-zinc-100 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out"></div>
              </Link>
              <Link
                href="/schedule"
                className="w-full group relative px-4 py-2.5 bg-transparent text-white font-bold text-xs uppercase tracking-[0.15em] border border-zinc-700 overflow-hidden transition-all duration-300 hover:bg-zinc-900 rounded-xl block text-center"
              >
                View Agenda
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation Keyframes injection */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  )
}

export default Hero