import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAInstallState {
  // Installation state
  isInstallable: boolean
  isInstalled: boolean
  installPromptEvent: BeforeInstallPromptEvent | null
  showInstallPrompt: boolean
  installDismissedCount: number
  lastDismissedAt: number | null
  
  // Actions
  setInstallPromptEvent: (event: BeforeInstallPromptEvent | null) => void
  setShowInstallPrompt: (show: boolean) => void
  promptInstall: () => Promise<boolean>
  dismissInstallPrompt: () => void
  setIsInstalled: (installed: boolean) => void
  checkIfInstalled: () => void
}

export const usePWAInstallStore = create<PWAInstallState>()(
  persist(
    (set, get) => ({
      isInstallable: false,
      isInstalled: false,
      installPromptEvent: null,
      showInstallPrompt: false,
      installDismissedCount: 0,
      lastDismissedAt: null,

      setInstallPromptEvent: (event) => {
        set({ 
          installPromptEvent: event,
          isInstallable: !!event,
        })
        
        // Auto-show prompt if user hasn't dismissed it too many times
        const state = get()
        const daysSinceLastDismiss = state.lastDismissedAt 
          ? (Date.now() - state.lastDismissedAt) / (1000 * 60 * 60 * 24)
          : Infinity
          
        if (event && state.installDismissedCount < 3 && daysSinceLastDismiss > 7) {
          // Wait 30 seconds before showing to not interrupt initial experience
          setTimeout(() => {
            set({ showInstallPrompt: true })
          }, 30000)
        }
      },

      setShowInstallPrompt: (show) => set({ showInstallPrompt: show }),

      promptInstall: async () => {
        const state = get()
        if (!state.installPromptEvent) return false

        try {
          await state.installPromptEvent.prompt()
          const choice = await state.installPromptEvent.userChoice
          
          if (choice.outcome === 'accepted') {
            set({ 
              isInstalled: true,
              showInstallPrompt: false,
              installPromptEvent: null,
            })
            return true
          } else {
            set({ 
              showInstallPrompt: false,
              installDismissedCount: state.installDismissedCount + 1,
              lastDismissedAt: Date.now(),
            })
            return false
          }
        } catch (error) {
          console.error('Error prompting PWA install:', error)
          return false
        }
      },

      dismissInstallPrompt: () => {
        const state = get()
        set({ 
          showInstallPrompt: false,
          installDismissedCount: state.installDismissedCount + 1,
          lastDismissedAt: Date.now(),
        })
      },

      setIsInstalled: (installed) => set({ isInstalled: installed }),

      checkIfInstalled: () => {
        if (typeof window === 'undefined') return
        
        // Check if app is in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
          || (window.navigator as any).standalone
          || document.referrer.includes('android-app://')
        
        set({ isInstalled: isStandalone })
      },
    }),
    {
      name: 'pwa-install-storage',
      partialize: (state) => ({
        installDismissedCount: state.installDismissedCount,
        lastDismissedAt: state.lastDismissedAt,
        isInstalled: state.isInstalled,
      }),
    }
  )
)
