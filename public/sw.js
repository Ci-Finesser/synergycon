// Service Worker with advanced caching strategies
/// <reference lib="webworker" />

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * @typedef {Object} CacheConfig
 * @property {string} name - Cache name
 * @property {number} maxSize - Maximum number of items
 * @property {number} maxAge - Maximum age in milliseconds
 */

// Proper type definitions
const CACHE_VERSION = 'v1'
const STATIC_CACHE = `static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`
const IMAGE_CACHE = `images-${CACHE_VERSION}`
const API_CACHE = `api-${CACHE_VERSION}`

// ============================================================================
// Configuration
// ============================================================================

const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
]

/** @type {Record<string, number>} */
const MAX_CACHE_SIZE = {
  [DYNAMIC_CACHE]: 50,
  [IMAGE_CACHE]: 60,
  [API_CACHE]: 20,
}

/** @type {Record<string, number>} */
const CACHE_EXPIRATION = {
  [DYNAMIC_CACHE]: 7 * 24 * 60 * 60 * 1000, // 7 days
  [IMAGE_CACHE]: 30 * 24 * 60 * 60 * 1000, // 30 days
  [API_CACHE]: 5 * 60 * 1000, // 5 minutes
}

// ============================================================================
// Install Event - Cache static assets with error handling
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(STATIC_CACHE)
        console.log('[SW] Caching static assets')
        
        // Handle individual assets, skip failures
        // This prevents install failure if one asset is missing
        const results = await Promise.allSettled(
          STATIC_ASSETS.map(asset =>
            cache.add(asset).catch(err => {
              console.warn(`[SW] Failed to cache ${asset}:`, err)
              return Promise.resolve() // Continue even if fails
            })
          )
        )
        
        const failed = results.filter(r => r.status === 'rejected')
        if (failed.length > 0) {
          console.warn(`[SW] ${failed.length} assets failed to cache, but installation continues`)
        }
        
        // Skip waiting - activate immediately
        return self.skipWaiting()
      } catch (error) {
        console.error('[SW] Install event error:', error)
        throw error
      }
    })()
  )
})

// ============================================================================
// Activate Event - Clean up old caches
// ============================================================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys()
        const oldCaches = cacheNames.filter((name) => {
          return (name.startsWith('static-') || 
                  name.startsWith('dynamic-') || 
                  name.startsWith('images-') ||
                  name.startsWith('api-')) &&
                 (name !== STATIC_CACHE &&
                  name !== DYNAMIC_CACHE &&
                  name !== IMAGE_CACHE &&
                  name !== API_CACHE)
        })
        
        const deleteResults = await Promise.allSettled(
          oldCaches.map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
        )
        
        const failed = deleteResults.filter(r => r.status === 'rejected')
        if (failed.length > 0) {
          console.warn(`[SW] Failed to delete ${failed.length} old caches`)
        }
        
        return self.clients.claim()
      } catch (error) {
        console.error('[SW] Activate event error:', error)
        throw error
      }
    })()
  )
})

// ============================================================================
// Fetch Event - Route to appropriate caching strategy
// ============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip chrome extensions and non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Skip critical API endpoints that should NEVER be cached or intercepted
  const criticalEndpoints = ['/api/csrf', '/api/auth', '/api/session']
  if (criticalEndpoints.some(endpoint => url.pathname.startsWith(endpoint))) {
    // Let these requests go directly to the network without SW intervention
    return
  }

  // API requests - Network First, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE))
    return
  }

  // Images - Cache First, fallback to network
  if (request.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE))
    return
  }

  // Static assets - Cache First
  if (url.pathname.match(/\.(css|js|woff|woff2|ttf|eot)$/)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE))
    return
  }

  // HTML pages - Network First, fallback to cache, then offline page
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithOffline(request))
    return
  }

  // Default - Network First
  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE))
})

// ============================================================================
// Caching Strategies
// ============================================================================

/**
 * Cache First Strategy - Return cached response, update in background
 * Best for: Images, static assets that don't change often
 */
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request, {
      ignoreSearch: false,
      ignoreMethod: false,
      ignoreVary: true, // Ignore Vary header for better cache hits
    })
    
    if (cachedResponse) {
      // Return cached response and update in background
      updateCacheInBackground(request, cacheName)
      // ✓ FIXED: Clone response before returning to prevent body consumption
      return cachedResponse.clone()
    }

    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      // ✓ FIXED: Clone response before storing
      cache.put(request, networkResponse.clone())
      limitCacheSize(cacheName)
    }
    
    // ✓ FIXED: Clone response before returning
    return networkResponse.clone()
  } catch (error) {
    console.error('[SW] Cache First strategy failed for:', request.url, error)
    return new Response('Network error', { 
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  }
}

/**
 * Network First Strategy - Try network, fallback to cache
 * Best for: API calls, dynamic content
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    
    // Only cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      // ✓ FIXED: Clone response before storing
      cache.put(request, networkResponse.clone())
      limitCacheSize(cacheName)
    }
    
    // ✓ FIXED: Clone response before returning
    // Return the response even if it's not OK (4xx, 5xx) - let the app handle it
    return networkResponse.clone()
  } catch (error) {
    // Only use cache fallback for actual network errors (offline, etc.)
    console.log('[SW] Network error, checking cache for:', request.url)
    
    try {
      const cachedResponse = await caches.match(request, {
        ignoreSearch: false,
        ignoreMethod: false,
        ignoreVary: true,
      })
      
      if (cachedResponse) {
        console.log('[SW] Using cached response for:', request.url)
        // ✓ FIXED: Clone response before returning
        return cachedResponse.clone()
      }
    } catch (cacheError) {
      console.error('[SW] Cache lookup failed:', cacheError)
    }
    
    // For API requests, return a proper JSON error instead of text
    const url = new URL(request.url)
    if (url.pathname.startsWith('/api/')) {
      console.error('[SW] API request failed and no cache available:', request.url)
      return new Response(JSON.stringify({ 
        error: 'Network error',
        message: 'Unable to connect to server. Please check your internet connection.'
      }), { 
        status: 503,
        headers: { 
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
    }
    
    // For other resources, return text error
    console.error('[SW] Network and cache failed for:', request.url, error)
    return new Response('Network error', { 
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  }
}

/**
 * Network First with Offline Fallback - Try network, cache, then offline page
 * Best for: HTML pages that need offline support
 */
async function networkFirstWithOffline(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      // ✓ FIXED: Clone response before storing
      cache.put(request, networkResponse.clone())
      limitCacheSize(DYNAMIC_CACHE)
    }
    
    // ✓ FIXED: Clone response before returning
    return networkResponse.clone()
  } catch (error) {
    console.log('[SW] Network failed, checking cache for:', request.url)
    
    try {
      const cachedResponse = await caches.match(request, {
        ignoreSearch: false,
        ignoreMethod: false,
        ignoreVary: true,
      })
      
      if (cachedResponse) {
        console.log('[SW] Using cached page')
        // ✓ FIXED: Clone response before returning
        return cachedResponse.clone()
      }
    } catch (cacheError) {
      console.error('[SW] Cache lookup failed:', cacheError)
    }
    
    // Return offline page
    try {
      const offlinePage = await caches.match('/offline', {
        ignoreSearch: true,
        ignoreMethod: true,
        ignoreVary: true,
      })
      
      if (offlinePage) {
        console.log('[SW] Serving offline page')
        // ✓ FIXED: Clone response before returning
        return offlinePage.clone()
      }
    } catch (err) {
      console.error('[SW] Failed to get offline page:', err)
    }
    
    // ✓ FIXED: Return proper HTML response with correct content-type
    console.log('[SW] No offline page, returning HTML error')
    return new Response(
      '<!DOCTYPE html>' +
      '<html lang="en">' +
      '<head>' +
      '<meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<title>Offline</title>' +
      '<style>' +
      'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; ' +
      'display: flex; justify-content: center; align-items: center; height: 100vh; ' +
      'margin: 0; background: #f5f5f5; }' +
      '.container { text-align: center; padding: 20px; }' +
      'h1 { color: #333; margin: 0 0 10px; }' +
      'p { color: #666; font-size: 16px; }' +
      '</style>' +
      '</head>' +
      '<body>' +
      '<div class="container">' +
      '<h1>You\'re Offline</h1>' +
      '<p>Please check your internet connection and try again.</p>' +
      '</div>' +
      '</body>' +
      '</html>',
      { 
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    )
  }
}

// ============================================================================
// Helper Functions - Cache Management
// ============================================================================

/**
 * Update cache in the background
 * ✓ FIXED: Now properly clones response before putting
 */
async function updateCacheInBackground(request, cacheName) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      // ✓ FIXED: Clone response before storing
      await cache.put(request, networkResponse.clone())
    }
  } catch (error) {
    // Silently fail background updates
    console.debug('[SW] Background cache update failed:', error)
  }
}

/**
 * Limit cache size to prevent storage bloat
 * ✓ FIXED: Now includes proper error handling for delete operations
 */
async function limitCacheSize(cacheName) {
  try {
    const maxSize = MAX_CACHE_SIZE[cacheName]
    if (!maxSize) return

    const cache = await caches.open(cacheName)
    const keys = await cache.keys()
    
    if (keys.length > maxSize) {
      // Remove oldest entries (first N items)
      const toDelete = keys.slice(0, keys.length - maxSize)
      const results = await Promise.allSettled(
        toDelete.map((key) => cache.delete(key))
      )
      
      const failed = results.filter(r => r.status === 'rejected')
      if (failed.length > 0) {
        console.warn(`[SW] Failed to delete ${failed.length} cache entries from ${cacheName}`)
      }
      
      console.log(`[SW] Limited ${cacheName} to ${maxSize} items`)
    }
  } catch (error) {
    console.error('[SW] Cache size limit error:', error)
  }
}

/**
 * Clean expired cache entries
 * ✓ FIXED: Now handles items without date headers gracefully
 */
async function cleanExpiredCache() {
  const now = Date.now()
  let totalCleaned = 0

  try {
    for (const [cacheName, maxAge] of Object.entries(CACHE_EXPIRATION)) {
      try {
        const cache = await caches.open(cacheName)
        const requests = await cache.keys()

        for (const request of requests) {
          try {
            const response = await cache.match(request)
            if (!response) continue

            const dateHeader = response.headers.get('date')
            if (dateHeader) {
              const cacheDate = new Date(dateHeader).getTime()
              if (now - cacheDate > maxAge) {
                await cache.delete(request)
                totalCleaned++
              }
            } else {
              // No date header - items without expiration info are kept
              // To properly expire these, consider storing timestamps in IndexedDB
              console.debug(`[SW] No date header for: ${request.url}`)
            }
          } catch (error) {
            console.warn(`[SW] Error processing cache entry ${request.url}:`, error)
          }
        }
      } catch (error) {
        console.error(`[SW] Error cleaning cache ${cacheName}:`, error)
      }
    }
    
    if (totalCleaned > 0) {
      console.log(`[SW] Cleaned ${totalCleaned} expired cache entries`)
    }
  } catch (error) {
    console.error('[SW] Cache cleanup failed:', error)
  }
}

// ============================================================================
// Background Sync
// ============================================================================

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-queue') {
    event.waitUntil(syncQueuedRequests())
  }
})

/**
 * Sync queued requests with error handling
 */
async function syncQueuedRequests() {
  try {
    // This will be handled by the sync queue store in the client
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      client.postMessage({ type: 'SYNC_QUEUE' })
    })
  } catch (error) {
    console.error('[SW] Sync queue error:', error)
  }
}

// ============================================================================
// Push Notifications
// ============================================================================

/**
 * Handle push notification events
 * ✓ FIXED: Comprehensive error handling for JSON parsing and showNotification
 */
self.addEventListener('push', (event) => {
  try {
    let data = {}
    
    // ✓ FIXED: Try-catch for JSON parsing
    try {
      data = event.data?.json() ?? {}
    } catch (parseError) {
      console.error('[SW] Failed to parse push data:', parseError)
      data = { 
        title: 'SynergyCon 2026',
        body: 'New notification from SynergyCon'
      }
    }
    
    const options = {
      body: data.body || 'New notification from SynergyCon',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'general',
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || [],
      data: data.data || {},
    }

    event.waitUntil(
      // ✓ FIXED: Error handling for showNotification
      self.registration.showNotification(data.title || 'SynergyCon 2026', options)
        .catch(err => {
          console.error('[SW] Failed to show notification:', err)
          // Fallback: just log it
          return Promise.resolve()
        })
    )
  } catch (error) {
    console.error('[SW] Push event error:', error)
  }
})

/**
 * Handle notification clicks
 * ✓ FIXED: Error handling for focus and openWindow
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    (async () => {
      try {
        const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            try {
              return await client.focus()
            } catch (focusError) {
              console.error('[SW] Failed to focus client:', focusError)
            }
          }
        }
        
        // Open new window
        if (self.clients.openWindow) {
          try {
            return await self.clients.openWindow(urlToOpen)
          } catch (openError) {
            console.error('[SW] Failed to open window:', openError)
          }
        }
      } catch (error) {
        console.error('[SW] Notification click error:', error)
      }
    })()
  )
})

// ============================================================================
// Periodic Background Sync
// ============================================================================

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanExpiredCache())
  }
})

// ============================================================================
// Message Handling
// ============================================================================

/**
 * Handle messages from the client
 * ✓ FIXED: Proper error handling for message operations
 */
self.addEventListener('message', (event) => {
  try {
    if (event.data?.type === 'SKIP_WAITING') {
      self.skipWaiting()
      return
    }
    
    if (event.data?.type === 'CACHE_URLS') {
      const urls = event.data.urls || []
      event.waitUntil(
        (async () => {
          try {
            const cache = await caches.open(DYNAMIC_CACHE)
            const results = await Promise.allSettled(
              urls.map((url) => cache.add(url))
            )
            
            const failed = results.filter(r => r.status === 'rejected')
            if (failed.length > 0) {
              console.warn(`[SW] Failed to cache ${failed.length} URLs`)
            }
          } catch (error) {
            console.error('[SW] CACHE_URLS error:', error)
          }
        })()
      )
      return
    }
  } catch (error) {
    console.error('[SW] Message handling error:', error)
  }
})

// ============================================================================
// Service Worker Initialization
// ============================================================================

console.log('[SW] Service worker loaded and ready')
