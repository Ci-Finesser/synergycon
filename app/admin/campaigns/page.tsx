"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Mail, Eye, Tag, Loader2, MoreVertical, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { AdminNavigation } from "@/components/admin-navigation"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Campaign {
  id: string
  name: string
  subject: string
  status: string
  mailing_lists?: {
    id: string
    name: string
    total_subscribers: number
  }
  tags: string[]
  total_recipients: number
  total_sent: number
  created_at: string
  sent_at: string | null
}

export default function CampaignsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isLoading: isAuthLoading, isAuthenticated, authFetch } = useAdminAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isAuthLoading, isAuthenticated, router])

  const fetchCampaigns = async () => {
    try {
      const response = await authFetch("/api/admin/campaigns")
      
      if (!response.ok) {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to fetch campaigns",
          variant: "destructive",
        })
        return
      }
      
      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (error) {
      console.error("Error fetching campaigns:", error)
      toast({
        title: "Error",
        description: "Unable to load campaigns. Please check your connection.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchCampaigns()
    }
  }, [isAuthenticated])

  const openDeleteDialog = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setShowDeleteDialog(true)
  }

  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return

    setDeleting(true)
    try {
      const response = await authFetch("/api/admin/campaigns", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedCampaign.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to delete campaign",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Campaign deleted successfully",
      })
      setShowDeleteDialog(false)
      setSelectedCampaign(null)
      fetchCampaigns()
    } catch (error) {
      console.error("Error deleting campaign:", error)
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
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

  // Show loading while checking auth
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <AdminNavigation />
      <main className="min-h-screen py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Email Campaigns</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage email campaigns for your mailing lists
            </p>
          </div>

          <div className="flex gap-3 mb-6">
            <Button onClick={() => router.push("/admin/campaigns/create")} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Campaign
            </Button>
            <Button variant="outline" onClick={() => router.push("/admin/mailing-lists")} className="gap-2">
              Manage Mailing Lists
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Loading campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground mb-4">No campaigns yet</p>
              <Button onClick={() => router.push("/admin/campaigns/create")} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-bold text-sm">{campaign.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{campaign.subject}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        {campaign.mailing_lists && (
                          <span>List: {campaign.mailing_lists.name}</span>
                        )}
                        {campaign.total_recipients > 0 && (
                          <>
                            <span>•</span>
                            <span>{campaign.total_recipients} recipient(s)</span>
                          </>
                        )}
                        {campaign.status === "sent" && campaign.total_sent > 0 && (
                          <>
                            <span>•</span>
                            <span>{campaign.total_sent} sent</span>
                          </>
                        )}
                      </div>
                      {campaign.tags && campaign.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          {campaign.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
                          className="gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {campaign.status === "draft" && (
                              <DropdownMenuItem onClick={() => router.push(`/admin/campaigns/${campaign.id}/edit`)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(campaign)}
                              className="text-destructive focus:text-destructive"
                              disabled={campaign.status !== "draft"}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the campaign "{selectedCampaign?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCampaign}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
