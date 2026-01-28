'use client'

import { useEffect } from 'react'
import { usePWAInstallStore } from '@/lib/stores/pwa-install-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, X, Smartphone, Monitor, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function PWAInstallPrompt() {
  const { 
    showInstallPrompt, 
    isInstalled, 
    promptInstall, 
    dismissInstallPrompt,
    checkIfInstalled,
    setInstallPromptEvent,
  } = usePWAInstallStore()

  useEffect(() => {
    checkIfInstalled()
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPromptEvent(e as any)
    }

    const handleAppInstalled = () => {
      usePWAInstallStore.getState().setIsInstalled(true)
      usePWAInstallStore.getState().setShowInstallPrompt(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [checkIfInstalled, setInstallPromptEvent])

  const handleInstall = async () => {
    await promptInstall()
  }

  if (isInstalled) {
    return null
  }

  return (
    <AnimatePresence>
      {showInstallPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50"
        >
          <Card className="shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Install SynergyCon App</CardTitle>
                    <CardDescription className="text-xs">
                      Access faster with offline support
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 -mr-2 -mt-2"
                  onClick={dismissInstallPrompt}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pb-3 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <span>Works offline</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span>Full screen</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted col-span-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span>Instant access from home screen</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex gap-2 pt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={dismissInstallPrompt}
                className="flex-1"
              >
                Not now
              </Button>
              <Button
                size="sm"
                onClick={handleInstall}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Install
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
