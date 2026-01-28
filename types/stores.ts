/**
 * Store State Types
 * Centralized type definitions for Zustand stores
 */

import type { User, UserProfile, SessionDTO, Ticket as UserTicket } from './user'

/* ================================
   AUTH STORE TYPES
   ================================ */

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  sessionToken: string | null
  expiresAt: Date | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setSession: (session: SessionDTO) => void
  clearSession: () => void
  updateProfile: (profile: Partial<UserProfile>) => void
  checkSessionValidity: () => boolean
  logout: () => Promise<void>
}

/* ================================
   TICKETS STORE TYPES
   ================================ */

export interface StoreTicket {
  id: string
  order_id: string
  user_id: string
  ticket_type: 'early_bird' | 'regular' | 'vip' | 'enterprise'
  status: 'active' | 'used' | 'cancelled' | 'expired'
  qr_code?: string
  attendee_name: string
  attendee_email: string
  purchase_date: Date
  event_date: string
  seat_number?: string
  metadata?: Record<string, any>
}

export interface TeamMember {
  id: string
  name: string
  email: string
  ticket_id?: string
  status: 'pending' | 'sent' | 'accepted'
}

export interface TicketsState {
  // Tickets
  tickets: StoreTicket[]
  selectedTicket: StoreTicket | null
  isLoadingTickets: boolean

  // Enterprise features
  teamMembers: TeamMember[]
  isLoadingTeam: boolean

  // Filters
  filterStatus: 'all' | 'active' | 'used' | 'cancelled' | 'expired'

  // Actions
  setTickets: (tickets: StoreTicket[]) => void
  addTicket: (ticket: StoreTicket) => void
  updateTicket: (ticketId: string, updates: Partial<StoreTicket>) => void
  selectTicket: (ticket: StoreTicket | null) => void
  setLoadingTickets: (loading: boolean) => void

  // Enterprise actions
  setTeamMembers: (members: TeamMember[]) => void
  addTeamMember: (member: TeamMember) => void
  removeTeamMember: (memberId: string) => void
  assignTicket: (memberId: string, ticketId: string) => Promise<void>
  setLoadingTeam: (loading: boolean) => void

  // Filter actions
  setFilterStatus: (status: 'all' | 'active' | 'used' | 'cancelled' | 'expired') => void

  // API actions
  fetchTickets: () => Promise<void>
  downloadTicket: (ticketId: string) => Promise<void>
  emailTicket: (ticketId: string) => Promise<void>
  generateQRCode: (ticketId: string) => Promise<string>
  validateTicket: (ticketId: string, location: string, notes?: string) => Promise<void>
  transferTicket: (ticketId: string, toEmail: string, reason?: string) => Promise<void>
  refreshQRCode: (ticketId: string) => Promise<string>
  cancelTicket: (ticketId: string) => Promise<void>
  purchaseTicketsForTeam: (members: any[]) => Promise<void>
}

/* ================================
   NOTIFICATION STORE TYPES
   ================================ */

export type PermissionStatus = 'default' | 'granted' | 'denied'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  timestamp: Date
  actionUrl?: string
}

export interface NotificationSettings {
  enabled: boolean
  eventReminders: boolean
  speakerUpdates: boolean
  scheduleChanges: boolean
  partnerAnnouncements: boolean
  marketingUpdates: boolean
}

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface NotificationState {
  // In-app notifications
  notifications: Notification[]
  unreadCount: number

  // Permission & support detection
  permission: PermissionStatus
  isSupported: boolean
  isInitialized: boolean

  // Settings
  settings: NotificationSettings

  // Subscription
  subscription: PushSubscriptionData | null
  isSubscribed: boolean

  // In-app notification actions
  addNotification: (notification: Notification) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  setNotifications: (notifications: Notification[]) => void
  removeNotification: (notificationId: string) => void

  // Initialization - MUST be called on component mount
  initialize: () => Promise<void>

  // Push notification actions
  requestPermission: () => Promise<boolean>
  updateSettings: (settings: Partial<NotificationSettings>) => void
  subscribe: () => Promise<boolean>
  unsubscribe: () => Promise<boolean>
  sendTestNotification: () => void
}

/* ================================
   NETWORK STORE TYPES
   ================================ */

export type NetworkQuality = 'offline' | 'slow' | 'good' | 'excellent'
export type ConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'unknown'

export interface NetworkState {
  // Network status
  isOnline: boolean
  effectiveType: string | null
  downlink: number | null
  rtt: number | null
  saveData: boolean
  quality: NetworkQuality
  connectionType: ConnectionType

  // History
  lastOnline: number | null
  lastOffline: number | null
  offlineCount: number

  // Actions
  setOnlineStatus: (online: boolean) => void
  updateNetworkInfo: (info: Partial<NetworkState>) => void
  getQuality: () => NetworkQuality
}

/* ================================
   CACHE STORE TYPES
   ================================ */

export interface CacheStats {
  totalSize: number
  itemCount: number
  lastUpdated: number | null
}

export interface CacheItem {
  name: string
  size: number
  lastModified: number
}

export interface CacheState {
  // Cache status
  isSupported: boolean
  stats: CacheStats
  caches: CacheItem[]
  isLoading: boolean

  // Actions
  updateStats: () => Promise<void>
  clearCache: (cacheName?: string) => Promise<void>
  clearOldCaches: (maxAge: number) => Promise<void>
  preloadResources: (urls: string[]) => Promise<void>
}

/* ================================
   PWA INSTALL STORE TYPES
   ================================ */

export interface PWAInstallState {
  prompt: any
  isInstalled: boolean
  isIOS: boolean
  showPrompt: boolean

  // Actions
  setPrompt: (prompt: any) => void
  setInstalled: (installed: boolean) => void
  setShowPrompt: (show: boolean) => void
  install: () => Promise<void>
}

/* ================================
   SYNC QUEUE STORE TYPES
   ================================ */

export interface SyncRequest {
  id: string
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  timestamp: number
  priority: 'high' | 'normal' | 'low'
  retries: number
}

export interface SyncQueueState {
  queue: SyncRequest[]
  isOnline: boolean
  isSyncing: boolean

  // Actions
  addRequest: (request: SyncRequest) => void
  removeRequest: (id: string) => void
  clearQueue: () => void
  setOnlineStatus: (online: boolean) => void
  sync: () => Promise<void>
}
