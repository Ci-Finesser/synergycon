"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Users, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AdminNavigation } from "@/components/admin-navigation"

interface MailingList {
  id: string
  name: string
  description: string | null
  total_subscribers: number
  created_at: string
}

export default function MailingListsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mailingLists, setMailingLists] = useState<MailingList[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newList, setNewList] = useState({ name: "", description: "" })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchMailingLists()
  }, [])

  const fetchMailingLists = async () => {
    try {
      const response = await fetch("/api/admin/mailing-lists")
      
      if (!response.ok) {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to fetch mailing lists",
          variant: "destructive",
        })
        return
      }
      
      const data = await response.json()
      setMailingLists(data.mailingLists || [])
    } catch (error) {
      console.error("Error fetching mailing lists:", error)
      toast({
        title: "Error",
        description: "Unable to load mailing lists. Please check your connection.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateList = async () => {
    if (!newList.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the mailing list",
        variant: "destructive",
      })
      return
    }

    setCreating(true)

    try {
      const response = await fetch("/api/admin/mailing-lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newList),
      })

      if (!response.ok) {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to create mailing list",
          variant: "destructive",
        })
        return
      }

      const data = await response.json()
      toast({
        title: "Success",
        description: "Mailing list created successfully",
      })
      setShowCreateDialog(false)
      setNewList({ name: "", description: "" })
      fetchMailingLists()
    } catch (error) {
      console.error("Error creating mailing list:", error)
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <AdminNavigation />
      <main className="min-h-screen py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Mailing Lists</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage mailing lists for your email campaigns
            </p>
          </div>

          <div className="flex gap-3 mb-6">
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Mailing List
            </Button>
            <Button variant="outline" onClick={() => router.push("/admin/campaigns")} className="gap-2">
              View Campaigns
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading mailing lists...</p>
            </div>
          ) : mailingLists.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground mb-4">No mailing lists yet</p>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Mailing List
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {mailingLists.map((list) => (
                <div
                  key={list.id}
                  className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/admin/mailing-lists/${list.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-bold text-sm">{list.name}</h3>
                      </div>
                      {list.description && (
                        <p className="text-xs text-muted-foreground mb-2">{list.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{list.total_subscribers || 0} subscriber(s)</span>
                        <span>•</span>
                        <span>Created {new Date(list.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/admin/mailing-lists/${list.id}`)
                      }}
                      className="gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Mailing List</DialogTitle>
            <DialogDescription>
              Create a new mailing list to organize your email subscribers
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Newsletter Subscribers"
                value={newList.name}
                onChange={(e) => setNewList({ ...newList, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe this mailing list..."
                rows={3}
                value={newList.description}
                onChange={(e) => setNewList({ ...newList, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={handleCreateList} disabled={creating}>
              {creating ? "Creating..." : "Create Mailing List"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
