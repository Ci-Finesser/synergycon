/**
 * Dashboard Tickets Page
 * View and manage tickets - enterprise users can purchase for others
 */
"use client"

import { useAuthStore } from "@/lib/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EVENT_NAME, EVENT_DATES, EVENT_LOCATION } from "@/lib/constants"
import {
  Ticket,
  Plus,
  Download,
  Mail,
  Calendar,
  MapPin,
  Users,
  Building2,
  Info,
  ExternalLink,
} from "lucide-react"

export default function TicketsPage() {
  const { user, profile } = useAuthStore()
  const isEnterprise = user?.user_type === "enterprise"

  // Placeholder ticket data
  const tickets: any[] = []

  if (!user || !profile) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">My Tickets</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage your event tickets
          </p>
        </div>
        <Button asChild size="sm" className="w-full sm:w-auto">
          <a href="/register">
            <Plus className="w-4 h-4 mr-2" />
            Purchase Tickets
          </a>
        </Button>
      </div>

      {/* Enterprise Feature Banner */}
      {isEnterprise && (
        <Alert className="border-primary/20 bg-primary/5">
          <Building2 className="h-4 w-4" />
          <AlertDescription>
            <span className="font-semibold">Enterprise Account:</span> You can purchase tickets for team members and manage group registrations.
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {tickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="p-4 rounded-full bg-primary/10 w-16 h-16 mx-auto flex items-center justify-center">
                <Ticket className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">No Tickets Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven't purchased any tickets for SynergyCon 2.0 yet. Register now to secure your spot!
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button asChild>
                    <a href="/register">
                      <Ticket className="w-4 h-4 mr-2" />
                      Register for Event
                    </a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href="/schedule">
                      <Calendar className="w-4 h-4 mr-2" />
                      View Schedule
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Tickets List */}
          <div className="space-y-4">
            {tickets.map((ticket: any) => (
              <Card key={ticket.id} className="overflow-hidden">
                <CardHeader className="p-4 sm:p-6 bg-primary/5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg sm:text-xl mb-1">
                        SynergyCon 2.0 - {ticket.ticket_type}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Order #{ticket.order_id}
                      </CardDescription>
                    </div>
                    <Badge variant={ticket.status === "active" ? "default" : "secondary"}>
                      {ticket.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Event Dates</p>
                        <p className="text-sm text-muted-foreground">
                          {EVENT_DATES.displayRange}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Venue</p>
                        <p className="text-sm text-muted-foreground">
                          {EVENT_LOCATION.displayLocation}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Ticket
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Ticket
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Enterprise: Purchase for Team */}
      {isEnterprise && (
        <Card className="border-primary/20">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg sm:text-xl">Team Registrations</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Purchase tickets for your team members (invitation-only feature)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-start gap-3 mb-4">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-medium">Enterprise Benefits:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                    <li>Purchase multiple tickets at once</li>
                    <li>Assign tickets to team members via email</li>
                    <li>Centralized ticket management</li>
                    <li>Group discounts available</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button className="w-full" asChild>
              <a href="/register?enterprise=true">
                <Building2 className="w-4 h-4 mr-2" />
                Purchase Team Tickets
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Event Information */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Event Information</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Event</span>
            <span className="font-medium">{EVENT_NAME}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Dates</span>
            <span className="font-medium">{EVENT_DATES.displayRange}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Location</span>
            <span className="font-medium">{EVENT_LOCATION.displayLocation}</span>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full mt-4">
            <a href="/about" target="_blank">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Event Details
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
