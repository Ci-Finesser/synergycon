"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Send, Tag } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { EVENT_NAME, EVENT_TAGLINE, EVENT_DATES, EVENT_YEAR, VENUE_SHORT_NAMES } from "@/lib/constants"

interface Campaign {
  id: string
  name: string
  subject: string
  body: string
  status: string
  mailing_lists?: {
    id: string
    name: string
    total_subscribers: number
  }
  tags: string[]
  total_recipients: number
  total_sent: number
  total_failed: number
  created_at: string
  sent_at: string | null
}

export default function CampaignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const campaignId = params.id as string

  useEffect(() => {
    if (campaignId) {
      fetchCampaign()
    }
  }, [campaignId])

  const fetchCampaign = async () => {
    try {
      const response = await fetch("/api/admin/campaigns")
      
      if (!response.ok) {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to fetch campaign",
          variant: "destructive",
        })
        return
      }
      
      const data = await response.json()
      const foundCampaign = data.campaigns?.find((c: Campaign) => c.id === campaignId)
      
      if (foundCampaign) {
        setCampaign(foundCampaign)
      } else {
        toast({
          title: "Error",
          description: "Campaign not found",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching campaign:", error)
      toast({
        title: "Error",
        description: "Unable to load campaign. Please check your connection.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendCampaign = async () => {
    if (!campaign || campaign.status === "sent") {
      return
    }

    if (!confirm(`Are you sure you want to send this campaign to ${campaign.total_recipients} recipient(s)?`)) {
      return
    }

    setSending(true)

    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/send`, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to send campaign",
          variant: "destructive",
        })
        return
      }

      const data = await response.json()
      toast({
        title: "Success",
        description: data.message || "Campaign is being sent",
      })
      fetchCampaign()
    } catch (error) {
      console.error("Error sending campaign:", error)
      toast({
        title: "Error",
        description: "Network error while sending campaign. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "sending":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      case "scheduled":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
      case "draft":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground">Loading campaign...</p>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground">Campaign not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/admin/campaigns">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Campaigns
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {campaign.status === "draft" && (
              <Button size="sm" onClick={handleSendCampaign} disabled={sending}>
                <Send className="w-4 h-4 mr-2" />
                {sending ? "Sending..." : "Send Campaign"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <div className={`px-3 py-1 rounded text-sm font-medium capitalize ${getStatusColor(campaign.status)}`}>
              {campaign.status}
            </div>
          </div>
          {campaign.tags && campaign.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {campaign.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <div className="text-sm text-muted-foreground space-y-1">
            {campaign.mailing_lists && (
              <p>Mailing List: {campaign.mailing_lists.name}</p>
            )}
            <p>Total Recipients: {campaign.total_recipients}</p>
            {campaign.status === "sent" && (
              <>
                <p>Sent: {campaign.total_sent}</p>
                {campaign.total_failed > 0 && (
                  <p className="text-red-600">Failed: {campaign.total_failed}</p>
                )}
                <p>Sent At: {campaign.sent_at ? new Date(campaign.sent_at).toLocaleString() : "N/A"}</p>
              </>
            )}
            <p>Created: {new Date(campaign.created_at).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">Email Preview</h2>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border">
            <div className="bg-black text-white px-12 py-12 text-center">
              <h1 className="text-4xl font-bold tracking-tight">{EVENT_NAME.toUpperCase()}</h1>
              <p className="text-base text-gray-300 mt-3">{EVENT_TAGLINE}</p>
            </div>
            <div className="px-12 py-8">
              <h2 className="text-2xl font-bold mb-4">{campaign.subject}</h2>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: campaign.body }}
              />
            </div>
            <div className="bg-gray-50 px-12 py-8 border-t">
              <div className="text-center space-y-2">
                <p className="text-base font-semibold text-gray-800">{EVENT_DATES.displayRange}</p>
                <p className="text-sm text-gray-600">
                  {VENUE_SHORT_NAMES.join(" • ")}
                </p>
                <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-300">
                  © {EVENT_YEAR} SynergyCon. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
