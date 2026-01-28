"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Send, Eye, Tag, Image as ImageIcon, X, Layout } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { emailTemplates, templateCategories, type EmailTemplate } from "@/lib/email-templates/templates"
import { EVENT_NAME, EVENT_TAGLINE, EVENT_DATES, VENUE_SHORT_NAMES } from "@/lib/constants"
import dynamic from "next/dynamic"
import "react-quill-new/dist/quill.snow.css"

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })

interface MailingList {
  id: string
  name: string
  total_subscribers: number
}

export default function CreateCampaignPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [mailingLists, setMailingLists] = useState<MailingList[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("All")

  const [campaign, setCampaign] = useState({
    name: "",
    subject: "",
    body: "",
    mailing_list_id: "",
    tags: [] as string[],
  })

  const [newTag, setNewTag] = useState("")

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
        description: "Unable to load mailing lists. Please refresh the page.",
        variant: "destructive",
      })
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !campaign.tags.includes(newTag.trim())) {
      setCampaign({ ...campaign, tags: [...campaign.tags, newTag.trim()] })
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setCampaign({ ...campaign, tags: campaign.tags.filter((tag) => tag !== tagToRemove) })
  }

  const handleSelectTemplate = (template: EmailTemplate) => {
    setCampaign({ ...campaign, body: template.htmlContent })
    setShowTemplates(false)
    toast({
      title: "Template Applied",
      description: `"${template.name}" template has been loaded`,
    })
  }

  const filteredTemplates = selectedCategory === "All"
    ? emailTemplates
    : emailTemplates.filter((t) => t.category === selectedCategory)

  const handleImageUpload = () => {
    const input = document.createElement("input")
    input.setAttribute("type", "file")
    input.setAttribute("accept", "image/*")
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      // Convert to base64 for embedding in email
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64Image = e.target?.result as string
        // Validate image type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: "Please upload an image file",
            variant: "destructive",
          })
          return
        }
        // Insert image at the end of the content
        setCampaign(prev => ({
          ...prev,
          body: prev.body + `<img src="${base64Image}" alt="Embedded image" style="max-width: 100%;" />`
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: handleImageUpload,
        },
      },
    }),
    []
  )

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "align",
    "list",
    "link",
    "image",
  ]

  const handleSave = async (status: "draft" | "sending") => {
    if (!campaign.name.trim() || !campaign.subject.trim() || !campaign.body.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (status === "sending" && !campaign.mailing_list_id) {
      toast({
        title: "Error",
        description: "Please select a mailing list to send the campaign",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      const response = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...campaign,
          status: status,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to save campaign",
          variant: "destructive",
        })
        return
      }

      const data = await response.json()
      
      toast({
        title: "Success",
        description: status === "draft" ? "Campaign saved as draft" : "Campaign created",
      })

      if (status === "sending") {
        // Send the campaign
        try {
          const sendResponse = await fetch(`/api/admin/campaigns/${data.campaign.id}/send`, {
            method: "POST",
          })

          if (!sendResponse.ok) {
            const sendData = await sendResponse.json()
            toast({
              title: "Error",
              description: sendData.error || "Failed to send campaign",
              variant: "destructive",
            })
            return
          }

          const sendData = await sendResponse.json()
          toast({
            title: "Success",
            description: sendData.message || "Campaign is being sent",
          })
          router.push("/admin/campaigns")
        } catch (sendError) {
          console.error("Error sending campaign:", sendError)
          toast({
            title: "Error",
            description: "Network error while sending campaign. Please try again.",
            variant: "destructive",
          })
        }
      } else {
        router.push("/admin/campaigns")
      }
    } catch (error) {
      console.error("Error saving campaign:", error)
      toast({
        title: "Error",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const selectedList = mailingLists.find((list) => list.id === campaign.mailing_list_id)

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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? "Edit" : "Preview"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleSave("draft")} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button size="sm" onClick={() => handleSave("sending")} disabled={saving}>
              <Send className="w-4 h-4 mr-2" />
              {saving ? "Sending..." : "Send Campaign"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Create Email Campaign</h1>
          <p className="text-sm text-muted-foreground">
            Compose your email campaign with rich content and images
          </p>
        </div>

        {showPreview ? (
          <div className="bg-background border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Preview</h2>
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border">
              <div className="bg-black text-white px-12 py-12 text-center">
                <h1 className="text-4xl font-bold tracking-tight">{EVENT_NAME.toUpperCase()}</h1>
                <p className="text-base text-gray-300 mt-3">{EVENT_TAGLINE}</p>
              </div>
              <div className="px-12 py-8">
                <h2 className="text-2xl font-bold mb-4">{campaign.subject || "Subject Line"}</h2>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: campaign.body || "<p>Email content will appear here...</p>" }}
                />
              </div>
              <div className="bg-gray-50 px-12 py-8 border-t">
                <div className="text-center space-y-2">
                  <p className="text-base font-semibold text-gray-800">{EVENT_DATES.displayRange}</p>
                  <p className="text-sm text-gray-600">
                    {VENUE_SHORT_NAMES.join(" • ")}
                  </p>
                  <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-300">
                    © 2026 SynergyCon. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-background border border-border rounded-lg p-6 space-y-4">
              <div>
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Weekly Newsletter - January 2026"
                  value={campaign.name}
                  onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Exciting Updates from SynergyCon"
                  value={campaign.subject}
                  onChange={(e) => setCampaign({ ...campaign, subject: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supports personalization: Use {"{{first_name}}"}, {"{{last_name}}"}, {"{{email}}"}
                </p>
              </div>

              <div>
                <Label htmlFor="mailing_list">Mailing List *</Label>
                <Select value={campaign.mailing_list_id} onValueChange={(value) => setCampaign({ ...campaign, mailing_list_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a mailing list" />
                  </SelectTrigger>
                  <SelectContent>
                    {mailingLists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name} ({list.total_subscribers} subscribers)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedList && (
                  <p className="text-xs text-muted-foreground mt-1">
                    This campaign will be sent to {selectedList.total_subscribers} subscriber(s)
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="tags">Tags (optional)</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="tags"
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    Add
                  </Button>
                </div>
                {campaign.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {campaign.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-background border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <Label className="mb-0">Email Content *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplates(true)}
                  className="gap-2"
                >
                  <Layout className="w-4 h-4" />
                  Choose Template
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Use the toolbar to format text, add links, and insert images. Supports personalization with {"{{first_name}}"}, {"{{last_name}}"}, {"{{email}}"}
              </p>
              <div className="bg-white rounded border">
                <ReactQuill
                  theme="snow"
                  value={campaign.body}
                  onChange={(value) => setCampaign({ ...campaign, body: value })}
                  modules={modules}
                  formats={formats}
                  placeholder="Compose your email content here or choose a template..."
                  style={{ minHeight: "400px" }}
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
                💡 Personalization Tips
              </h3>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Use {"{{first_name}}"} to insert the recipient's first name</li>
                <li>• Use {"{{last_name}}"} to insert the recipient's last name</li>
                <li>• Use {"{{email}}"} to insert the recipient's email address</li>
                <li>• Images are embedded directly in the email for maximum compatibility</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Template Selection Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose Email Template</DialogTitle>
            <DialogDescription>
              Select a predefined template to start your email campaign
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {templateCategories.map((category) => (
                <Button
                  key={category}
                  type="button"
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border border-border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-3 min-h-[150px] flex items-center justify-center">
                    <Layout className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1 group-hover:text-primary">
                    {template.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {template.description}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
