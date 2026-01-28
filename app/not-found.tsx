'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center px-4">
        <h1 className="text-7xl font-bold text-white mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-slate-100 mb-2">Page Not Found</h2>
        <p className="text-slate-400 text-lg mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            ← Back to Home
          </Link>
          <Link
            href="/schedule"
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            View Schedule
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700">
          <p className="text-slate-500 text-sm mb-4">Need help? Try these:</p>
          <nav className="flex flex-wrap justify-center gap-6">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/speakers" className="text-slate-400 hover:text-white transition-colors">
              Speakers
            </Link>
            <Link href="/schedule" className="text-slate-400 hover:text-white transition-colors">
              Schedule
            </Link>
            <Link href="/about" className="text-slate-400 hover:text-white transition-colors">
              About
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
