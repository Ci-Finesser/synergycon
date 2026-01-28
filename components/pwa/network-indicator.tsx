'use client'

import { useEffect, useState } from 'react'
import { useNetworkStore } from '@/lib/stores/network-store'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi, SignalHigh, SignalMedium, SignalLow } from 'lucide-react'

export function NetworkIndicator() {
  const { isOnline, quality } = useNetworkStore()
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    // Show indicator when offline or when network quality is poor
    if (!isOnline || quality === 'slow') {
      setShowIndicator(true)
    } else {
      // Hide after a delay when back online with good connection
      const timeout = setTimeout(() => {
        setShowIndicator(false)
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [isOnline, quality])

  const getIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />
    
    switch (quality) {
      case 'excellent':
        return <SignalHigh className="h-4 w-4" />
      case 'good':
        return <Wifi className="h-4 w-4" />
      case 'slow':
        return <SignalLow className="h-4 w-4" />
      default:
        return <SignalMedium className="h-4 w-4" />
    }
  }

  const getMessage = () => {
    if (!isOnline) return 'You are offline'
    
    switch (quality) {
      case 'excellent':
        return 'Excellent connection'
      case 'good':
        return 'Good connection'
      case 'slow':
        return 'Slow connection'
      default:
        return 'Connected'
    }
  }

  const getColor = () => {
    if (!isOnline) return 'bg-destructive text-destructive-foreground'
    
    switch (quality) {
      case 'excellent':
        return 'bg-green-500 text-white'
      case 'good':
        return 'bg-blue-500 text-white'
      case 'slow':
        return 'bg-yellow-500 text-black'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg ${getColor()}`}>
            {getIcon()}
            <span className="text-sm font-medium">{getMessage()}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
