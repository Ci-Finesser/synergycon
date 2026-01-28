'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NotificationPermission } from '@/components/pwa/notification-permission'
import { CacheManager } from '@/components/pwa/cache-manager'
import { usePWAInstallStore } from '@/lib/stores/pwa-install-store'
import { useNetworkStore } from '@/lib/stores/network-store'
import { useSyncQueueStore } from '@/lib/stores/sync-queue-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Smartphone, 
  Wifi, 
  Database, 
  Bell, 
  Download,
  CheckCircle2,
  WifiOff
} from 'lucide-react'

export default function PWASettingsPage() {
  const { isInstalled, promptInstall, isInstallable } = usePWAInstallStore()
  const { isOnline, quality, effectiveType, downlink, rtt } = useNetworkStore()
  const { queue, getPendingCount, getFailedCount } = useSyncQueueStore()
  
  const pendingCount = getPendingCount()
  const failedCount = getFailedCount()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">PWA Settings</h1>
          <p className="text-muted-foreground">
            Manage your Progressive Web App experience
          </p>
        </div>

        {/* Installation Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <CardTitle>App Installation</CardTitle>
            </div>
            <CardDescription>
              Install the app for a native-like experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Installation Status</p>
                <p className="text-sm text-muted-foreground">
                  {isInstalled ? 'App is installed' : 'Not installed'}
                </p>
              </div>
              {isInstalled ? (
                <Badge variant="default" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Installed
                </Badge>
              ) : (
                <Badge variant="secondary">Not Installed</Badge>
              )}
            </div>

            {!isInstalled && isInstallable && (
              <Button onClick={promptInstall} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Install App
              </Button>
            )}

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium mb-1">Offline Access</p>
                <p className="text-xs text-muted-foreground">
                  {isInstalled ? 'Enabled' : 'Limited'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium mb-1">Push Notifications</p>
                <p className="text-xs text-muted-foreground">
                  {isInstalled ? 'Available' : 'Web only'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-5 w-5" />
              ) : (
                <WifiOff className="h-5 w-5" />
              )}
              <CardTitle>Network Status</CardTitle>
            </div>
            <CardDescription>
              Monitor your connection quality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Connection Status</p>
                <p className="text-sm text-muted-foreground">
                  {isOnline ? 'Connected' : 'Offline'}
                </p>
              </div>
              <Badge 
                variant={isOnline ? 'default' : 'destructive'}
                className="capitalize"
              >
                {quality}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="p-3 rounded-lg bg-muted text-center">
                <p className="font-medium mb-1">{effectiveType || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Type</p>
              </div>
              <div className="p-3 rounded-lg bg-muted text-center">
                <p className="font-medium mb-1">
                  {downlink ? `${downlink.toFixed(1)} Mbps` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Downlink</p>
              </div>
              <div className="p-3 rounded-lg bg-muted text-center">
                <p className="font-medium mb-1">
                  {rtt ? `${rtt}ms` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">RTT</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sync Queue */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Background Sync</CardTitle>
            </div>
            <CardDescription>
              Queued requests waiting to sync
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="p-3 rounded-lg bg-muted text-center">
                <p className="text-2xl font-bold">{queue.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                <p className="text-2xl font-bold text-blue-500">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10 text-center">
                <p className="text-2xl font-bold text-destructive">{failedCount}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationPermission />
          </CardContent>
        </Card>

        {/* Cache Management */}
        <CacheManager />
      </div>
    </div>
  )
}
