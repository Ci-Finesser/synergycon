"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Send, Settings, Plus, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminNavigation } from "@/components/admin-navigation"
import { EVENT_NAME, EVENT_DATES, VENUE_SHORT_NAMES } from "@/lib/constants"
import { useAdminAuth } from "@/hooks/use-admin-auth"

const venueList = VENUE_SHORT_NAMES.join(", ")

interface SentEmail {
  id: string
  subject: string
  recipients: number
  sentAt: string
  status: "sent" | "scheduled"
  body: string
}

export default function EmailCampaignsPage() {
  const [showCompose, setShowCompose] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { isLoading: isAuthLoading, isAuthenticated } = useAdminAuth()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isAuthLoading, isAuthenticated, router])

  const sentEmails: SentEmail[] = [
    {
      id: "1",
      subject: "Welcome to SynergyCon 2026!",
      recipients: 3,
      sentAt: "December 15, 2025, 02:30:00 PM",
      status: "sent",
      body: `<p style='font-size: 16px; line-height: 1.6; color: #333;'>We're thrilled to have you join the SynergyCon community!</p>
<p style='font-size: 16px; line-height: 1.6; color: #333;'>You'll be the first to know about:</p>
<ul style='font-size: 16px; line-height: 1.8; color: #333;'>
  <li>Speaker announcements and exclusive interviews</li>
  <li>Early bird registration opportunities</li>
  <li>Event schedule and session details</li>
  <li>Behind-the-scenes updates from the creative economy</li>
</ul>
<p style='font-size: 16px; line-height: 1.6; color: #333;'>${EVENT_NAME} is happening on <strong>${EVENT_DATES.displayRange}</strong> at ${venueList}. Mark your calendar!</p>`,
    },
    {
      id: "2",
      subject: "Early Bird Tickets Now Available",
      recipients: 3,
      sentAt: "December 10, 2025, 09:00:00 AM",
      status: "sent",
      body: "<p style='font-size: 16px; line-height: 1.6; color: #333;'>Great news! Early Bird tickets for SynergyCon 2026 are now available.</p><p style='font-size: 16px; line-height: 1.6; color: #333;'>Save up to 40% when you register today:</p><ul style='font-size: 16px; line-height: 1.8; color: #333;'><li><strong>Early Bird Pass:</strong> ₦15,000 (Regular: ₦25,000)</li><li><strong>VIP Pass:</strong> ₦50,000 (All-access experience)</li></ul><p style='font-size: 16px; line-height: 1.6; color: #333;'>Don't miss out on Nigeria's premier creative economy event!</p>",
    },
  ]

  const [emailData, setEmailData] = useState({
    subject: "",
    body: "",
  })

  const [ticketTemplate, setTicketTemplate] = useState({
    subject: "Your SynergyCon 2026 Ticket Confirmation",
    body: "Thank you for purchasing your ticket to SynergyCon 2026! Your order details are attached.",
  })

  const [reminderTemplate, setReminderTemplate] = useState({
    subject: "SynergyCon 2026 is Tomorrow!",
    body: "We're excited to see you tomorrow at SynergyCon 2026! Don't forget to bring your ticket.",
  })

  const handleSendEmail = async () => {
    if (!emailData.subject || !emailData.body) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Email Sent",
      description: `Email sent to all attendees successfully`,
    })
    setShowCompose(false)
    setEmailData({ subject: "", body: "" })
  }

  const handleSaveTicketTemplate = () => {
    toast({
      title: "Template Saved",
      description: "Ticket confirmation template updated successfully",
    })
  }

  const handleSaveReminderTemplate = () => {
    toast({
      title: "Template Saved",
      description: "Event reminder template updated successfully",
    })
  }

  if (showSettings) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Emails
            </Button>
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

        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-2">Email Automation Settings</h1>
          <p className="text-sm text-muted-foreground mb-6">Configure automated emails sent to attendees</p>

          <Tabs defaultValue="ticket" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="ticket">Ticket Confirmation</TabsTrigger>
              <TabsTrigger value="reminder">Event Reminder</TabsTrigger>
            </TabsList>

            <TabsContent value="ticket" className="space-y-4">
              <div className="bg-background border border-border rounded-lg p-6">
                <h3 className="font-bold mb-1">Ticket Purchase Confirmation</h3>
                <p className="text-sm text-muted-foreground mb-4">Automatically sent when someone purchases a ticket</p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="ticket-subject" className="text-xs">
                      Email Subject
                    </Label>
                    <Input
                      id="ticket-subject"
                      value={ticketTemplate.subject}
                      onChange={(e) => setTicketTemplate({ ...ticketTemplate, subject: e.target.value })}
                      className="text-sm h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ticket-body" className="text-xs">
                      Email Body
                    </Label>
                    <Textarea
                      id="ticket-body"
                      rows={8}
                      value={ticketTemplate.body}
                      onChange={(e) => setTicketTemplate({ ...ticketTemplate, body: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSaveTicketTemplate} size="sm">
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setTicketTemplate({
                          subject: "Your SynergyCon 2026 Ticket Confirmation",
                          body: "Thank you for purchasing your ticket to SynergyCon 2026! Your order details are attached.",
                        })
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reminder" className="space-y-4">
              <div className="bg-background border border-border rounded-lg p-6">
                <h3 className="font-bold mb-1">Event Reminder (1 day before)</h3>
                <p className="text-sm text-muted-foreground mb-4">Sent 24 hours before the event starts</p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="reminder-subject" className="text-xs">
                      Email Subject
                    </Label>
                    <Input
                      id="reminder-subject"
                      value={reminderTemplate.subject}
                      onChange={(e) => setReminderTemplate({ ...reminderTemplate, subject: e.target.value })}
                      className="text-sm h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reminder-body" className="text-xs">
                      Email Body
                    </Label>
                    <Textarea
                      id="reminder-body"
                      rows={8}
                      value={reminderTemplate.body}
                      onChange={(e) => setReminderTemplate({ ...reminderTemplate, body: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSaveReminderTemplate} size="sm">
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setReminderTemplate({
                          subject: "SynergyCon 2026 is Tomorrow!",
                          body: "We're excited to see you tomorrow at SynergyCon 2026! Don't forget to bring your ticket.",
                        })
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  if (showCompose) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setShowCompose(false)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Emails
            </Button>
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

        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-2">Compose Email</h1>
          <p className="text-sm text-muted-foreground mb-6">Send an email to all registered attendees</p>

          <div className="bg-background border border-border rounded-lg p-6 space-y-4">
            <div>
              <Label htmlFor="subject" className="text-sm mb-1.5">
                Subject
              </Label>
              <Input
                id="subject"
                placeholder="Enter email subject..."
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                className="h-9"
              />
            </div>

            <div>
              <Label htmlFor="body" className="text-sm mb-1.5">
                Message
              </Label>
              <Textarea
                id="body"
                placeholder="Type your message here..."
                value={emailData.body}
                onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                rows={12}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                This email will be sent to all {sentEmails[0]?.recipients || 3} registered attendees
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSendEmail} className="gap-2">
                <Send className="w-4 h-4" />
                Send Email
              </Button>
              <Button variant="outline" onClick={() => setShowCompose(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Email Campaigns</h1>
            <p className="text-sm text-muted-foreground">Send emails to attendees and manage automated messages</p>
          </div>

          <div className="flex gap-3 mb-6">
            <Button onClick={() => setShowCompose(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Compose Email
            </Button>
            <Button variant="outline" onClick={() => setShowSettings(true)} className="gap-2">
              <Settings className="w-4 h-4" />
              Automation Settings
            </Button>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3">Sent Emails</h2>
            <div className="space-y-3">
              {sentEmails.map((email) => (
                <div
                  key={email.id}
                  className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-bold text-sm">{email.subject}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <Link
                          href={`/admin/email-templates/${email.id}/recipients`}
                          className="hover:text-foreground hover:underline transition-colors"
                        >
                          {email.recipients} recipients
                        </Link>
                        <span>•</span>
                        <span>{email.sentAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/email-templates/${email.id}/preview`)}
                        className="gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </Button>
                      <div className="px-2 py-1 bg-green-500/10 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                        Sent
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
