'use client'

import { Settings, Sparkles, Clock, Mail } from "lucide-react"

export function MaintenancePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Logo/Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/30 animate-bounce">
              <Settings className="w-12 h-12 text-white animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
        </div>

        {/* Brand */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            Synergy<span className="text-amber-400">Con</span>
          </h1>
          <p className="text-amber-400/80 text-sm font-medium tracking-widest uppercase">
            Nigeria&apos;s Premier Creative Economy Conference
          </p>
        </div>

        {/* Main Message */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-center gap-2 text-amber-400 mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Under Maintenance</span>
            <Sparkles className="w-5 h-5" />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            We&apos;re Making Things Better
          </h2>
          
          <p className="text-slate-300 text-lg leading-relaxed mb-6">
            Our team is working hard to bring you an amazing new experience. 
            We&apos;ll be back shortly with something spectacular!
          </p>

          {/* Estimated Time */}
          <div className="inline-flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full text-slate-300">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-sm">Expected back soon</span>
          </div>
        </div>

        {/* Contact Section */}
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">
            Have questions? Reach out to us:
          </p>
          <a 
            href="mailto:info@synergycon.ng" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25"
          >
            <Mail className="w-5 h-5" />
            Contact Us
          </a>
        </div>

        {/* Social Links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-slate-500 text-sm mb-4">Follow us for updates</p>
          <div className="flex justify-center gap-6">
            <a href="https://twitter.com/synergycon" className="text-slate-400 hover:text-amber-400 transition-colors" aria-label="Twitter">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://instagram.com/synergycon" className="text-slate-400 hover:text-amber-400 transition-colors" aria-label="Instagram">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>
            </a>
            <a href="https://linkedin.com/company/synergycon" className="text-slate-400 hover:text-amber-400 transition-colors" aria-label="LinkedIn">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-slate-600 text-xs">
          © 2026 SynergyCon. All rights reserved.
        </p>
      </div>
      
      {/* Preview bypass link - bottom right corner */}
      <a 
        href="/?preview=synergy2026"
        className="fixed bottom-2 right-2 text-slate-700/30 hover:text-slate-500 text-[10px] transition-colors"
      >
        •djeheenen
      </a>
    </main>
  )
}
