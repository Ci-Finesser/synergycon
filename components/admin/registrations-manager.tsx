"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Edit2, Eye, X, Search, WifiOff } from "lucide-react"
import type { Registration } from "@/lib/registrations"
import { useNetworkStore } from "@/lib/stores/network-store"

type RegistrationsManagerProps = {
  initialRegistrations: Registration[]
}

export function RegistrationsManager({ initialRegistrations }: RegistrationsManagerProps) {
  const { isOnline } = useNetworkStore()
  const [registrations, setRegistrations] = useState(initialRegistrations)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Registration>>({})

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && viewingId) {
        setViewingId(null)
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [viewingId])

  const filteredRegistrations = registrations.filter(
    (reg) =>
      reg.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.organization?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEdit = (registration: Registration) => {
    setEditingId(registration.id)
    setEditForm(registration)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleSaveEdit = async () => {
    if (!editingId) return

    const response = await fetch(`/api/admin/registrations/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    })

    if (response.ok) {
      setRegistrations(registrations.map((reg) => (reg.id === editingId ? { ...reg, ...editForm } : reg)))
      setEditingId(null)
      setEditForm({})
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this registration?")) return

    const response = await fetch(`/api/admin/registrations/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      setRegistrations(registrations.filter((reg) => reg.id !== id))
    }
  }

  const viewingRegistration = viewingId ? registrations.find((r) => r.id === viewingId) : null

  return (
    <>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, email, or organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>
      </div>

      {/* Attendees List */}
      <div className="space-y-4">
        {filteredRegistrations.length === 0 ? (
          <div className="bg-background border border-border rounded-lg p-8 text-center">
            <p className="text-sm text-muted-foreground">No attendees found</p>
          </div>
        ) : (
          filteredRegistrations.map((registration) => (
            <div key={registration.id} className="bg-background border border-border rounded-lg p-6">
              {editingId === registration.id ? (
                <div className="space-y-4">
                  {/* Personal Information Section */}
                  <div>
                    <h4 className="text-xs font-bold mb-2 text-foreground/70">Personal Information</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="full_name" className="text-xs mb-1 block">
                          Full Name
                        </Label>
                        <Input
                          id="full_name"
                          value={editForm.full_name || ""}
                          onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-xs mb-1 block">
                          Email
                        </Label>
                        <Input
                          id="email"
                          value={editForm.email || ""}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone_number" className="text-xs mb-1 block">
                          Phone
                        </Label>
                        <Input
                          id="phone_number"
                          value={editForm.phone_number || ""}
                          onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label htmlFor="organization" className="text-xs mb-1 block">
                          Organization
                        </Label>
                        <Input
                          id="organization"
                          value={editForm.organization || ""}
                          onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role" className="text-xs mb-1 block">
                          Role
                        </Label>
                        <Input
                          id="role"
                          value={editForm.role || ""}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label htmlFor="industry" className="text-xs mb-1 block">
                          Industry
                        </Label>
                        <Input
                          id="industry"
                          value={editForm.industry || ""}
                          onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Information Section */}
                  <div>
                    <h4 className="text-xs font-bold mb-2 text-foreground/70">Order Information</h4>
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <Label htmlFor="order_id" className="text-xs mb-1 block">
                          Order ID (Auto-generated)
                        </Label>
                        <Input
                          id="order_id"
                          value={editForm.order_id || ""}
                          disabled
                          className="h-8 text-xs bg-muted/50 cursor-not-allowed opacity-60"
                        />
                      </div>
                      <div>
                        <Label htmlFor="total_amount" className="text-xs mb-1 block">
                          Total Amount (₦)
                        </Label>
                        <Input
                          id="total_amount"
                          type="number"
                          value={editForm.total_amount || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, total_amount: Number.parseFloat(e.target.value) })
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label htmlFor="status" className="text-xs mb-1 block">
                          Status
                        </Label>
                        <select
                          id="status"
                          value={editForm.status || "pending"}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="how_did_you_hear" className="text-xs mb-1 block">
                          How They Heard
                        </Label>
                        <Input
                          id="how_did_you_hear"
                          value={editForm.how_did_you_hear || ""}
                          onChange={(e) => setEditForm({ ...editForm, how_did_you_hear: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Event Details Section */}
                  <div>
                    <h4 className="text-xs font-bold mb-2 text-foreground/70">Event Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="attendance_reason" className="text-xs mb-1 block">
                          Why They Want to Attend
                        </Label>
                        <Textarea
                          id="attendance_reason"
                          value={editForm.attendance_reason || ""}
                          onChange={(e) => setEditForm({ ...editForm, attendance_reason: e.target.value })}
                          className="min-h-[60px] text-xs resize-none"
                        />
                      </div>
                      <div>
                        <Label htmlFor="expectations" className="text-xs mb-1 block">
                          Expectations
                        </Label>
                        <Textarea
                          id="expectations"
                          value={editForm.expectations || ""}
                          onChange={(e) => setEditForm({ ...editForm, expectations: e.target.value })}
                          className="min-h-[60px] text-xs resize-none"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dietary_requirements" className="text-xs mb-1 block">
                          Dietary Requirements
                        </Label>
                        <Input
                          id="dietary_requirements"
                          value={editForm.dietary_requirements || ""}
                          onChange={(e) => setEditForm({ ...editForm, dietary_requirements: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button onClick={handleSaveEdit} size="sm" className="h-7 text-xs px-3">
                      Save Changes
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-3 bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-2">{registration.full_name}</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                      <div>
                        <span className="text-muted-foreground">Email:</span> {registration.email}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span> {registration.phone_number || "N/A"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Organization:</span>{" "}
                        {registration.organization || "N/A"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Role:</span> {registration.role || "N/A"}
                      </div>
                      {registration.order_id && (
                        <div>
                          <span className="text-muted-foreground">Order ID:</span> {registration.order_id}
                        </div>
                      )}
                      {registration.total_amount > 0 && (
                        <div>
                          <span className="text-muted-foreground">Total:</span> ₦
                          {registration.total_amount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingId(registration.id)}
                      className="h-8 text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(registration)}
                      className="h-8 text-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(registration.id)}
                      className="h-8 text-xs text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* View Full Details Modal */}
      {viewingRegistration && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setViewingId(null)}
        >
          <div
            className="bg-background border border-border rounded-lg max-w-3xl w-full max-h-[85vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Attendee Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setViewingId(null)} className="h-8 w-8 p-0">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-base font-bold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Full Name:</span>{" "}
                    <span className="font-medium">{viewingRegistration.full_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    <span className="font-medium">{viewingRegistration.email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>{" "}
                    <span className="font-medium">{viewingRegistration.phone_number || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Organization:</span>{" "}
                    <span className="font-medium">{viewingRegistration.organization || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Role:</span>{" "}
                    <span className="font-medium">{viewingRegistration.role || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Industry:</span>{" "}
                    <span className="font-medium">{viewingRegistration.industry || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Ticket Information */}
              {viewingRegistration.tickets && (
                <div>
                  <h3 className="text-base font-bold mb-3">Tickets & Order</h3>
                  <div className="bg-muted/20 border border-border rounded-lg p-4 space-y-2">
                    {Array.isArray(viewingRegistration.tickets) ? (
                      viewingRegistration.tickets.map((ticket: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm py-1">
                          <span className="font-medium">{ticket.type}</span>
                          <span className="text-muted-foreground">
                            {ticket.quantity} × ₦{ticket.price?.toLocaleString() || "0"} = ₦
                            {((ticket.quantity || 0) * (ticket.price || 0)).toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No ticket information available</p>
                    )}
                    <div className="border-t border-border pt-2 mt-2">
                      <div className="flex justify-between items-center font-bold text-base">
                        <span>Total Amount</span>
                        <span>₦{viewingRegistration.total_amount?.toLocaleString() || "0"}</span>
                      </div>
                    </div>
                  </div>
                  {viewingRegistration.order_id && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Order ID: <span className="font-mono">{viewingRegistration.order_id}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Why Attending */}
              {viewingRegistration.attendance_reason && (
                <div>
                  <h3 className="text-base font-bold mb-3">Why Attending</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-muted/10 p-4 rounded-lg border border-border">
                    {viewingRegistration.attendance_reason}
                  </p>
                </div>
              )}

              {/* Expectations */}
              {viewingRegistration.expectations && (
                <div>
                  <h3 className="text-base font-bold mb-3">What They Hope to Gain</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-muted/10 p-4 rounded-lg border border-border">
                    {viewingRegistration.expectations}
                  </p>
                </div>
              )}

              {/* Additional Details */}
              <div>
                <h3 className="text-base font-bold mb-3">Additional Details</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  {viewingRegistration.dietary_requirements && (
                    <div>
                      <span className="text-muted-foreground">Dietary Requirements:</span>{" "}
                      <span className="font-medium">{viewingRegistration.dietary_requirements}</span>
                    </div>
                  )}
                  {viewingRegistration.how_did_you_hear && (
                    <div>
                      <span className="text-muted-foreground">How They Heard About Us:</span>{" "}
                      <span className="font-medium">{viewingRegistration.how_did_you_hear}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    <span
                      className={`font-medium ${
                        viewingRegistration.status === "confirmed"
                          ? "text-green-600"
                          : viewingRegistration.status === "cancelled"
                            ? "text-red-600"
                            : "text-yellow-600"
                      }`}
                    >
                      {viewingRegistration.status?.charAt(0).toUpperCase() + viewingRegistration.status?.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Registered:</span>{" "}
                    <span className="font-medium">
                      {new Date(viewingRegistration.created_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
