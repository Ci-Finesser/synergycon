'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center px-4 max-w-md">
        <h1 className="text-6xl font-bold text-white mb-4">⚠️</h1>
        <h2 className="text-3xl font-semibold text-slate-100 mb-2">Something went wrong!</h2>
        <p className="text-slate-400 text-base mb-6 break-words">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>

        {error.digest && (
          <p className="text-slate-500 text-xs mb-6 font-mono bg-slate-800 p-2 rounded">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Back to Home
          </Link>
        </div>

        <div className="pt-6 border-t border-slate-700">
          <p className="text-slate-500 text-sm">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    </div>
  )
}
