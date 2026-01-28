'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, X, Download } from 'lucide-react'

const DISMISS_STORAGE_KEY = 'sw-update-dismissed'
const DISMISS_DURATION_MS = 4 * 60 * 60 * 1000 // 4 hours

export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)

  // Check if user recently dismissed the notification
  const wasDismissedRecently = useCallback(() => {
    if (typeof window === 'undefined') return false
    const dismissed = localStorage.getItem(DISMISS_STORAGE_KEY)
    if (!dismissed) return false
    const dismissedAt = parseInt(dismissed, 10)
    return Date.now() - dismissedAt < DISMISS_DURATION_MS
  }, [])

  // Handle the update action
  const handleUpdate = useCallback(() => {
    const waitingSW = registrationRef.current?.waiting
    
    if (waitingSW) {
      setIsUpdating(true)
      
      // Listen for the controlling event to reload
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      }, { once: true })
      
      // Tell the waiting SW to skip waiting and become active
      waitingSW.postMessage({ type: 'SKIP_WAITING' })
    }
  }, [])

  // Dismiss the notification
  const handleDismiss = useCallback(() => {
    setShowUpdate(false)
    // Remember dismissal for 4 hours
    localStorage.setItem(DISMISS_STORAGE_KEY, Date.now().toString())
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    let updateCheckInterval: NodeJS.Timeout | null = null

    const showUpdateIfAllowed = () => {
      if (!wasDismissedRecently()) {
        setShowUpdate(true)
      }
    }

    const trackInstalling = (worker: ServiceWorker) => {
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          // New SW installed and waiting - show update prompt
          console.log('[UpdateNotification] New service worker installed and waiting')
          showUpdateIfAllowed()
        }
      })
    }

    const checkForUpdates = async () => {
      try {
        const reg = await navigator.serviceWorker.ready
        registrationRef.current = reg

        // Check if there's already a waiting SW
        if (reg.waiting) {
          console.log('[UpdateNotification] Service worker already waiting')
          showUpdateIfAllowed()
        }

        // Listen for new installing SW
        reg.addEventListener('updatefound', () => {
          console.log('[UpdateNotification] Update found, tracking installation...')
          const newWorker = reg.installing
          if (newWorker) {
            trackInstalling(newWorker)
          }
        })

        // Check for updates periodically (every 2 hours) - silent, no UI
        updateCheckInterval = setInterval(() => {
          reg.update().catch(() => {
            // Silent fail - this is a background operation
          })
        }, 2 * 60 * 60 * 1000)

      } catch (error) {
        console.error('[UpdateNotification] Error setting up update detection:', error)
      }
    }

    // Check for updates when user returns to tab (silently)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && registrationRef.current) {
        registrationRef.current.update().catch(() => {
          // Silent fail
        })
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    checkForUpdates()

    // Handle page reload scenario - detect if SW changed while page was loading
    let refreshing = false
    const handleControllerChange = () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

    return () => {
      if (updateCheckInterval) {
        clearInterval(updateCheckInterval)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
    }
  }, [wasDismissedRecently])

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 right-4 left-4 md:left-auto md:w-80 z-40"
        >
          <Card className="shadow-lg border bg-background/95 backdrop-blur-sm">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-500/10">
                    <Download className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">Update Available</CardTitle>
                    <CardDescription className="text-xs">
                      New features & improvements
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 -mr-2 -mt-2"
                  onClick={handleDismiss}
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-3 pt-0 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="flex-1 h-8 text-xs"
                disabled={isUpdating}
              >
                Later
              </Button>
              <Button
                size="sm"
                onClick={handleUpdate}
                className="flex-1 h-8 text-xs"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Update
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
