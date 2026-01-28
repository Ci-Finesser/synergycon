/**
 * Dashboard Share Page
 * Share profile link and event data to other platforms with templates
 */
"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useSharingStore, generateShareContent, DEFAULT_TEMPLATES } from "@/lib/stores/sharing-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Share2,
  QrCode,
  Download,
  Copy,
  Check,
  Loader2,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MessageSquare,
  Link2,
  Calendar,
  ExternalLink,
  Instagram,
  Sparkles,
} from "lucide-react"

export default function SharePage() {
  const { user, profile } = useAuthStore()
  const { 
    selectedTemplate, 
    customText, 
    setTemplate, 
    setCustomText, 
    shareToSocial,
    isSharing,
    qrCode,
    isGeneratingQR,
    generateQRCode,
  } = useSharingStore()
  
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'templates' | 'url'>('templates')

  const profileUrl = profile?.id ? `${window.location.origin}/profile/${profile.id}` : ""
  const eventUrl = `${window.location.origin}/register`

  // Generate template content when template or profile changes
  useEffect(() => {
    if (selectedTemplate && profile) {
      const content = generateShareContent(selectedTemplate, {
        name: profile.full_name || user?.email || '',
        title: profile.public_title || '',
        organization: profile.public_company || profile.organization || '',
        topic: '',
        role: '',
      })
      setCustomText(content)
    }
  }, [selectedTemplate, profile, user, setCustomText])

  const handleTemplateSelect = (templateIndex: number) => {
    const template = DEFAULT_TEMPLATES[templateIndex]
    const mockTemplate = {
      id: `default-${templateIndex}`,
      user_id: user?.id || '',
      ...template,
      created_at: new Date(),
      updated_at: new Date(),
    }
    setTemplate(mockTemplate)
  }

  const handleShare = async (platform: 'twitter' | 'linkedin' | 'instagram' | 'whatsapp') => {
    try {
      await shareToSocial(platform, customText)
    } catch (error) {
      console.error('Share error:', error)
    }
  }

  const handleDownloadQR = () => {
    if (!qrCode) return
    
    const link = document.createElement("a")
    link.href = qrCode
    link.download = `synergycon-profile-qr-${user?.email}.png`
    link.click()
  }

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(item)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (error) {
      console.error("Copy failed:", error)
    }
  }

  const shareVia = (platform: string) => {
    const text = `Check out my SynergyCon 2.0 profile!`
    const url = profileUrl

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      email: `mailto:?subject=${encodeURIComponent("SynergyCon 2.0")}&body=${encodeURIComponent(text + "\n\n" + url)}`,
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400")
    }
  }

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "SynergyCon 2.0 Profile",
          text: "Check out my SynergyCon profile!",
          url: profileUrl,
        })
      } catch (error) {
        console.error("Share error:", error)
      }
    }
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Share</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Share your profile and event information with engaging templates
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'templates'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Templates
        </button>
        <button
          onClick={() => setActiveTab('url')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'url'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Link2 className="w-4 h-4 inline mr-2" />
          Direct Links
        </button>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Templates & Preview */}
          <div className="space-y-4 sm:space-y-6">
            {/* Template Selection */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Choose a Template</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Select a pre-made template to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
                {DEFAULT_TEMPLATES.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => handleTemplateSelect(index)}
                    className={`w-full text-left p-3 sm:p-4 rounded-lg border transition-all ${
                      selectedTemplate?.template_name === template.template_name
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                  >
                    <div className="font-medium mb-1 text-sm sm:text-base">
                      {template.template_name}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {template.template_type.charAt(0).toUpperCase() + template.template_type.slice(1)} template
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Preview & Customize */}
            {selectedTemplate && (
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Customize Message</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Edit the template to add your personal touch
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
                  <Textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    rows={6}
                    className="resize-none text-sm"
                    placeholder="Customize your message..."
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(customText, 'template')}
                    className="w-full"
                    size="sm"
                  >
                    {copiedItem === 'template' ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Share Buttons */}
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Share To</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Share your message on social media
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {!selectedTemplate ? (
                  <p className="text-muted-foreground text-center py-8 text-sm">
                    Select a template to start sharing
                  </p>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleShare('twitter')}
                      disabled={isSharing || !customText}
                      className="w-full h-auto py-3 bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white"
                    >
                      {isSharing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Twitter className="w-4 h-4 mr-2" />
                      )}
                      Share on Twitter/X
                    </Button>

                    <Button
                      onClick={() => handleShare('linkedin')}
                      disabled={isSharing || !customText}
                      className="w-full h-auto py-3 bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white"
                    >
                      {isSharing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Linkedin className="w-4 h-4 mr-2" />
                      )}
                      Share on LinkedIn
                    </Button>

                    <Button
                      onClick={() => handleShare('whatsapp')}
                      disabled={isSharing || !customText}
                      className="w-full h-auto py-3 bg-[#25D366] hover:bg-[#25D366]/90 text-white"
                    >
                      {isSharing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <MessageSquare className="w-4 h-4 mr-2" />
                      )}
                      Share on WhatsApp
                    </Button>

                    <Button
                      onClick={() => handleShare('instagram')}
                      disabled={isSharing || !customText}
                      className="w-full h-auto py-3 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white"
                    >
                      {isSharing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Instagram className="w-4 h-4 mr-2" />
                      )}
                      Copy for Instagram
                    </Button>

                    <div className="pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        <strong>Note:</strong> Instagram doesn't support direct sharing from web. 
                        The button copies your text to paste in the Instagram app.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sharing Tips */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">💡 Sharing Tips</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-2">
                  <li>• Customize templates with your personal style</li>
                  <li>• Use hashtags like #SynergyCon2026 for visibility</li>
                  <li>• Tag @SynergyConNG for potential reposts</li>
                  <li>• Share multiple times as the event approaches</li>
                  <li>• Add emojis to make your posts stand out</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Direct Links Tab */}
      {activeTab === 'url' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Profile Share */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg sm:text-xl">Share Your Profile</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Share your SynergyCon profile with attendees and colleagues
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              {/* Profile URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Profile URL</label>
                <div className="flex gap-2">
                  <Input value={profileUrl} readOnly className="flex-1 text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(profileUrl, "profile")}
                  >
                    {copiedItem === "profile" ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div>
                <label className="text-sm font-medium mb-2 block">Quick Share</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => shareVia("twitter")}>
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => shareVia("facebook")}>
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => shareVia("linkedin")}>
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => shareVia("whatsapp")}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => shareVia("email")}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  {typeof window !== "undefined" && typeof navigator.share === 'function' && (
                    <Button onClick={nativeShare} variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Device
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Promotion */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg sm:text-xl">Share Event</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Invite others to SynergyCon 2.0
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Registration URL</label>
                <div className="flex gap-2">
                  <Input value={eventUrl} readOnly className="flex-1 text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(eventUrl, "event")}
                  >
                    {copiedItem === "event" ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button asChild variant="outline" className="w-full" size="sm">
                <a href="/register" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Registration Page
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg sm:text-xl">QR Code</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Generate a QR code for easy profile sharing at the event
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <Button
                onClick={generateQRCode}
                variant="outline"
                className="w-full"
                disabled={isGeneratingQR}
              >
                {isGeneratingQR ? (
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
                <div className="space-y-3 pt-4 border-t">
                  <img
                    src={qrCode}
                    alt="Profile QR Code"
                    className="w-full max-w-sm mx-auto rounded-lg border"
                  />
                  <Button
                    onClick={handleDownloadQR}
                    variant="secondary"
                    size="sm"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Visibility */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Profile Visibility</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Profile Status</span>
                <Badge variant={profile.public_name ? "default" : "secondary"}>
                  {profile.public_name ? "Public" : "Private"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
