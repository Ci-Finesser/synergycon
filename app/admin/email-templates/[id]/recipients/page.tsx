"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Search, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Recipient {
  id: string
  full_name: string
  email: string
  phone_number: string
  organization: string
  role: string
  tickets: any
  status: string
}

export default function EmailRecipientsPage() {
  const params = useParams()
  const paramsId = params.id as string
  
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [ticketFilter, setTicketFilter] = useState<string>("all")

  // Mock data - replace with actual database query
  useEffect(() => {
    const mockRecipients: Recipient[] = [
      {
        id: "1",
        full_name: "Chukwuemeka Okonkwo",
        email: "chukwuemeka.okonkwo@example.com",
        phone_number: "+234 801 234 5678",
        organization: "TechHub Lagos",
        role: "Software Developer",
        tickets: [{ type: "Early Bird", quantity: 1, price: 15000 }],
        status: "confirmed",
      },
      {
        id: "2",
        full_name: "Aisha Mohammed",
        email: "aisha.mohammed@example.com",
        phone_number: "+234 802 345 6789",
        organization: "Fashion Forward Nigeria",
        role: "Fashion Designer",
        tickets: [{ type: "Regular Pass", quantity: 1, price: 25000 }],
        status: "confirmed",
      },
      {
        id: "3",
        full_name: "Oluwaseun Adeyemi",
        email: "oluwaseun.adeyemi@example.com",
        phone_number: "+234 803 456 7890",
        organization: "SoundWave Studios",
        role: "Music Producer",
        tickets: [{ type: "VIP Pass", quantity: 1, price: 50000 }],
        status: "confirmed",
      },
    ]
    setRecipients(mockRecipients)
  }, [])

  const emailSubjects: Record<string, string> = {
    "1": "Welcome to SynergyCon 2026!",
    "2": "Early Bird Tickets Now Available",
  }

  const filteredRecipients = recipients.filter((recipient) => {
    const matchesSearch =
      recipient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.organization?.toLowerCase().includes(searchTerm.toLowerCase())

    if (ticketFilter === "all") {
      return matchesSearch
    }

    const ticketType = recipient.tickets?.[0]?.type || ""
    return matchesSearch && ticketType === ticketFilter
  })

  const getTicketType = (tickets: any) => {
    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
      return "N/A"
    }
    return tickets[0].type
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/admin/email-templates">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Emails
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
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Users className="w-4 h-4" />
            <span>Email Recipients</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">{emailSubjects[paramsId] || "Email Recipients"}</h1>
          <p className="text-sm text-muted-foreground">
            {filteredRecipients.length} recipient{filteredRecipients.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select value={ticketFilter} onValueChange={setTicketFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Filter by ticket type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ticket Types</SelectItem>
                <SelectItem value="Early Bird">Early Bird</SelectItem>
                <SelectItem value="Regular Pass">Regular Pass</SelectItem>
                <SelectItem value="VIP Pass">VIP Pass</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredRecipients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No recipients found</p>
            </div>
          ) : (
            filteredRecipients.map((recipient) => (
              <div
                key={recipient.id}
                className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm mb-1">{recipient.full_name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground/60">Email:</span>
                        <span className="truncate">{recipient.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground/60">Phone:</span>
                        <span>{recipient.phone_number}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground/60">Organization:</span>
                        <span className="truncate">{recipient.organization}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground/60">Role:</span>
                        <span>{recipient.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium whitespace-nowrap">
                      {getTicketType(recipient.tickets)}
                    </div>
                    <div className="px-2 py-1 bg-green-500/10 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                      {recipient.status}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
