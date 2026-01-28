import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ActiveSession {
  id: string
  device: string
  browser: string
  os: string
  location: string
  ip: string
  lastActive: Date
  current: boolean
}

export interface LoginHistory {
  id: string
  device: string
  location: string
  ip: string
  timestamp: Date
  status: 'success' | 'failed'
  method: 'otp' | 'password' | '2fa'
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  loginAlertsEnabled: boolean
  sessionTimeout: number // minutes
  allowedDevices: string[]
}

interface SecurityState {
  // Settings
  settings: SecuritySettings
  
  // 2FA
  twoFactorEnabled: boolean
  twoFactorSecret: string | null
  isSettingUp2FA: boolean
  
  // Sessions
  activeSessions: ActiveSession[]
  isLoadingSessions: boolean
  
  // Login history
  loginHistory: LoginHistory[]
  isLoadingHistory: boolean
  
  // Alerts
  loginAlertsEnabled: boolean
  
  // Actions - Settings
  updateSettings: (settings: Partial<SecuritySettings>) => void
  
  // Actions - 2FA
  setup2FA: () => Promise<{ secret: string; qrCode: string }>
  verify2FA: (code: string) => Promise<boolean>
  disable2FA: () => Promise<boolean>
  
  // Actions - Sessions
  fetchSessions: () => Promise<void>
  revokeSession: (sessionId: string) => Promise<void>
  revokeAllSessions: () => Promise<void>
  
  // Actions - History
  fetchLoginHistory: () => Promise<void>
  
  // Actions - Alerts
  toggleLoginAlerts: () => Promise<void>
}

const defaultSettings: SecuritySettings = {
  twoFactorEnabled: false,
  loginAlertsEnabled: true,
  sessionTimeout: 30,
  allowedDevices: [],
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      isSettingUp2FA: false,
      activeSessions: [],
      isLoadingSessions: false,
      loginHistory: [],
      isLoadingHistory: false,
      loginAlertsEnabled: true,

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        })),

      setup2FA: async () => {
        set({ isSettingUp2FA: true })
        
        try {
          const res = await fetch('/api/user/security/2fa/setup', {
            method: 'POST',
          })
          
          if (!res.ok) throw new Error('Failed to setup 2FA')
          
          const data = await res.json()
          
          set({
            twoFactorSecret: data.secret,
          })
          
          return {
            secret: data.secret,
            qrCode: data.qrCode,
          }
        } catch (error) {
          console.error('2FA setup error:', error)
          throw error
        } finally {
          set({ isSettingUp2FA: false })
        }
      },

      verify2FA: async (code) => {
        try {
          const res = await fetch('/api/user/security/2fa/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          })
          
          if (!res.ok) throw new Error('Invalid code')
          
          set({
            twoFactorEnabled: true,
            settings: { ...get().settings, twoFactorEnabled: true }
          })
          
          return true
        } catch (error) {
          console.error('2FA verification error:', error)
          return false
        }
      },

      disable2FA: async () => {
        try {
          const res = await fetch('/api/user/security/2fa/disable', {
            method: 'POST',
          })
          
          if (!res.ok) throw new Error('Failed to disable 2FA')
          
          set({
            twoFactorEnabled: false,
            twoFactorSecret: null,
            settings: { ...get().settings, twoFactorEnabled: false }
          })
          
          return true
        } catch (error) {
          console.error('2FA disable error:', error)
          return false
        }
      },

      fetchSessions: async () => {
        set({ isLoadingSessions: true })
        
        try {
          const res = await fetch('/api/user/sessions')
          const data = await res.json()
          
          if (data.success) {
            set({ activeSessions: data.sessions })
          }
        } catch (error) {
          console.error('Fetch sessions error:', error)
        } finally {
          set({ isLoadingSessions: false })
        }
      },

      revokeSession: async (sessionId) => {
        try {
          const res = await fetch(`/api/user/sessions/${sessionId}`, {
            method: 'DELETE',
          })
          
          if (!res.ok) throw new Error('Failed to revoke session')
          
          set((state) => ({
            activeSessions: state.activeSessions.filter(s => s.id !== sessionId)
          }))
        } catch (error) {
          console.error('Revoke session error:', error)
          throw error
        }
      },

      revokeAllSessions: async () => {
        try {
          const res = await fetch('/api/user/sessions', {
            method: 'DELETE',
          })
          
          if (!res.ok) throw new Error('Failed to revoke all sessions')
          
          // Refresh sessions
          await get().fetchSessions()
        } catch (error) {
          console.error('Revoke all sessions error:', error)
          throw error
        }
      },

      fetchLoginHistory: async () => {
        set({ isLoadingHistory: true })
        
        try {
          const res = await fetch('/api/user/security/login-history')
          const data = await res.json()
          
          if (data.success) {
            set({ loginHistory: data.history })
          }
        } catch (error) {
          console.error('Fetch login history error:', error)
        } finally {
          set({ isLoadingHistory: false })
        }
      },

      toggleLoginAlerts: async () => {
        const newValue = !get().loginAlertsEnabled
        
        try {
          const res = await fetch('/api/user/security/login-alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: newValue }),
          })
          
          if (!res.ok) throw new Error('Failed to toggle login alerts')
          
          set({ loginAlertsEnabled: newValue })
        } catch (error) {
          console.error('Toggle login alerts error:', error)
          throw error
        }
      },
    }),
    {
      name: 'security-storage',
      partialize: (state) => ({
        settings: state.settings,
        loginAlertsEnabled: state.loginAlertsEnabled,
      }),
    }
  )
)
