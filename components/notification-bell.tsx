"use client"

import { useEffect, useState } from 'react'
import { Bell, X, Check, Info, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useNotificationStore, type Notification } from '@/lib/stores/notification-store'

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    permission,
    isSupported,
    isInitialized,
    addNotification,
    markAsRead,
    markAllAsRead,
    setNotifications,
    requestPermission,
    initialize,
  } = useNotificationStore()

  const [isOpen, setIsOpen] = useState(false)

  // Initialize notification store on mount
  useEffect(() => {
    console.log('[NotificationBell] Initializing notification store...')
    initialize()
  }, [initialize])

  useEffect(() => {
    // Only fetch and connect after initialization
    if (!isInitialized) return
    
    // Fetch initial notifications
    fetchNotifications()

    // Connect to notification stream for real-time updates
    const eventSource = new EventSource('/api/notifications/stream')

    eventSource.onmessage = (event) => {
      try {
        const notification: Notification = JSON.parse(event.data)
        addNotification(notification)
        
        // Show browser notification if permitted
        if (isSupported && permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: notification.id,
            requireInteraction: notification.type === 'error',
          })
        }
      } catch (error) {
        console.error('Error parsing notification:', error)
      }
    }

    eventSource.onerror = () => {
      console.error('Notification stream error')
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [addNotification, isSupported, permission, isInitialized])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      
      if (res.ok && data.notifications) {
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

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
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
      })
      
      markAllAsRead()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleBellClick = async () => {
    setIsOpen(!isOpen)
    
    // Request notification permission if not granted
    if (isSupported && permission === 'default') {
      await requestPermission()
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id)
    }
    
    if (notification.actionUrl) {
      setIsOpen(false)
      window.location.href = notification.actionUrl
    }
  }

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
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
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
    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-full hover:bg-accent"
        onClick={handleBellClick}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown */}
          <Card className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] max-h-[600px] overflow-hidden rounded-2xl shadow-lg z-50 border-border">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-background sticky top-0">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs rounded-xl h-8 hover:bg-accent"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full h-8 w-8 hover:bg-accent"
                  aria-label="Close notifications"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[500px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                  <p className="text-xs mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleNotificationClick(notification)
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${getTypeColor(notification.type)} flex-shrink-0`}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm line-clamp-2">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div 
                                className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" 
                                aria-label="Unread"
                              />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border bg-muted/30 text-center sticky bottom-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm rounded-xl hover:bg-accent"
                  onClick={() => {
                    setIsOpen(false)
                    window.location.href = '/dashboard/notifications'
                  }}
                >
                  View all notifications
                </Button>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
