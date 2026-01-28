import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface QueuedRequest {
  id: string
  url: string
  type?: string
  method: string
  body?: any
  headers?: Record<string, string>
  timestamp: number
  retryCount: number
  maxRetries: number
  priority: 'low' | 'normal' | 'high'
  status: 'pending' | 'syncing' | 'failed' | 'completed'
  error?: string
}

interface SyncQueueState {
  queue: QueuedRequest[]
  isSyncing: boolean
  lastSyncAt: number | null
  
  // Actions
  addToQueue: (request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount' | 'status'>) => string
  removeFromQueue: (id: string) => void
  updateRequest: (id: string, updates: Partial<QueuedRequest>) => void
  processQueue: () => Promise<void>
  clearCompleted: () => void
  clearAll: () => void
  retryFailed: () => Promise<void>
  
  // Getters
  getPendingCount: () => number
  getFailedCount: () => number
}

export const useSyncQueueStore = create<SyncQueueState>()(
  persist(
    (set, get) => ({
      queue: [],
      isSyncing: false,
      lastSyncAt: null,

      addToQueue: (request) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newRequest: QueuedRequest = {
          ...request,
          id,
          timestamp: Date.now(),
          retryCount: 0,
          status: 'pending',
        }
        
        set((state) => ({
          queue: [...state.queue, newRequest].sort((a, b) => {
            // Sort by priority (high > normal > low) then by timestamp
            const priorityOrder = { high: 3, normal: 2, low: 1 }
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
            return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp
          }),
        }))
        
        return id
      },

      removeFromQueue: (id) => {
        set((state) => ({
          queue: state.queue.filter((req) => req.id !== id),
        }))
      },

      updateRequest: (id, updates) => {
        set((state) => ({
          queue: state.queue.map((req) =>
            req.id === id ? { ...req, ...updates } : req
          ),
        }))
      },

      processQueue: async () => {
        const state = get()
        if (state.isSyncing || !navigator.onLine) return
        
        const pendingRequests = state.queue.filter(
          (req) => req.status === 'pending' || req.status === 'failed'
        )
        
        if (pendingRequests.length === 0) return
        
        set({ isSyncing: true })
        
        for (const request of pendingRequests) {
          try {
            get().updateRequest(request.id, { status: 'syncing' })
            
            const response = await fetch(request.url, {
              method: request.method,
              headers: {
                'Content-Type': 'application/json',
                ...request.headers,
              },
              body: request.body ? JSON.stringify(request.body) : undefined,
            })
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            
            get().updateRequest(request.id, { status: 'completed' })
            
            // Auto-remove completed requests after 1 hour
            setTimeout(() => {
              get().removeFromQueue(request.id)
            }, 3600000)
            
          } catch (error: any) {
            const newRetryCount = request.retryCount + 1
            
            if (newRetryCount >= request.maxRetries) {
              get().updateRequest(request.id, {
                status: 'failed',
                error: error.message,
                retryCount: newRetryCount,
              })
            } else {
              get().updateRequest(request.id, {
                status: 'pending',
                retryCount: newRetryCount,
              })
            }
          }
        }
        
        set({ isSyncing: false, lastSyncAt: Date.now() })
      },

      clearCompleted: () => {
        set((state) => ({
          queue: state.queue.filter((req) => req.status !== 'completed'),
        }))
      },

      clearAll: () => {
        set({ queue: [] })
      },

      retryFailed: async () => {
        const state = get()
        const failedRequests = state.queue.filter((req) => req.status === 'failed')
        
        failedRequests.forEach((req) => {
          get().updateRequest(req.id, { status: 'pending', retryCount: 0 })
        })
        
        await get().processQueue()
      },

      getPendingCount: () => {
        return get().queue.filter((req) => 
          req.status === 'pending' || req.status === 'syncing'
        ).length
      },

      getFailedCount: () => {
        return get().queue.filter((req) => req.status === 'failed').length
      },
    }),
    {
      name: 'sync-queue-storage',
    }
  )
)

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    setTimeout(() => {
      useSyncQueueStore.getState().processQueue()
    }, 1000)
  })
}
