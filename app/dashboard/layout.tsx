/**
 * Dashboard Layout
 * Global layout for all dashboard routes with PWA integration
 */
"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/lib/stores/auth-store"
import { usePWAInstallStore } from "@/lib/stores/pwa-install-store"
import { useNetworkStore } from "@/lib/stores/network-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import {
  LogOut,
  Home,
  Ticket,
  User,
  Share2,
  Shield,
  Wifi,
  WifiOff,
  Smartphone,
  Download,
  Menu,
  X,
  Bell,
} from "lucide-react"
import { useState } from "react"
import NotificationBell from "@/components/notification-bell"

const dashboardNavItems = [
  {
    href: "/dashboard",
    label: "Home",
    icon: Home,
    description: "Dashboard overview",
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: User,
    description: "Manage your profile",
  },
  {
    href: "/dashboard/notifications",
    label: "Notifications",
    icon: Bell,
    description: "View notifications",
  },
  {
    href: "/dashboard/share",
    label: "Share",
    icon: Share2,
    description: "Share profile & event data",
  },
  {
    href: "/dashboard/tickets",
    label: "Tickets",
    icon: Ticket,
    description: "View & manage tickets",
  },
  {
    href: "/dashboard/security",
    label: "Security",
    icon: Shield,
    description: "Security settings",
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, profile, isAuthenticated, logout, clearSession } = useAuthStore()
  const { isInstalled, isInstallable, promptInstall } = usePWAInstallStore()
  const { isOnline } = useNetworkStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      clearSession()
      router.push("/")
    }
  }

  const handleInstallPWA = async () => {
    await promptInstall()
  }

  if (!isAuthenticated || !user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Header - Mobile Optimized */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 sm:h-16 items-center gap-4 px-3 sm:px-6">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Logo/Title */}
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold">Dashboard</h1>
            </Link>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Notification Bell */}
          <NotificationBell />

          {/* Network Status */}
          <div className="hidden sm:flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-yellow-500" />
            )}
          </div>

          {/* User Info - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{profile.full_name || user.email}</p>
              <p className="text-xs text-muted-foreground">{user.roles.default}</p>
            </div>
          </div>

          {/* Logout Button */}
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-background p-4 space-y-2">
            {dashboardNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </header>

      <div className="flex">
        {/* Sidebar - Desktop Only */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col fixed inset-y-0 top-[64px] border-r bg-background">
          <nav className="flex-1 space-y-1 p-4">
            {dashboardNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t">
            {isInstalled ? (
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 px-3 py-2 bg-green-500/10 rounded-lg">
                <Smartphone className="h-3 w-3 shrink-0" />
                <span>App Installed</span>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground px-3">
                <p className="mb-1 font-medium">Network Status</p>
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <>
                      <Wifi className="h-3 w-3 text-green-500" />
                      <span className="text-green-600 dark:text-green-400">Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3 text-yellow-500" />
                      <span className="text-yellow-600 dark:text-yellow-400">Offline</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
            {/* Network Status Alert - Mobile */}
            {!isOnline && (
              <Alert className="mb-4 sm:mb-6 border-yellow-500/50 bg-yellow-500/10">
                <WifiOff className="h-4 w-4" />
                <AlertDescription>
                  You're currently offline. Some features may be limited.
                </AlertDescription>
              </Alert>
            )}

            {/* PWA Install Banner */}
            {!isInstalled && isInstallable && (
              <Card className="mb-4 sm:mb-6 border-primary/20 bg-primary/5">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 rounded-lg bg-primary/10 shrink-0">
                      <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base mb-1">
                        Install SynergyCon App
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Get instant access and work offline with our progressive web app
                      </p>
                    </div>
                    <Button
                      onClick={handleInstallPWA}
                      size="sm"
                      className="w-full sm:w-auto shrink-0"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Install
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
