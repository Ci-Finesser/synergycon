import { create } from 'zustand'
import type { NetworkState, NetworkQuality, ConnectionType } from '@/types/stores'

// Re-export for backward compatibility
export type { NetworkState, NetworkQuality, ConnectionType }

export const useNetworkStore = create<NetworkState>((set, get) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  effectiveType: null,
  downlink: null,
  rtt: null,
  saveData: false,
  quality: 'good',
  connectionType: 'unknown',
  lastOnline: null,
  lastOffline: null,
  offlineCount: 0,

  setOnlineStatus: (online) => {
    const state = get()
    set({
      isOnline: online,
      lastOnline: online ? Date.now() : state.lastOnline,
      lastOffline: !online ? Date.now() : state.lastOffline,
      offlineCount: !online ? state.offlineCount + 1 : state.offlineCount,
    })
  },

  updateNetworkInfo: (info) => {
    set(info)
    const quality = get().getQuality()
    set({ quality })
  },

  getQuality: () => {
    const state = get()
    
    if (!state.isOnline) return 'offline'
    
    // Check effective connection type
    if (state.effectiveType) {
      if (state.effectiveType === '4g' || state.effectiveType === '5g') {
        return 'excellent'
      }
      if (state.effectiveType === '3g') {
        return 'good'
      }
      if (state.effectiveType === '2g' || state.effectiveType === 'slow-2g') {
        return 'slow'
      }
    }
    
    // Check RTT (Round Trip Time)
    if (state.rtt !== null) {
      if (state.rtt < 100) return 'excellent'
      if (state.rtt < 300) return 'good'
      if (state.rtt < 1000) return 'slow'
      return 'slow'
    }
    
    // Check downlink speed (Mbps)
    if (state.downlink !== null) {
      if (state.downlink > 10) return 'excellent'
      if (state.downlink > 1.5) return 'good'
      return 'slow'
    }
    
    return 'good'
  },
}))

// Initialize network listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useNetworkStore.getState().setOnlineStatus(true)
  })
  
  window.addEventListener('offline', () => {
    useNetworkStore.getState().setOnlineStatus(false)
  })
  
  // Network Information API
  const connection = (navigator as any).connection 
    || (navigator as any).mozConnection 
    || (navigator as any).webkitConnection
  
  if (connection) {
    const updateConnection = () => {
      useNetworkStore.getState().updateNetworkInfo({
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
        connectionType: connection.type || 'unknown',
      })
    }
    
    connection.addEventListener('change', updateConnection)
    updateConnection()
  }
}
