import { create } from 'zustand'
import type { CacheState, CacheStats, CacheItem } from '@/types/stores'

// Re-export for backward compatibility
export type { CacheState, CacheStats, CacheItem }

export const useCacheStore = create<CacheState>((set, get) => ({
  isSupported: typeof window !== 'undefined' && 'caches' in window,
  stats: {
    totalSize: 0,
    itemCount: 0,
    lastUpdated: null,
  },
  caches: [],
  isLoading: false,

  updateStats: async () => {
    if (!get().isSupported) return
    
    set({ isLoading: true })
    
    try {
      const cacheNames = await caches.keys()
      const cacheItems: CacheItem[] = []
      let totalSize = 0
      let itemCount = 0
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const requests = await cache.keys()
        
        let cacheSize = 0
        for (const request of requests) {
          const response = await cache.match(request)
          if (response) {
            const blob = await response.clone().blob()
            cacheSize += blob.size
            itemCount++
          }
        }
        
        cacheItems.push({
          name: cacheName,
          size: cacheSize,
          lastModified: Date.now(),
        })
        
        totalSize += cacheSize
      }
      
      set({
        stats: {
          totalSize,
          itemCount,
          lastUpdated: Date.now(),
        },
        caches: cacheItems,
        isLoading: false,
      })
    } catch (error) {
      console.error('Error updating cache stats:', error)
      set({ isLoading: false })
    }
  },

  clearCache: async (cacheName) => {
    if (!get().isSupported) return
    
    try {
      if (cacheName) {
        await caches.delete(cacheName)
      } else {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((name) => caches.delete(name)))
      }
      
      await get().updateStats()
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  },

  clearOldCaches: async (maxAge) => {
    if (!get().isSupported) return
    
    try {
      const cacheNames = await caches.keys()
      const now = Date.now()
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const requests = await cache.keys()
        
        for (const request of requests) {
          const response = await cache.match(request)
          if (response) {
            const dateHeader = response.headers.get('date')
            if (dateHeader) {
              const cacheDate = new Date(dateHeader).getTime()
              if (now - cacheDate > maxAge) {
                await cache.delete(request)
              }
            }
          }
        }
      }
      
      await get().updateStats()
    } catch (error) {
      console.error('Error clearing old caches:', error)
    }
  },

  preloadResources: async (urls) => {
    if (!get().isSupported) return
    
    try {
      const cache = await caches.open('preload-cache')
      
      await Promise.all(
        urls.map(async (url) => {
          try {
            const response = await fetch(url)
            if (response.ok) {
              await cache.put(url, response)
            }
          } catch (error) {
            console.warn(`Failed to preload: ${url}`, error)
          }
        })
      )
      
      await get().updateStats()
    } catch (error) {
      console.error('Error preloading resources:', error)
    }
  },
}))
