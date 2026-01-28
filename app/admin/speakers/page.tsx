"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Eye, EyeOff, WifiOff } from "lucide-react"
import { AdminNavigation } from "@/components/admin-navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useNetworkStore } from "@/lib/stores/network-store"

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic'

type Speaker = {
  id: string
  name: string
  title: string
  bio: string
  company: string | null
  image_url: string | null
  topic: string | null
  linkedin_url: string | null
  twitter_url: string | null
  instagram_url: string | null
  website_url: string | null
  featured: boolean
  display_order: number
  event_day: number
  status: string
}

export default function AdminSpeakersPage() {
  const { isOnline } = useNetworkStore()
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingInlineId, setEditingInlineId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    company: "",
    image_url: "",
    topic: "To Be Announced",
    event_day: 1,
    linkedin_url: "",
    twitter_url: "",
    instagram_url: "",
    website_url: "",
    featured: false,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchSpeakers()
  }, [])

  const fetchSpeakers = async () => {
    const { data } = await supabase.from("speakers").select("*").order("display_order")
    if (data) setSpeakers(data)
  }

  const toggleSpeakerStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "draft" ? "live" : "draft"
    const { error } = await supabase.from("speakers").update({ status: newStatus }).eq("id", id)

    if (!error) {
      fetchSpeakers()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingInlineId) {
      await supabase.from("speakers").update(formData).eq("id", editingInlineId)
    } else {
      await supabase.from("speakers").insert([{ ...formData, display_order: speakers.length + 1, status: "draft" }])
    }

    setFormData({
      name: "",
      title: "",
      bio: "",
      company: "",
      image_url: "",
      topic: "To Be Announced",
      event_day: 1,
      linkedin_url: "",
      twitter_url: "",
      instagram_url: "",
      website_url: "",
      featured: false,
    })
    setIsAddingNew(false)
    setEditingInlineId(null)
    fetchSpeakers()
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this speaker?")) {
      await supabase.from("speakers").delete().eq("id", id)
      fetchSpeakers()
    }
  }

  const startEdit = (speaker: Speaker) => {
    setEditingInlineId(speaker.id)
    setFormData({
      name: speaker.name,
      title: speaker.title,
      bio: speaker.bio,
      company: speaker.company || "",
      image_url: speaker.image_url || "",
      topic: speaker.topic || "To Be Announced",
      event_day: (speaker as any).event_day || 1,
      linkedin_url: speaker.linkedin_url || "",
      twitter_url: speaker.twitter_url || "",
      instagram_url: speaker.instagram_url || "",
      website_url: speaker.website_url || "",
      featured: speaker.featured,
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
          <Label className="text-xs mb-0.5 block">Title *</Label>
          <Input
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="rounded-lg h-7 text-xs"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs mb-0.5 block">Bio *</Label>
        <Textarea
          required
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={2}
          className="rounded-lg text-xs resize-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs mb-0.5 block">Company</Label>
          <Input
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="rounded-lg h-7 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs mb-0.5 block">Topic</Label>
          <Input
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            className="rounded-lg h-7 text-xs"
            placeholder="TBA"
          />
        </div>
        <div>
          <Label className="text-xs mb-0.5 block">Event Day *</Label>
          <select
            required
            value={formData.event_day}
            onChange={(e) => setFormData({ ...formData, event_day: Number.parseInt(e.target.value) })}
            className="w-full rounded-lg border border-input bg-background px-2 h-7 text-xs"
          >
            <option value={1}>Day 1</option>
            <option value={2}>Day 2</option>
            <option value={3}>Day 3</option>
          </select>
        </div>
      </div>

      <div>
        <Label className="text-xs mb-0.5 block">Image URL</Label>
        <Input
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          className="rounded-lg h-7 text-xs"
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs mb-0.5 block">LinkedIn</Label>
          <Input
            value={formData.linkedin_url}
            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
            className="rounded-lg h-7 text-xs"
            placeholder="https://linkedin.com/in/..."
          />
        </div>
        <div>
          <Label className="text-xs mb-0.5 block">Twitter/X</Label>
          <Input
            value={formData.twitter_url}
            onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
            className="rounded-lg h-7 text-xs"
            placeholder="https://x.com/..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="featured-edit"
          checked={formData.featured}
          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
          className="w-3 h-3 rounded"
        />
        <Label htmlFor="featured-edit" className="cursor-pointer text-xs">
          Featured Speaker
        </Label>
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

  const draftSpeakers = speakers.filter((s) => s.status === "draft")
  const liveSpeakers = speakers.filter((s) => s.status === "live")

  const SpeakerCard = ({ speaker }: { speaker: Speaker }) => (
    <div key={speaker.id} className="bg-background border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        {speaker.status === "draft" && (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            Draft
          </Badge>
        )}
        {speaker.status === "live" && (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            Live
          </Badge>
        )}
        {speaker.featured && (
          <Badge variant="outline" className="bg-accent-purple/10 text-accent-purple border-accent-purple/20">
            Featured
          </Badge>
        )}
      </div>
      {speaker.image_url && (
        <img
          src={speaker.image_url || "/placeholder.svg"}
          alt={speaker.name}
          className="w-full aspect-square object-cover rounded-lg mb-3"
        />
      )}
      <h3 className="font-bold text-base mb-1">{speaker.name}</h3>
      <p className="text-sm text-muted-foreground mb-1">{speaker.title}</p>
      {speaker.company && <p className="text-xs text-muted-foreground mb-2">{speaker.company}</p>}
      {speaker.topic && <p className="text-xs bg-muted px-2 py-1 rounded-lg mb-2 inline-block">{speaker.topic}</p>}
      <div className="flex gap-2 mt-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => toggleSpeakerStatus(speaker.id, speaker.status)}
          className="flex-1 rounded-lg text-xs h-8"
          title={speaker.status === "draft" ? "Publish Live" : "Move to Draft"}
        >
          {speaker.status === "draft" ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
          {speaker.status === "draft" ? "Publish" : "Unpublish"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => startEdit(speaker)} className="rounded-lg text-xs h-8">
          <Edit className="w-3 h-3 mr-1" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleDelete(speaker.id)}
          className="rounded-lg text-destructive hover:text-destructive text-xs h-8"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {editingInlineId === speaker.id && (
        <EditForm
          onCancel={() => {
            setEditingInlineId(null)
            setFormData({
              name: "",
              title: "",
              bio: "",
              company: "",
              image_url: "",
              topic: "To Be Announced",
              event_day: 1,
              linkedin_url: "",
              twitter_url: "",
              instagram_url: "",
              website_url: "",
              featured: false,
            })
          }}
        />
      )}
    </div>
  )

  return (
    <>
      <AdminNavigation />
      <main className="min-h-screen py-6 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Manage Speakers</h1>
                <p className="text-sm text-muted-foreground">Add speakers, edit details, and publish when ready</p>
              </div>
              <Button onClick={() => setIsAddingNew(true)} className="rounded-lg" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Speaker
              </Button>
            </div>
          </div>

          {isAddingNew && (
            <div className="bg-muted/30 border border-border rounded-2xl p-4 mb-8">
              <h2 className="text-xl font-bold mb-4">Add New Speaker</h2>
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
                    <Label className="text-sm">Title *</Label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="rounded-lg h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Bio *</Label>
                  <Textarea
                    required
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="rounded-lg text-sm"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Company</Label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="rounded-lg h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Image URL</Label>
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="rounded-lg h-9 text-sm"
                      placeholder="https://drive.google.com/uc?export=view&id=..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Speaking Topic</Label>
                  <Input
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="rounded-lg h-9 text-sm"
                    placeholder="To Be Announced"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Event Day *</Label>
                  <select
                    required
                    value={formData.event_day}
                    onChange={(e) => setFormData({ ...formData, event_day: Number.parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-input bg-background px-3 h-9 text-sm"
                  >
                    <option value={1}>Day 1 - Arts, Sculpture & Design (Feb 2)</option>
                    <option value={2}>Day 2 - Fashion, Film & Photography (Feb 4)</option>
                    <option value={3}>Day 3 - Music, Tech & Gaming (Feb 8)</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">LinkedIn URL</Label>
                    <Input
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      className="rounded-lg h-9 text-sm"
                      placeholder="https://www.linkedin.com/in/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Twitter/X URL</Label>
                    <Input
                      value={formData.twitter_url}
                      onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                      className="rounded-lg h-9 text-sm"
                      placeholder="https://x.com/..."
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Instagram URL</Label>
                    <Input
                      value={formData.instagram_url}
                      onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                      className="rounded-lg h-9 text-sm"
                      placeholder="https://www.instagram.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Website URL</Label>
                    <Input
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      className="rounded-lg h-9 text-sm"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <Label htmlFor="featured" className="cursor-pointer text-sm">
                    Featured Speaker (shown on homepage)
                  </Label>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="rounded-lg" size="sm">
                    Add Speaker
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingNew(false)
                      setFormData({
                        name: "",
                        title: "",
                        bio: "",
                        company: "",
                        image_url: "",
                        topic: "To Be Announced",
                        event_day: 1,
                        linkedin_url: "",
                        twitter_url: "",
                        instagram_url: "",
                        website_url: "",
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
                {draftSpeakers.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500 text-white rounded-full">
                    {draftSpeakers.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="live" className="relative">
                Live
                {liveSpeakers.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">
                    {liveSpeakers.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="draft" className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-700">
                  Draft speakers are not visible to the public. Complete their details and click "Publish" to make them
                  live.
                </p>
              </div>
              {draftSpeakers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No draft speakers. Approve applications to add speakers as drafts.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {draftSpeakers.map((speaker) => (
                    <SpeakerCard key={speaker.id} speaker={speaker} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="live" className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-700">
                  Live speakers are visible on the public website. You can unpublish them to move back to draft.
                </p>
              </div>
              {liveSpeakers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No live speakers yet. Publish draft speakers to make them visible.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveSpeakers.map((speaker) => (
                    <SpeakerCard key={speaker.id} speaker={speaker} />
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
