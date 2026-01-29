"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Eye, EyeOff, WifiOff, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AdminNavigation } from "@/components/admin-navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useNetworkStore } from "@/lib/stores/network-store"
import { useAdminAuth } from "@/hooks/use-admin-auth"

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic'

type Sponsor = {
  id: string
  name: string
  logo_url: string
  website: string | null
  description: string | null
  bio: string | null
  tier: "principal" | "ecosystem"
  category: string | null
  sub_category: string | null
  contact_email: string | null
  contact_phone: string | null
  featured: boolean
  display_order: number
  status: string
}

export default function AdminSponsorsPage() {
  const router = useRouter()
  const { isOnline } = useNetworkStore()
  const { isLoading: isAuthLoading, isAuthenticated } = useAdminAuth()
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingInlineId, setEditingInlineId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    website: "",
    description: "",
    bio: "",
    tier: "ecosystem" as "principal" | "ecosystem",
    category: "other",
    sub_category: "",
    contact_email: "",
    contact_phone: "",
    featured: false,
  })

  const supabase = createClient()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isAuthLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchSponsors()
    }
  }, [isAuthenticated])

  const fetchSponsors = async () => {
    const { data } = await supabase.from("sponsors").select("*").order("display_order")
    if (data) setSponsors(data)
  }

  const toggleSponsorStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "draft" ? "live" : "draft"
    const { error } = await supabase.from("sponsors").update({ status: newStatus }).eq("id", id)

    if (!error) {
      fetchSponsors()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingInlineId) {
      await supabase.from("sponsors").update(formData).eq("id", editingInlineId)
    } else {
      await supabase.from("sponsors").insert([{ ...formData, display_order: sponsors.length + 1, status: "draft" }])
    }

    setFormData({
      name: "",
      logo_url: "",
      website: "",
      description: "",
      bio: "",
      tier: "ecosystem",
      category: "other",
      sub_category: "",
      contact_email: "",
      contact_phone: "",
      featured: false,
    })
    setIsAddingNew(false)
    setEditingInlineId(null)
    fetchSponsors()
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sponsor?")) {
      await supabase.from("sponsors").delete().eq("id", id)
      fetchSponsors()
    }
  }

  const startEdit = (sponsor: Sponsor) => {
    setEditingInlineId(sponsor.id)
    setFormData({
      name: sponsor.name,
      logo_url: sponsor.logo_url,
      website: sponsor.website || "",
      description: sponsor.description || "",
      bio: sponsor.bio || "",
      tier: sponsor.tier,
      category: sponsor.category || "other",
      sub_category: sponsor.sub_category || "",
      contact_email: sponsor.contact_email || "",
      contact_phone: sponsor.contact_phone || "",
      featured: sponsor.featured,
    })
  }

  const EditForm = ({ onCancel }: { onCancel: () => void }) => (
    <form onSubmit={handleSubmit} className="space-y-2.5 bg-muted/50 p-3 rounded-lg border border-border mt-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs mb-0.5 block">Name *</Label>
          <Input
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-lg h-7 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs mb-0.5 block">Tier *</Label>
          <Select
            value={formData.tier}
            onValueChange={(value: "principal" | "ecosystem") => setFormData({ ...formData, tier: value })}
          >
            <SelectTrigger className="rounded-lg h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="principal">Principal Partner</SelectItem>
              <SelectItem value="ecosystem">Ecosystem Partner</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs mb-0.5 block">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger className="rounded-lg h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="government">Government & Public Sector</SelectItem>
              <SelectItem value="corporate">Corporate & Business</SelectItem>
              <SelectItem value="financial">Financial Services</SelectItem>
              <SelectItem value="community">Community & NGOs</SelectItem>
              <SelectItem value="entertainment">Entertainment & Media</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-0.5 block">Sub-Category</Label>
          <Input
            value={formData.sub_category}
            onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
            className="rounded-lg h-7 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs mb-0.5 block">Logo URL *</Label>
          <Input
            required
            value={formData.logo_url}
            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
            className="rounded-lg h-7 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs mb-0.5 block">Website</Label>
          <Input
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="rounded-lg h-7 text-xs"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs mb-0.5 block">Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
          className="rounded-lg text-xs resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs mb-0.5 block">Full Bio (for modal)</Label>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={3}
            placeholder="Detailed information about the partner shown in the modal"
            className="rounded-lg text-xs"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="featured-edit-sponsor"
            checked={formData.featured}
            onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
          />
          <Label htmlFor="featured-edit-sponsor" className="cursor-pointer text-xs">
            Featured Partner (show prominently)
          </Label>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" className="rounded-lg h-7 text-xs px-3" size="sm">
          Update
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-lg h-7 text-xs px-3 bg-transparent"
          size="sm"
        >
          Cancel
        </Button>
      </div>
    </form>
  )

  const SponsorCard = ({ sponsor }: { sponsor: Sponsor }) => (
    <div key={sponsor.id} className="bg-background border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {sponsor.status === "draft" && (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            Draft
          </Badge>
        )}
        {sponsor.status === "live" && (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            Live
          </Badge>
        )}
        {sponsor.featured && (
          <Badge variant="outline" className="bg-amber-500/20 text-amber-700">
            Featured
          </Badge>
        )}
      </div>
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
        <img
          src={sponsor.logo_url || "/placeholder.svg"}
          alt={sponsor.name}
          className="max-w-full max-h-full object-contain p-3"
        />
      </div>
      <h3 className="font-bold text-base mb-1">{sponsor.name}</h3>
      <p className="text-xs text-muted-foreground mb-1">
        {sponsor.tier === "principal" ? "Principal Partner" : "Ecosystem Partner"}
      </p>
      {sponsor.sub_category && <p className="text-xs text-muted-foreground mb-2">{sponsor.sub_category}</p>}
      {sponsor.website && (
        <a
          href={sponsor.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent-blue hover:underline mb-2 block"
        >
          Visit Website
        </a>
      )}
      <div className="flex gap-2 mt-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => toggleSponsorStatus(sponsor.id, sponsor.status)}
          className="flex-1 rounded-lg text-xs h-8"
          title={sponsor.status === "draft" ? "Publish Live" : "Move to Draft"}
        >
          {sponsor.status === "draft" ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
          {sponsor.status === "draft" ? "Publish" : "Unpublish"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => startEdit(sponsor)} className="rounded-lg text-xs h-8">
          <Edit className="w-3 h-3 mr-1" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleDelete(sponsor.id)}
          className="rounded-lg text-destructive hover:text-destructive text-xs h-8"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {editingInlineId === sponsor.id && (
        <EditForm
          onCancel={() => {
            setEditingInlineId(null)
            setFormData({
              name: "",
              logo_url: "",
              website: "",
              description: "",
              bio: "",
              tier: "ecosystem",
              category: "other",
              sub_category: "",
              contact_email: "",
              contact_phone: "",
              featured: false,
            })
          }}
        />
      )}
    </div>
  )

  const draftSponsors = sponsors.filter((s) => s.status === "draft")
  const liveSponsors = sponsors.filter((s) => s.status === "live")

  // Show loading while checking auth
  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <AdminNavigation />
      <main className="min-h-screen py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Manage Sponsors & Partners</h1>
                <p className="text-sm text-muted-foreground">Add partners, edit details, and publish when ready</p>
              </div>
              <Button onClick={() => setIsAddingNew(true)} className="rounded-lg" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Partner
              </Button>
            </div>
          </div>

          {isAddingNew && (
            <div className="bg-muted/30 border border-border rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Add New Partner</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Name *</Label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-lg h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Tier *</Label>
                    <Select
                      value={formData.tier}
                      onValueChange={(value: "principal" | "ecosystem") => setFormData({ ...formData, tier: value })}
                    >
                      <SelectTrigger className="rounded-lg h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="principal">Principal Partner</SelectItem>
                        <SelectItem value="ecosystem">Ecosystem Partner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="rounded-lg h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="government">Government & Public Sector</SelectItem>
                        <SelectItem value="corporate">Corporate & Business</SelectItem>
                        <SelectItem value="financial">Financial Services</SelectItem>
                        <SelectItem value="community">Community & NGOs</SelectItem>
                        <SelectItem value="entertainment">Entertainment & Media</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Sub-Category</Label>
                    <Input
                      value={formData.sub_category}
                      onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                      placeholder="e.g., Commercial Bank, NGO, Music/Entertainment"
                      className="rounded-lg h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Logo URL *</Label>
                    <Input
                      required
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      className="rounded-lg h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Website URL</Label>
                    <Input
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="rounded-lg h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Contact Email</Label>
                    <Input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      className="rounded-lg h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Contact Phone</Label>
                    <Input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      className="rounded-lg h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Short Description (for cards)</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    placeholder="Brief description shown on partner cards"
                    className="rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Full Bio (for modal)</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    placeholder="Detailed information about the partner shown in the modal"
                    className="rounded-lg text-sm"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
                  />
                  <label htmlFor="featured" className="text-sm font-medium leading-none">
                    Featured Partner (show prominently)
                  </label>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="rounded-lg" size="sm">
                    Add Partner
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingNew(false)
                      setFormData({
                        name: "",
                        logo_url: "",
                        website: "",
                        description: "",
                        bio: "",
                        tier: "ecosystem",
                        category: "other",
                        sub_category: "",
                        contact_email: "",
                        contact_phone: "",
                        featured: false,
                      })
                    }}
                    className="rounded-lg"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          <Tabs defaultValue="draft" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="draft" className="relative">
                Draft
                {draftSponsors.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500 text-white rounded-full">
                    {draftSponsors.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="live" className="relative">
                Live
                {liveSponsors.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">
                    {liveSponsors.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="draft" className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-700">
                  Draft partners are not visible to the public. Complete their details and click "Publish" to make them
                  live.
                </p>
              </div>
              {draftSponsors.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No draft partners. Approve applications to add partners as drafts.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {draftSponsors.map((sponsor) => (
                    <SponsorCard key={sponsor.id} sponsor={sponsor} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="live" className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-700">
                  Live partners are visible on the public website. You can unpublish them to move back to draft.
                </p>
              </div>
              {liveSponsors.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No live partners yet. Publish draft partners to make them visible.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveSponsors.map((sponsor) => (
                    <SponsorCard key={sponsor.id} sponsor={sponsor} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  )
}
