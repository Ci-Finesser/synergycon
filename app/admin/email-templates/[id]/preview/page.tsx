"use client"

import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { EVENT_NAME, EVENT_DATES, VENUE_SHORT_NAMES, EVENT_YEAR } from "@/lib/constants"

const venueList = VENUE_SHORT_NAMES.join(", ")

// Sample email data - in production this would fetch from database
const sampleEmails = [
  {
    id: "1",
    subject: `Welcome to SynergyCon ${EVENT_YEAR}!`,
    recipients: 3,
    sentAt: "December 15, 2025, 02:30:00 PM",
    body: `<p style='font-size: 18px; line-height: 1.7; color: #1a1a1a; margin-bottom: 24px;'>We're thrilled to have you join the SynergyCon community!</p><p style='font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 12px; font-weight: 500;'>You'll be the first to know about:</p><ul style='margin: 0; padding: 0; list-style: none;'><li style='font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 10px; padding-left: 24px;'>• Speaker announcements and exclusive interviews</li><li style='font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 10px; padding-left: 24px;'>• Early bird registration opportunities</li><li style='font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 10px; padding-left: 24px;'>• Event schedule and session details</li><li style='font-size: 16px; line-height: 1.8; color: #333; padding-left: 24px;'>• Behind-the-scenes updates from the creative economy</li></ul><p style='font-size: 16px; line-height: 1.7; color: #333; margin-top: 28px;'>${EVENT_NAME} is happening on <strong style='color: #000; font-weight: 600;'>${EVENT_DATES.displayRange}</strong> at ${venueList}. Mark your calendar!</p>`,
  },
  {
    id: "2",
    subject: "Early Bird Tickets Now Available!",
    recipients: 3,
    sentAt: "December 10, 2025, 09:15:00 AM",
    body: "<p style='font-size: 18px; line-height: 1.7; color: #1a1a1a; margin-bottom: 20px;'>Secure your spot at SynergyCon 2.0 with exclusive early bird pricing!</p><p style='font-size: 16px; line-height: 1.6; color: #333;'>Limited time offer - save up to 40% on tickets.</p>",
  },
]

export default function EmailPreviewPage() {
  const router = useRouter()
  const params = useParams()
  const emailId = params.id as string

  const email = sampleEmails.find((e) => e.id === emailId) || sampleEmails[0]

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 bg-white border-b border-border shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/email-templates")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Email Campaigns
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h3 className="font-semibold text-sm">{email.subject}</h3>
              <p className="text-xs text-muted-foreground">
                Sent to {email.recipients} recipients on {email.sentAt}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Preview */}
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-[#e5e5e5]">
          {/* Email Header */}
          <div className="bg-black text-white px-12 py-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight">{EVENT_NAME.toUpperCase()}</h1>
            <p className="text-base text-gray-300 mt-3">Creativity, Culture, Community</p>
          </div>

          {/* Email Body */}
          <div className="px-12 py-12">
            <div className="text-gray-900 leading-relaxed" dangerouslySetInnerHTML={{ __html: email.body }} />
          </div>

          {/* Email Footer */}
          <div className="bg-[#f5f5f5] px-12 py-10 border-t border-[#e5e5e5]">
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
  )
}
