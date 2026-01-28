'use client'

import { useEffect, useState, useCallback } from 'react'
import { useNotificationStore } from '@/lib/stores/notification-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Bell, BellOff, CheckCircle2, Settings, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Switch } from '../ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// Configurable delay for showing the prompt (in milliseconds)
const PROMPT_DELAY_MS = 10000 // 10 seconds (reduced from 60s)

export function NotificationPermission() {
  const { 
    permission, 
    isSupported, 
    isInitialized,
    settings, 
    updateSettings,
    requestPermission,
    sendTestNotification,
    initialize,
  } = useNotificationStore()
  
  const [showPrompt, setShowPrompt] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)

  // Initialize notification store on mount
  useEffect(() => {
    console.log('[NotificationPermission] Component mounted, initializing...')
    initialize()
  }, [initialize])

  // Show prompt after delay if permission not granted/denied
  useEffect(() => {
    if (!isInitialized) {
      console.log('[NotificationPermission] Waiting for initialization...')
      return
    }
    
    console.log('[NotificationPermission] State:', { isSupported, permission, isInitialized })
    
    if (isSupported && permission === 'default') {
      console.log(`[NotificationPermission] Will show prompt in ${PROMPT_DELAY_MS / 1000}s`)
      const timeout = setTimeout(() => {
        console.log('[NotificationPermission] Showing notification prompt')
        setShowPrompt(true)
      }, PROMPT_DELAY_MS)
      
      return () => clearTimeout(timeout)
    }
  }, [isSupported, permission, isInitialized, isInitialized])

  const handleRequestPermission = useCallback(async () => {
    if (isRequesting) return
    
    console.log('[NotificationPermission] User clicked enable button')
    setIsRequesting(true)
    
    try {
      const granted = await requestPermission()
      console.log('[NotificationPermission] Permission result:', granted)
      
      if (granted) {
        setShowPrompt(false)
        // Small delay before test notification to ensure UI updates
        setTimeout(() => {
          sendTestNotification()
        }, 500)
      }
    } catch (error) {
      console.error('[NotificationPermission] Error requesting permission:', error)
    } finally {
      setIsRequesting(false)
    }
  }, [isRequesting, requestPermission, sendTestNotification])

  // Show prompt manually (can be called from other components)
  const showPromptManually = useCallback(() => {
    if (isSupported && permission === 'default') {
      setShowPrompt(true)
    }
  }, [isSupported, permission])

  // Don't render anything if not supported or not initialized
  if (!isInitialized || !isSupported) {
    return null
  }

  return (
    <>
      {/* Permission Request Prompt */}
      <AnimatePresence>
        {showPrompt && permission === 'default' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50"
          >
            <Card className="shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Enable Notifications</CardTitle>
                    <CardDescription className="text-xs">
                      Stay updated with event news
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-3 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Get notified about schedule changes, speaker announcements, and important updates.
                </p>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPrompt(false)}
                    className="flex-1"
                  >
                    Not now
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleRequestPermission}
                    className="flex-1"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Enable
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Notification Settings Icon */}
      <AnimatePresence>
        {permission === 'granted' && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-20 right-4 z-40"
          >
            <TooltipProvider>
              <Popover open={showSettings} onOpenChange={setShowSettings}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-full shadow-lg bg-background/95 backdrop-blur-sm border-2 hover:border-primary/50 transition-colors"
                        >
                          <motion.div
                            initial={false}
                            animate={{ rotate: settings.enabled ? 0 : 15 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            {settings.enabled ? (
                              <Bell className="h-5 w-5 text-primary" />
                            ) : (
                              <BellOff className="h-5 w-5 text-muted-foreground" />
                            )}
                          </motion.div>
                        </Button>
                      </motion.div>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Notification Settings</p>
                  </TooltipContent>
                </Tooltip>

                <PopoverContent 
                  side="top" 
                  align="end" 
                  className="w-80 p-0"
                  sideOffset={8}
                  asChild
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold text-sm">Notification Settings</h4>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="all-notifications" className="text-sm">All Notifications</Label>
                          <p className="text-xs text-muted-foreground">
                            Master toggle
                          </p>
                        </div>
                        <Switch
                          id="all-notifications"
                          checked={settings.enabled}
                          onCheckedChange={(checked: boolean) => updateSettings({ enabled: checked })}
                        />
                      </div>

                      <AnimatePresence>
                        {settings.enabled && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3 pt-2 border-t overflow-hidden"
                          >
                            <div className="flex items-center justify-between">
                              <Label htmlFor="event-reminders" className="text-sm">Event Reminders</Label>
                              <Switch
                                id="event-reminders"
                                checked={settings.eventReminders}
                                onCheckedChange={(checked: boolean) => updateSettings({ eventReminders: checked })}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <Label htmlFor="speaker-updates" className="text-sm">Speaker Updates</Label>
                              <Switch
                                id="speaker-updates"
                                checked={settings.speakerUpdates}
                                onCheckedChange={(checked: boolean) => updateSettings({ speakerUpdates: checked })}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <Label htmlFor="schedule-changes" className="text-sm">Schedule Changes</Label>
                              <Switch
                                id="schedule-changes"
                                checked={settings.scheduleChanges}
                                onCheckedChange={(checked: boolean) => updateSettings({ scheduleChanges: checked })}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <Label htmlFor="partner-announcements" className="text-sm">Partner Updates</Label>
                              <Switch
                                id="partner-announcements"
                                checked={settings.partnerAnnouncements}
                                onCheckedChange={(checked: boolean) => updateSettings({ partnerAnnouncements: checked })}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <Label htmlFor="marketing-updates" className="text-sm">Marketing</Label>
                              <Switch
                                id="marketing-updates"
                                checked={settings.marketingUpdates}
                                onCheckedChange={(checked: boolean) => updateSettings({ marketingUpdates: checked })}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={sendTestNotification}
                        className="w-full mt-2"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Test Notification
                      </Button>
                    </div>
                  </motion.div>
                </PopoverContent>
              </Popover>
            </TooltipProvider>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
