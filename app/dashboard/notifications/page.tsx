/**
 * Dashboard Notifications Page
 * View and manage all notifications
 */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useNotificationStore, type Notification } from "@/lib/stores/notification-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Info,
  AlertCircle,
  Trash2,
  Settings,
  ExternalLink,
  Loader2,
  Filter,
  RefreshCw,
} from "lucide-react"

export default function NotificationsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const {
    notifications,
    unreadCount,
    settings,
    permission,
    isSupported,
    isInitialized,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    updateSettings,
    requestPermission,
    sendTestNotification,
    initialize,
  } = useNotificationStore()

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all')

  // Initialize notification store on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      })
      markAsRead(notificationId)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    setIsLoading(true)
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
      })
      markAllAsRead()
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return
    
    removeNotification(notificationId)
  }

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all notifications?')) return
    
    setIsLoading(true)
    try {
      clearNotifications()
    } catch (error) {
      console.error('Error clearing notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestPermission = async () => {
    const granted = await requestPermission()
    if (granted) {
      sendTestNotification()
    }
  }

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    updateSettings({ [key]: value })
  }

  const filteredNotifications = notifications.filter((notification) => {
    const tabFilter = activeTab === 'unread' ? !notification.read : true
    const typeFilter = filter === 'all' ? true : notification.type === filter
    return tabFilter && typeFilter
  })

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-950/20'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20'
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-950/20'
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950/20'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    })
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Notifications</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Stay updated with important information
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4 mr-2" />
              )}
              Mark all read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={notifications.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear all
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-primary">{unreadCount}</p>
              </div>
              <BellOff className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Push Status</p>
                <p className="text-sm font-medium mt-1">
                  {permission === 'granted' ? (
                    <Badge variant="default">Enabled</Badge>
                  ) : permission === 'denied' ? (
                    <Badge variant="destructive">Denied</Badge>
                  ) : (
                    <Badge variant="secondary">Not set</Badge>
                  )}
                </p>
              </div>
              <Settings className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Notifications List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl">All Notifications</CardTitle>
                <div className="flex items-center gap-2">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="text-xs sm:text-sm border border-border rounded-lg px-2 py-1 bg-background"
                  >
                    <option value="all">All Types</option>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
              </div>
            </CardHeader>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <div className="px-4 sm:px-6">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="all">
                    All ({notifications.length})
                  </TabsTrigger>
                  <TabsTrigger value="unread">
                    Unread ({unreadCount})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-0">
                <div className="divide-y divide-border">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications</p>
                      <p className="text-xs mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-muted/50 transition-colors ${
                          !notification.read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${getTypeColor(notification.type)} flex-shrink-0`}>
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-medium text-sm sm:text-base line-clamp-2">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs text-muted-foreground">
                                {formatTimestamp(notification.timestamp)}
                              </p>
                              <div className="flex items-center gap-2">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="h-7 text-xs"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Mark read
                                  </Button>
                                )}
                                {notification.actionUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="h-7 text-xs"
                                  >
                                    <a href={notification.actionUrl}>
                                      <ExternalLink className="w-3 h-3 mr-1" />
                                      View
                                    </a>
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteNotification(notification.id)}
                                  className="h-7 text-xs text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="unread" className="mt-0">
                <div className="divide-y divide-border">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <CheckCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No unread notifications</p>
                      <p className="text-xs mt-1">You've read everything!</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 bg-primary/5 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${getTypeColor(notification.type)} flex-shrink-0`}>
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-medium text-sm sm:text-base line-clamp-2">
                                {notification.title}
                              </h4>
                              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs text-muted-foreground">
                                {formatTimestamp(notification.timestamp)}
                              </p>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="h-7 text-xs"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Mark read
                                </Button>
                                {notification.actionUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="h-7 text-xs"
                                  >
                                    <a href={notification.actionUrl}>
                                      <ExternalLink className="w-3 h-3 mr-1" />
                                      View
                                    </a>
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteNotification(notification.id)}
                                  className="h-7 text-xs text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-4">
          {/* Push Notifications */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Push Notifications</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Get notified about important updates
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              {!isSupported ? (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Push notifications are not supported in your browser.
                </p>
              ) : permission === 'default' ? (
                <Button
                  onClick={handleRequestPermission}
                  className="w-full"
                  size="sm"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Enable Push Notifications
                </Button>
              ) : permission === 'denied' ? (
                <div className="text-xs sm:text-sm text-muted-foreground">
                  <p className="mb-2">Push notifications are blocked.</p>
                  <p>Please enable them in your browser settings.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Badge variant="default" className="w-full justify-center">
                    Push Notifications Enabled
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={sendTestNotification}
                    className="w-full"
                  >
                    Send Test Notification
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Preferences</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Choose what you want to be notified about
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="enabled" className="text-xs sm:text-sm font-medium">
                    All Notifications
                  </label>
                  <Switch
                    id="enabled"
                    checked={settings.enabled}
                    onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="eventReminders" className="text-xs sm:text-sm">
                    Event Reminders
                  </label>
                  <Switch
                    id="eventReminders"
                    checked={settings.eventReminders}
                    onCheckedChange={(checked) => handleSettingChange('eventReminders', checked)}
                    disabled={!settings.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="speakerUpdates" className="text-xs sm:text-sm">
                    Speaker Updates
                  </label>
                  <Switch
                    id="speakerUpdates"
                    checked={settings.speakerUpdates}
                    onCheckedChange={(checked) => handleSettingChange('speakerUpdates', checked)}
                    disabled={!settings.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="scheduleChanges" className="text-xs sm:text-sm">
                    Schedule Changes
                  </label>
                  <Switch
                    id="scheduleChanges"
                    checked={settings.scheduleChanges}
                    onCheckedChange={(checked) => handleSettingChange('scheduleChanges', checked)}
                    disabled={!settings.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="partnerAnnouncements" className="text-xs sm:text-sm">
                    Partner Announcements
                  </label>
                  <Switch
                    id="partnerAnnouncements"
                    checked={settings.partnerAnnouncements}
                    onCheckedChange={(checked) => handleSettingChange('partnerAnnouncements', checked)}
                    disabled={!settings.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="marketingUpdates" className="text-xs sm:text-sm">
                    Marketing Updates
                  </label>
                  <Switch
                    id="marketingUpdates"
                    checked={settings.marketingUpdates}
                    onCheckedChange={(checked) => handleSettingChange('marketingUpdates', checked)}
                    disabled={!settings.enabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
