/**
 * User Dashboard Overview Page
 * Main dashboard content - layout handled by layout.tsx
 */
"use client"

import { useState } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useNetworkStore } from "@/lib/stores/network-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  Calendar,
  Share2,
  QrCode,
  Download,
  ExternalLink,
  Loader2,
  Ticket,
  CalendarDays,
  Wifi,
} from "lucide-react"

export default function DashboardPage() {
  const { user, profile } = useAuthStore()
  const { isOnline } = useNetworkStore()
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isLoadingQR, setIsLoadingQR] = useState(false)

  const handleGenerateQR = async () => {
    setIsLoadingQR(true)
    try {
      const res = await fetch("/api/user/profile/qr-code")
      const data = await res.json()
      
      if (data.success) {
        setQrCode(data.qr_code)
      }
    } catch (error) {
      console.error("QR generation error:", error)
    } finally {
      setIsLoadingQR(false)
    }
  }

  const handleDownloadQR = () => {
    if (!qrCode) return
    
    const link = document.createElement("a")
    link.href = qrCode
    link.download = `synergycon-profile-qr-${user?.email}.png`
    link.click()
  }

  const handleShareProfile = async () => {
    if (!profile?.public_name) return
    
    const profileUrl = `${window.location.origin}/profile/${profile.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.public_name || user?.email}'s SynergyCon Profile`,
          text: "Check out my SynergyCon profile!",
          url: profileUrl,
        })
      } catch (error) {
        console.error("Share error:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(profileUrl)
      alert("Profile URL copied to clipboard!")
    }
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Welcome Message */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
          Welcome back, {profile.full_name || user.email.split('@')[0]}!
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Here's an overview of your SynergyCon account
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">\n        {/* Profile Card - Full width on mobile */}
          <Card className="lg:col-span-2">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-lg sm:text-xl">
                    {profile.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="w-full sm:w-auto">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    {profile.full_name || "User"}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <Badge variant="secondary" className="text-xs">{user.roles.default}</Badge>
                    {user.roles.supplementary?.map((role) => (
                      <Badge key={role} variant="outline" className="text-xs">{role}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
                  <span className="text-sm sm:text-base truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
                  <span className="text-sm sm:text-base">
                    Member since {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                {profile.public_name && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
                    <a
                      href={`/profile/${profile.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm sm:text-base text-primary hover:underline truncate"
                    >
                      View Public Profile
                    </a>
                  </div>
                )}
                {isOnline && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0" />
                    <span className="text-sm sm:text-base text-green-600 dark:text-green-400">
                      Online
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Share Profile Card - Full width on mobile */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Share Profile</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Share your profile with others</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6 pt-0">
              <Button
                onClick={handleShareProfile}
                variant="outline"
                className="w-full text-sm sm:text-base"
                size="sm"
                disabled={!profile.public_name}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Profile URL
              </Button>

              <Button
                onClick={handleGenerateQR}
                variant="outline"
                className="w-full text-sm sm:text-base"
                size="sm"
                disabled={isLoadingQR}
              >
                {isLoadingQR ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate QR Code
                  </>
                )}
              </Button>

              {qrCode && (
                <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t">
                  <img
                    src={qrCode}
                    alt="Profile QR Code"
                    className="w-full rounded-lg border"
                  />
                  <Button
                    onClick={handleDownloadQR}
                    variant="secondary"
                    size="sm"
                    className="w-full text-sm sm:text-base"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-lg">My Tickets</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">Your registered event tickets</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <p className="text-muted-foreground text-xs sm:text-sm mb-3">
              No tickets purchased yet.
            </p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <a href="/register">Register for Event</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-lg">Event Schedule</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">Your personalized schedule</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <p className="text-muted-foreground text-xs sm:text-sm mb-3">
              No sessions added yet.
            </p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <a href="/schedule">View Schedule</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
