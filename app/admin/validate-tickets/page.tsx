"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  XCircle,
  Search,
  ScanLine,
  Clock,
  User,
  Mail,
  Ticket,
  AlertCircle,
  TrendingUp,
  WifiOff,
  Loader2,
} from "lucide-react"
import { AdminNavigation } from "@/components/admin-navigation"
import { useNetworkStore } from "@/lib/stores/network-store"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import type { TicketValidation, ValidationStats } from "@/types/ticket"

export default function TicketValidationPage() {
  const { isOnline } = useNetworkStore()
  const { isLoading: isAuthLoading, isAuthenticated, authFetch } = useAdminAuth()
  const [ticketNumber, setTicketNumber] = useState("")
  const [validationLocation, setValidationLocation] = useState("")
  const [validationNotes, setValidationNotes] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [recentValidations, setRecentValidations] = useState<TicketValidation[]>([])
  const [stats, setStats] = useState<ValidationStats[]>([])
  const [totalValidationsToday, setTotalValidationsToday] = useState(0)

  // Fetch recent validations
  const fetchRecentValidations = async () => {
    if (!isAuthenticated) return
    
    try {
      const response = await authFetch('/api/admin/tickets/validations?limit=10')

      if (response.ok) {
        const data = await response.json()
        setRecentValidations(data.validations || [])
        setStats(data.stats || [])
        
        // Calculate total validations today
        const today = data.validations?.filter((v: TicketValidation) => {
          const validatedDate = new Date(v.validated_at).toDateString()
          const todayDate = new Date().toDateString()
          return validatedDate === todayDate
        }).length || 0
        setTotalValidationsToday(today)
      }
    } catch (error) {
      console.error('Error fetching validations:', error)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecentValidations()
    }
  }, [isAuthenticated])

  // Check ticket status
  const checkTicket = async () => {
    if (!ticketNumber.trim()) {
      setValidationResult({
        success: false,
        error: 'Please enter a ticket number',
      })
      return
    }

    setIsChecking(true)
    setValidationResult(null)

    try {
      const response = await authFetch(
        `/api/admin/tickets/validate?ticket_number=${encodeURIComponent(ticketNumber)}`
      )

      const data = await response.json()
      setValidationResult(data)
    } catch (error) {
      console.error('Error checking ticket:', error)
      setValidationResult({
        success: false,
        error: 'Failed to check ticket status',
      })
    } finally {
      setIsChecking(false)
    }
  }

  // Validate ticket
  const validateTicket = async () => {
    if (!ticketNumber.trim()) {
      setValidationResult({
        success: false,
        error: 'Please enter a ticket number',
      })
      return
    }

    setIsValidating(true)

    try {
      const response = await authFetch('/api/admin/tickets/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticket_number: ticketNumber,
          validation_location: validationLocation,
          validation_notes: validationNotes,
        }),
      })

      const data = await response.json()
      setValidationResult(data)

      if (data.success) {
        // Clear form on success
        setTicketNumber('')
        setValidationNotes('')
        
        // Refresh validations list
        fetchRecentValidations()
      }
    } catch (error) {
      console.error('Error validating ticket:', error)
      setValidationResult({
        success: false,
        error: 'Failed to validate ticket',
      })
    } finally {
      setIsValidating(false)
    }
  }

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      checkTicket()
    }
  }

  return (
    <>
      <AdminNavigation />
      <main className="min-h-screen py-12 px-4 md:px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                Ticket Validation
              </h1>
              <p className="text-sm text-muted-foreground">
                Scan and validate attendee tickets at entry points
              </p>
            </div>
            {!isOnline && (
              <Badge variant="destructive" className="gap-1">
                <WifiOff className="w-3 h-3" />
                Offline
              </Badge>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Validated Today</CardDescription>
                <CardTitle className="text-2xl text-green-600">
                  {totalValidationsToday}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total All Time</CardDescription>
                <CardTitle className="text-2xl">
                  {stats.reduce((sum, s) => sum + s.total_validations, 0)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Unique Tickets</CardDescription>
                <CardTitle className="text-2xl">
                  {stats.reduce((sum, s) => sum + s.unique_tickets_validated, 0)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Current Time</CardDescription>
                <CardTitle className="text-2xl">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Validation Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ScanLine className="w-5 h-5" />
                    Scan Ticket
                  </CardTitle>
                  <CardDescription>
                    Enter or scan ticket number to validate attendee
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Ticket Number *</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="SYN2-XXXXXXXX-T001"
                        value={ticketNumber}
                        onChange={(e) => setTicketNumber(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="font-mono"
                        autoFocus
                      />
                      <Button
                        onClick={checkTicket}
                        disabled={isChecking || !ticketNumber.trim()}
                        variant="outline"
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Location</Label>
                    <Input
                      placeholder="Main Entrance, VIP Lounge, etc."
                      value={validationLocation}
                      onChange={(e) => setValidationLocation(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      placeholder="Any additional notes..."
                      value={validationNotes}
                      onChange={(e) => setValidationNotes(e.target.value)}
                      rows={2}
                    />
                  </div>

                  {/* Validation Result */}
                  {validationResult && (
                    <div
                      className={`p-4 rounded-lg border-2 ${
                        validationResult.success && validationResult.valid
                          ? 'bg-green-50 border-green-500 dark:bg-green-900/20'
                          : 'bg-red-50 border-red-500 dark:bg-red-900/20'
                      }`}
                    >
                      {validationResult.success && validationResult.valid ? (
                        <>
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            <h3 className="font-semibold text-green-900 dark:text-green-100">
                              Valid Ticket
                            </h3>
                          </div>
                          {validationResult.ticket_info && (
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span>{validationResult.ticket_info.attendee_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span>{validationResult.ticket_info.attendee_email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Ticket className="w-4 h-4 text-muted-foreground" />
                                <span>{validationResult.ticket_info.ticket_type}</span>
                              </div>
                              {validationResult.ticket_info.already_validated && (
                                <div className="flex items-center gap-2 text-orange-600">
                                  <AlertCircle className="w-4 h-4" />
                                  <span className="font-medium">
                                    Already validated {validationResult.ticket_info.validation_count} time(s)
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-6 h-6 text-red-600" />
                            <h3 className="font-semibold text-red-900 dark:text-red-100">
                              Invalid Ticket
                            </h3>
                          </div>
                          <p className="text-sm text-red-800 dark:text-red-200">
                            {validationResult.error || validationResult.message}
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={validateTicket}
                      disabled={isValidating || !ticketNumber.trim() || !validationResult?.valid}
                      className="flex-1"
                    >
                      {isValidating ? 'Validating...' : 'Validate & Check-In'}
                    </Button>
                    <Button
                      onClick={() => {
                        setTicketNumber('')
                        setValidationNotes('')
                        setValidationResult(null)
                      }}
                      variant="outline"
                    >
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Validations */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Validations
                  </CardTitle>
                  <CardDescription>Last 10 validated tickets</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentValidations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Ticket className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No validations yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {recentValidations.map((validation) => (
                        <div
                          key={validation.id}
                          className="p-3 border rounded-lg bg-background"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-mono text-sm font-semibold">
                                {validation.ticket_number}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {validation.attendee_name}
                              </p>
                            </div>
                            <Badge variant="default" className="bg-green-500">
                              Validated
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {new Date(validation.validated_at).toLocaleTimeString()}
                            </span>
                            {validation.validation_location && (
                              <span>📍 {validation.validation_location}</span>
                            )}
                          </div>
                          {validation.validation_notes && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              {validation.validation_notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Validation Stats by Type */}
              {stats.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      By Ticket Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.map((stat) => (
                        <div key={stat.ticket_type_id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <p className="font-medium text-sm">{stat.ticket_type_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {stat.validations_today} today
                            </p>
                          </div>
                          <Badge variant="outline">
                            {stat.unique_tickets_validated} tickets
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
