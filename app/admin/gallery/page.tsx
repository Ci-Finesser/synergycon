"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, WifiOff, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminNavigation } from "@/components/admin-navigation"
import { useNetworkStore } from "@/lib/stores/network-store"
import { useAdminAuth } from "@/hooks/use-admin-auth"

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic'

type GalleryItem = {
  id: string
  title: string
  description: string | null
  type: "image" | "video" | "text"
  media_url: string | null
  youtube_url: string | null
  content: string | null
  category: string | null
  display_order: number
}

export default function AdminGalleryPage() {
  const router = useRouter()
  const { isOnline } = useNetworkStore()
  const { isLoading: isAuthLoading, isAuthenticated } = useAdminAuth()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingInlineId, setEditingInlineId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "image" as "image" | "video" | "text",
    media_url: "",
    youtube_url: "",
    content: "",
    category: "",
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
      fetchItems()
    }
  }, [isAuthenticated])

  const fetchItems = async () => {
    const { data } = await supabase.from("gallery_items").select("*").order("display_order")
    if (data) setItems(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingInlineId) {
      await supabase.from("gallery_items").update(formData).eq("id", editingInlineId)
    } else {
      await supabase.from("gallery_items").insert([{ ...formData, display_order: items.length + 1 }])
    }

    setFormData({
      title: "",
      description: "",
      type: "image",
      media_url: "",
      youtube_url: "",
      content: "",
      category: "",
    })
    setIsAddingNew(false)
    setEditingInlineId(null)
    fetchItems()
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await supabase.from("gallery_items").delete().eq("id", id)
      fetchItems()
    }
  }

  const startEdit = (item: GalleryItem) => {
    setEditingInlineId(item.id)
    setFormData({
      title: item.title,
      description: item.description || "",
      type: item.type,
      media_url: item.media_url || "",
      youtube_url: item.youtube_url || "",
      content: item.content || "",
      category: item.category || "",
    })
  }

  const EditForm = ({ onCancel }: { onCancel: () => void }) => (
    <form onSubmit={handleSubmit} className="space-y-2.5 bg-muted/50 p-3 rounded-lg border border-border mt-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs mb-0.5 block">Title *</Label>
          <Input
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="rounded-lg h-7 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs mb-0.5 block">Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value: "image" | "video" | "text") => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger className="rounded-lg h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="text">Text</SelectItem>
            </SelectContent>
          </Select>
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
          <Label className="text-xs mb-0.5 block">Category</Label>
          <Input
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="rounded-lg h-7 text-xs"
          />
        </div>
        {formData.type === "image" && (
          <div>
            <Label className="text-xs mb-0.5 block">Image URL</Label>
            <Input
              value={formData.media_url}
              onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
              className="rounded-lg h-7 text-xs"
            />
          </div>
        )}
        {formData.type === "video" && (
          <div>
            <Label className="text-xs mb-0.5 block">YouTube URL</Label>
            <Input
              value={formData.youtube_url}
              onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
              className="rounded-lg h-7 text-xs"
            />
          </div>
        )}
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
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Manage Gallery</h1>
                <p className="text-sm text-muted-foreground">Add, edit, or remove gallery items</p>
              </div>
              <Button onClick={() => setIsAddingNew(true)} className="rounded-lg" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>

          {isAddingNew && (
            <div className="bg-muted/30 border border-border rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Add New Item</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Title *</Label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="rounded-lg h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "image" | "video" | "text") => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger className="rounded-lg h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="rounded-lg text-sm"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Category</Label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="rounded-lg h-9 text-sm"
                      placeholder="e.g., Highlights, Sessions, Networking"
                    />
                  </div>
                  {formData.type === "image" && (
                    <div className="space-y-2">
                      <Label className="text-sm">Image URL</Label>
                      <Input
                        value={formData.media_url}
                        onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                        className="rounded-lg h-9 text-sm"
                      />
                    </div>
                  )}
                  {formData.type === "video" && (
                    <div className="space-y-2">
                      <Label className="text-sm">YouTube URL</Label>
                      <Input
                        value={formData.youtube_url}
                        onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                        className="rounded-lg h-9 text-sm"
                      />
                    </div>
                  )}
                </div>

                {formData.type === "text" && (
                  <div className="space-y-2">
                    <Label className="text-sm">Content</Label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={6}
                      className="rounded-lg text-sm"
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button type="submit" className="rounded-lg" size="sm">
                    Add Item
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingNew(false)
                      setFormData({
                        title: "",
                        description: "",
                        type: "image",
                        media_url: "",
                        youtube_url: "",
                        content: "",
                        category: "",
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-background border border-border rounded-xl p-4">
                {item.type === "image" && item.media_url && (
                  <img
                    src={item.media_url || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full aspect-video object-cover rounded-lg mb-3"
                  />
                )}
                {item.type === "video" && (
                  <div className="w-full aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">Video</span>
                  </div>
                )}
                <h3 className="font-bold text-base mb-2">{item.title}</h3>
                {item.category && (
                  <span className="inline-block text-xs bg-accent-blue/10 text-accent-blue px-2 py-1 rounded-lg mb-2">
                    {item.category}
                  </span>
                )}
                {item.description && <p className="text-sm text-muted-foreground mb-3">{item.description}</p>}
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(item)}
                    className="flex-1 rounded-lg text-xs h-8"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg text-destructive hover:text-destructive text-xs h-8"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                {editingInlineId === item.id && (
                  <EditForm
                    onCancel={() => {
                      setEditingInlineId(null)
                      setFormData({
                        title: "",
                        description: "",
                        type: "image",
                        media_url: "",
                        youtube_url: "",
                        content: "",
                        category: "",
                      })
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
