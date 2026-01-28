'use client'

import { useEffect, useState } from 'react'
import { useNetworkStore } from '@/lib/stores/network-store'
import { useSyncQueueStore } from '@/lib/stores/sync-queue-store'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  const { isOnline, quality, effectiveType, downlink, rtt } = useNetworkStore()
  const { getPendingCount, processQueue } = useSyncQueueStore()
  const [isRetrying, setIsRetrying] = useState(false)
  const pendingCount = getPendingCount()
  
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      processQueue()
    }
  }, [isOnline, pendingCount, processQueue])
  
  const handleRetry = async () => {
    setIsRetrying(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    window.location.reload()
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8 max-w-2xl mx-auto">
        <div className="flex justify-center mb-4">
          {isOnline ? (
            <Wifi className="w-24 h-24 text-green-500" />
          ) : (
            <WifiOff className="w-24 h-24 text-muted-foreground" />
          )}
        </div>
        
        <h1 className="text-4xl font-bold">
          {isOnline ? "Back Online!" : "You're Offline"}
        </h1>
        
        <p className="text-muted-foreground max-w-md">
          {isOnline 
            ? "Your connection has been restored. Syncing queued actions..."
            : "It looks like you've lost your internet connection. Some features may not be available until you're back online."
          }
        </p>
        
        {isOnline && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Connection Quality</p>
                <p className="text-muted-foreground capitalize">{quality}</p>
              </div>
              {effectiveType && (
                <div>
                  <p className="font-medium">Network Type</p>
                  <p className="text-muted-foreground uppercase">{effectiveType}</p>
                </div>
              )}
              {downlink !== null && (
                <div>
                  <p className="font-medium">Speed</p>
                  <p className="text-muted-foreground">{downlink.toFixed(1)} Mbps</p>
                </div>
              )}
              {rtt !== null && (
                <div>
                  <p className="font-medium">Latency</p>
                  <p className="text-muted-foreground">{rtt} ms</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {pendingCount > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
            <p className="text-sm font-medium">Pending Actions: {pendingCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isOnline ? "Syncing now..." : "Will sync when connection is restored"}
            </p>
          </div>
        )}
        
        <div className="pt-4">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
        
        <p className="text-sm text-muted-foreground pt-4">
          Cached pages and data will still be available
        </p>
      </div>
    </div>
  )
}
