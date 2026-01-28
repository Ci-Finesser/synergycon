"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Plus, Upload, Trash2, UserPlus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MailingList {
  id: string
  name: string
  description: string | null
  total_subscribers: number
}

interface Subscriber {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  status: string
  subscribed_at: string
}

export default function MailingListDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mailingList, setMailingList] = useState<MailingList | null>(null)
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newSubscriber, setNewSubscriber] = useState({
    email: "",
    first_name: "",
    last_name: "",
  })
  const [adding, setAdding] = useState(false)

  const listId = params.id as string

  useEffect(() => {
    if (listId) {
      fetchMailingList()
      fetchSubscribers()
    }
  }, [listId])

  const fetchMailingList = async () => {
    try {
      const response = await fetch("/api/admin/mailing-lists")
      
      if (!response.ok) {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to fetch mailing list",
          variant: "destructive",
        })
        return
      }
      
      const data = await response.json()
      const list = data.mailingLists?.find((l: MailingList) => l.id === listId)
      
      if (list) {
        setMailingList(list)
      } else {
        toast({
          title: "Error",
          description: "Mailing list not found",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching mailing list:", error)
      toast({
        title: "Error",
        description: "Unable to load mailing list. Please check your connection.",
        variant: "destructive",
      })
    }
  }

  const fetchSubscribers = async () => {
    try {
      const response = await fetch(`/api/admin/mailing-lists/${listId}/subscribers`)
      
      if (!response.ok) {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to fetch subscribers",
          variant: "destructive",
        })
        return
      }
      
      const data = await response.json()
      setSubscribers(data.subscribers || [])
    } catch (error) {
      console.error("Error fetching subscribers:", error)
      toast({
        title: "Error",
        description: "Unable to load subscribers. Please check your connection.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubscriber = async () => {
    if (!newSubscriber.email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setAdding(true)

    try {
      const response = await fetch(`/api/admin/mailing-lists/${listId}/subscribers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSubscriber),
      })

      if (!response.ok) {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to add subscriber",
          variant: "destructive",
        })
        return
      }

      const data = await response.json()
      toast({
        title: "Success",
        description: "Subscriber added successfully",
      })
      setShowAddDialog(false)
      setNewSubscriber({ email: "", first_name: "", last_name: "" })
      fetchSubscribers()
      fetchMailingList()
    } catch (error) {
      console.error("Error adding subscriber:", error)
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setAdding(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Error",
        description: "Please upload a CSV file",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`/api/admin/mailing-lists/${listId}/import`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to import subscribers",
          variant: "destructive",
        })
        return
      }

      const data = await response.json()
      toast({
        title: "Success",
        description: data.message || `Imported ${data.imported} subscriber(s)`,
      })
      fetchSubscribers()
      fetchMailingList()
    } catch (error) {
      console.error("Error importing subscribers:", error)
      toast({
        title: "Error",
        description: "Network error while importing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeleteSubscriber = async (subscriberId: string) => {
    if (!confirm("Are you sure you want to remove this subscriber?")) {
      return
    }

    try {
      const response = await fetch(
        `/api/admin/mailing-lists/${listId}/subscribers?subscriberId=${subscriberId}`,
        {
          method: "DELETE",
        }
      )

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subscriber removed successfully",
        })
        fetchSubscribers()
        fetchMailingList()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to remove subscriber",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove subscriber",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/admin/mailing-lists">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Mailing Lists
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                View Site
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button variant="ghost" size="sm" className="gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">{mailingList?.name || "Loading..."}</h1>
          {mailingList?.description && (
            <p className="text-sm text-muted-foreground">{mailingList.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {mailingList?.total_subscribers || 0} subscriber(s)
          </p>
        </div>

        <Tabs defaultValue="subscribers" className="w-full">
          <TabsList>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="subscribers" className="space-y-4 mt-6">
            <div className="flex gap-3">
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Subscriber
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading subscribers...</p>
              </div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground mb-4">No subscribers yet</p>
                <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Your First Subscriber
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {subscribers.map((subscriber) => (
                  <div
                    key={subscriber.id}
                    className="bg-background border border-border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-sm">
                        {subscriber.full_name || subscriber.email}
                      </h3>
                      <p className="text-xs text-muted-foreground">{subscriber.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Added {new Date(subscriber.subscribed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSubscriber(subscriber.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-6">
            <div className="bg-background border border-border rounded-lg p-6">
              <h3 className="font-bold text-lg mb-2">Import Subscribers from CSV</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a CSV file with email addresses. The file should have an 'email' column.
                Optionally include 'first_name' and 'last_name' columns.
              </p>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    {uploading ? "Uploading..." : "Click to upload or drag and drop"}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    id="csv-upload"
                  />
                  <Label htmlFor="csv-upload">
                    <Button asChild disabled={uploading}>
                      <span className="cursor-pointer">
                        {uploading ? "Uploading..." : "Select CSV File"}
                      </span>
                    </Button>
                  </Label>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2">CSV Format Example:</h4>
                  <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
                    {`email,first_name,last_name
john@example.com,John,Doe
jane@example.com,Jane,Smith`}
                  </pre>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subscriber</DialogTitle>
            <DialogDescription>Add a new subscriber to this mailing list</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="subscriber@example.com"
                value={newSubscriber.email}
                onChange={(e) => setNewSubscriber({ ...newSubscriber, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="first_name">First Name (optional)</Label>
              <Input
                id="first_name"
                placeholder="John"
                value={newSubscriber.first_name}
                onChange={(e) => setNewSubscriber({ ...newSubscriber, first_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name (optional)</Label>
              <Input
                id="last_name"
                placeholder="Doe"
                value={newSubscriber.last_name}
                onChange={(e) => setNewSubscriber({ ...newSubscriber, last_name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={adding}>
              Cancel
            </Button>
            <Button onClick={handleAddSubscriber} disabled={adding}>
              {adding ? "Adding..." : "Add Subscriber"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
