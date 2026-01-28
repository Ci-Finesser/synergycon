/**
 * Auth Store - User authentication & session management
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserProfile, SessionDTO } from '@/types/user'
import type { AuthState } from '@/types/stores'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      sessionToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: false,

      setSession: (session: SessionDTO) => {
        set({
          user: session.user,
          profile: session.profile,
          sessionToken: session.session_token,
          expiresAt: session.expires_at,
          isAuthenticated: true,
        })
      },

      clearSession: () => {
        set({
          user: null,
          profile: null,
          sessionToken: null,
          expiresAt: null,
          isAuthenticated: false,
        })
      },

      updateProfile: (profileUpdate: Partial<UserProfile>) => {
        const currentProfile = get().profile
        if (currentProfile) {
          set({
            profile: { ...currentProfile, ...profileUpdate },
          })
        }
      },

      checkSessionValidity: () => {
        const { expiresAt, clearSession } = get()
        if (!expiresAt) return false
        
        const now = new Date()
        const expiry = new Date(expiresAt)
        
        if (now >= expiry) {
          clearSession()
          return false
        }
        
        return true
      },

      logout: async () => {
        const { sessionToken, clearSession } = get()
        
        if (sessionToken) {
          try {
            await fetch('/api/user/auth/logout', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`,
              },
            })
          } catch (error) {
            console.error('Logout error:', error)
          }
        }
        
        clearSession()
      },
    }),
    {
      name: 'synergy-auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        sessionToken: state.sessionToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Helper hook to check and validate session on mount
export function useSessionCheck() {
  const checkSessionValidity = useAuthStore((state) => state.checkSessionValidity)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    const isValid = checkSessionValidity()
    return isValid
  }

  return false
}
