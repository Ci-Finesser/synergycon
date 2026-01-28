"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, Eye, Mail, Loader2 } from "lucide-react"
import { ApplicationDetailModal } from "@/components/application-detail-modal"
import { useFormSecurity } from "@/hooks/use-form-security"
import { useToast } from "@/hooks/use-toast"

// Types matching the database schema
type SpeakerApplication = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  company: string | null
  position: string | null
  bio: string | null
  topic_title: string
  topic_description: string
  session_type: string
  speaking_experience: string | null
  availability: string | null
  additional_notes: string | null
  linkedin: string | null
  status: string
  created_at: string
}

type PartnershipApplication = {
  id: string
  partnership_type: string | null
  company_name: string
  contact_person: string
  email: string
  phone: string
  website: string | null
  company_description: string
  partnership_tier: string | null
  partnership_interests: string | null
  why_partner: string | null
  marketing_reach: string | null
  additional_notes: string | null
  status: string
  created_at: string
}

type ApplicationsManagerProps = {
  speakerApplications: SpeakerApplication[]
  partnershipApplications: PartnershipApplication[]
}

export function ApplicationsManager({
  speakerApplications: initialSpeaker,
  partnershipApplications: initialPartnership,
}: ApplicationsManagerProps) {
  const [speakerApplications, setSpeakerApplications] = useState<SpeakerApplication[]>(initialSpeaker)
  const [partnershipApplications, setPartnershipApplications] = useState<PartnershipApplication[]>(initialPartnership)
  const [selectedApplication, setSelectedApplication] = useState<SpeakerApplication | PartnershipApplication | null>(null)
  const [applicationType, setApplicationType] = useState<"speaker" | "partnership">("speaker")
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  
  const { csrfToken } = useFormSecurity()
  const { toast } = useToast()

  const setLoading = (id: string, loading: boolean) => {
    setLoadingIds(prev => {
      const next = new Set(prev)
      if (loading) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  const isLoading = (id: string) => loadingIds.has(id)

  const approveSpeakerApplication = async (id: string) => {
    setLoading(id, true)
    try {
      const response = await fetch('/api/admin/applications/speakers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: 'approved',
          createSpeaker: true,
          _csrf: csrfToken,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve application')
      }

      setSpeakerApplications(prev => 
        prev.map(app => app.id === id ? { ...app, status: 'approved' } : app)
      )

      toast({
        title: "Application Approved",
        description: result.speakerCreated 
          ? "Speaker profile created as draft" 
          : "Application approved successfully",
      })
    } catch (error) {
      console.error("Error approving application:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve application",
        variant: "destructive",
      })
    } finally {
      setLoading(id, false)
    }
  }

  const approvePartnershipApplication = async (id: string) => {
    setLoading(id, true)
    try {
      const response = await fetch('/api/admin/applications/partnerships', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: 'approved',
          createSponsor: true,
          _csrf: csrfToken,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve application')
      }

      setPartnershipApplications(prev => 
        prev.map(app => app.id === id ? { ...app, status: 'approved' } : app)
      )

      toast({
        title: "Application Approved",
        description: result.sponsorCreated 
          ? "Partner profile created as draft" 
          : "Application approved successfully",
      })
    } catch (error) {
      console.error("Error approving application:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve application",
        variant: "destructive",
      })
    } finally {
      setLoading(id, false)
    }
  }

  const updateSpeakerStatus = async (id: string, status: string) => {
    setLoading(id, true)
    try {
      const response = await fetch('/api/admin/applications/speakers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status,
          createSpeaker: false,
          _csrf: csrfToken,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update application')
      }

      setSpeakerApplications(prev => 
        prev.map(app => app.id === id ? { ...app, status } : app)
      )

      toast({
        title: "Status Updated",
        description: `Application ${status}`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setLoading(id, false)
    }
  }

  const updatePartnershipStatus = async (id: string, status: string) => {
    setLoading(id, true)
    try {
      const response = await fetch('/api/admin/applications/partnerships', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status,
          createSponsor: false,
          _csrf: csrfToken,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update application')
      }

      setPartnershipApplications(prev => 
        prev.map(app => app.id === id ? { ...app, status } : app)
      )

      toast({
        title: "Status Updated",
        description: `Application ${status}`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setLoading(id, false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
      approved: { label: "Approved", className: "bg-green-500/10 text-green-500 border-green-500/20" },
      rejected: { label: "Rejected", className: "bg-red-500/10 text-red-500 border-red-500/20" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const pendingSpeakers = speakerApplications.filter((app) => app.status === "pending")
  const pendingPartnerships = partnershipApplications.filter((app) => app.status === "pending")

  return (
    <>
      <Tabs defaultValue="speakers" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="speakers" className="relative">
            Speaker Applications
            {pendingSpeakers.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-accent-blue text-white rounded-full">
                {pendingSpeakers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="partnerships" className="relative">
            Partnership Applications
            {pendingPartnerships.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-accent-purple text-white rounded-full">
                {pendingPartnerships.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="speakers" className="space-y-4">
          {speakerApplications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">No speaker applications yet</CardContent>
            </Card>
          ) : (
            speakerApplications.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {app.first_name} {app.last_name}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span>
                          {app.position} at {app.company}
                        </span>
                        <span>•</span>
                        <span>{app.email}</span>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-1">Topic: {app.topic_title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{app.topic_description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(app.status)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedApplication(app)
                        setApplicationType("speaker")
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    {app.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500/20 text-green-500 hover:bg-green-500/10 bg-transparent"
                          onClick={() => approveSpeakerApplication(app.id)}
                          disabled={isLoading(app.id)}
                        >
                          {isLoading(app.id) ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 mr-2" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/20 text-red-500 hover:bg-red-500/10 bg-transparent"
                          onClick={() => updateSpeakerStatus(app.id, "rejected")}
                          disabled={isLoading(app.id)}
                        >
                          {isLoading(app.id) ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <X className="w-4 h-4 mr-2" />
                          )}
                          Reject
                        </Button>
                      </>
                    )}
                    {app.status === "approved" && (
                      <span className="text-xs text-green-600 flex items-center gap-1 px-3">
                        ✓ Added to speakers as draft
                      </span>
                    )}
                    <Button size="sm" variant="outline" onClick={() => window.open(`mailto:${app.email}`, "_blank")}>
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="partnerships" className="space-y-4">
          {partnershipApplications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No partnership applications yet
              </CardContent>
            </Card>
          ) : (
            partnershipApplications.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{app.company_name}</CardTitle>
                        {app.partnership_type && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {app.partnership_type}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span>{app.contact_person}</span>
                        <span>•</span>
                        <span>{app.email}</span>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-1">Tier: {app.partnership_tier || 'Not specified'}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{app.company_description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(app.status)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedApplication(app)
                        setApplicationType("partnership")
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    {app.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500/20 text-green-500 hover:bg-green-500/10 bg-transparent"
                          onClick={() => approvePartnershipApplication(app.id)}
                          disabled={isLoading(app.id)}
                        >
                          {isLoading(app.id) ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 mr-2" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/20 text-red-500 hover:bg-red-500/10 bg-transparent"
                          onClick={() => updatePartnershipStatus(app.id, "rejected")}
                          disabled={isLoading(app.id)}
                        >
                          {isLoading(app.id) ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <X className="w-4 h-4 mr-2" />
                          )}
                          Reject
                        </Button>
                      </>
                    )}
                    {app.status === "approved" && (
                      <span className="text-xs text-green-600 flex items-center gap-1 px-3">
                        ✓ Added to partners as draft
                      </span>
                    )}
                    <Button size="sm" variant="outline" onClick={() => window.open(`mailto:${app.email}`, "_blank")}>
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <ApplicationDetailModal
        application={selectedApplication}
        type={applicationType}
        onClose={() => setSelectedApplication(null)}
      />
    </>
  )
}
