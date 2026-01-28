"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  DollarSign, 
  Ticket, 
  TrendingUp,
  Eye,
  EyeOff,
  WifiOff,
  Loader2,
} from "lucide-react"
import { AdminNavigation } from "@/components/admin-navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useNetworkStore } from "@/lib/stores/network-store"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import type { TicketType, TicketStats } from "@/types/ticket"

export default function AdminTicketsPage() {
  const { isOnline } = useNetworkStore()
  const { isLoading: isAuthLoading, isAuthenticated, authFetch } = useAdminAuth()
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [durationFilter, setDurationFilter] = useState<string>('all')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    ticket_id: '',
    name: '',
    description: '',
    price: 0,
    benefits: [''],
    available_quantity: null as number | null,
    category: 'vip',
    duration: 'day',
    display_order: 0,
    is_active: true,
  })

  // Fetch tickets
  const fetchTickets = async () => {
    if (!isAuthenticated) return
    
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (categoryFilter !== 'all') params.append('category', categoryFilter)
      if (durationFilter !== 'all') params.append('duration', durationFilter)
      if (activeFilter !== 'all') params.append('is_active', activeFilter)
      if (searchQuery) params.append('search', searchQuery)

      const response = await authFetch(`/api/admin/tickets?${params.toString()}`)

      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets)
        calculateStats(data.tickets)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const calculateStats = (ticketList: TicketType[]) => {
    const stats: TicketStats = {
      total_tickets: ticketList.length,
      active_tickets: ticketList.filter(t => t.is_active).length,
      inactive_tickets: ticketList.filter(t => !t.is_active).length,
      total_revenue_potential: ticketList
        .filter(t => t.is_active && t.available_quantity)
        .reduce((sum, t) => sum + (t.price * (t.available_quantity || 0)), 0),
      total_sold: ticketList.reduce((sum, t) => sum + t.sold_quantity, 0),
      total_available: ticketList
        .filter(t => t.available_quantity !== null)
        .reduce((sum, t) => sum + ((t.available_quantity || 0) - t.sold_quantity), 0),
    }
    setStats(stats)
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets()
    }
  }, [categoryFilter, durationFilter, activeFilter, searchQuery, isAuthenticated])

  // Handle create
  const handleCreate = async () => {
    try {
      const response = await authFetch('/api/admin/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          benefits: formData.benefits.filter(b => b.trim() !== ''),
        }),
      })

      if (response.ok) {
        await fetchTickets()
        resetForm()
        setIsAddingNew(false)
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
    }
  }

  // Handle update
  const handleUpdate = async (id: string) => {
    try {
      const ticketToUpdate = tickets.find(t => t.id === id)
      if (!ticketToUpdate) return

      const response = await authFetch('/api/admin/tickets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...formData,
          benefits: formData.benefits.filter(b => b.trim() !== ''),
        }),
      })

      if (response.ok) {
        await fetchTickets()
        setEditingId(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error updating ticket:', error)
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return

    try {
      const response = await authFetch(`/api/admin/tickets?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchTickets()
      }
    } catch (error) {
      console.error('Error deleting ticket:', error)
    }
  }

  // Toggle active status
  const toggleActive = async (ticket: TicketType) => {
    try {
      await authFetch('/api/admin/tickets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: ticket.id,
          is_active: !ticket.is_active,
        }),
      })
      await fetchTickets()
    } catch (error) {
      console.error('Error toggling ticket status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      ticket_id: '',
      name: '',
      description: '',
      price: 0,
      benefits: [''],
      available_quantity: null,
      category: 'vip',
      duration: 'day',
      display_order: 0,
      is_active: true,
    })
  }

  const startEdit = (ticket: TicketType) => {
    setEditingId(ticket.id)
    setFormData({
      ticket_id: ticket.ticket_id,
      name: ticket.name,
      description: ticket.description || '',
      price: ticket.price,
      benefits: ticket.benefits.length > 0 ? ticket.benefits : [''],
      available_quantity: ticket.available_quantity,
      category: ticket.category || 'vip',
      duration: ticket.duration || 'day',
      display_order: ticket.display_order,
      is_active: ticket.is_active,
    })
  }

  const addBenefit = () => {
    setFormData(prev => ({
      ...prev,
      benefits: [...prev.benefits, ''],
    }))
  }

  const updateBenefit = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.map((b, i) => (i === index ? value : b)),
    }))
  }

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }))
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
                Ticket Management
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage event ticket types and pricing
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isOnline && (
                <Badge variant="destructive" className="gap-1">
                  <WifiOff className="w-3 h-3" />
                  Offline
                </Badge>
              )}
              <Button onClick={() => setIsAddingNew(true)} disabled={isAddingNew}>
                <Plus className="w-4 h-4 mr-2" />
                Add Ticket
              </Button>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Tickets</CardDescription>
                  <CardTitle className="text-2xl">{stats.total_tickets}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Active</CardDescription>
                  <CardTitle className="text-2xl text-green-600">
                    {stats.active_tickets}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Inactive</CardDescription>
                  <CardTitle className="text-2xl text-gray-500">
                    {stats.inactive_tickets}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Sold</CardDescription>
                  <CardTitle className="text-2xl">{stats.total_sold}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Available</CardDescription>
                  <CardTitle className="text-2xl">{stats.total_available}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Potential Revenue</CardDescription>
                  <CardTitle className="text-2xl">
                    ₦{(stats.total_revenue_potential / 1000).toFixed(0)}k
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Search</Label>
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="early-bird">Early Bird</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration</Label>
                  <Select value={durationFilter} onValueChange={setDurationFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Durations</SelectItem>
                      <SelectItem value="1-day">1 Day</SelectItem>
                      <SelectItem value="3-day">3 Days</SelectItem>
                      <SelectItem value="full-event">Full Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={activeFilter} onValueChange={setActiveFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add New Form */}
          {isAddingNew && (
            <Card className="mb-6 border-2 border-primary">
              <CardHeader>
                <CardTitle>Create New Ticket</CardTitle>
                <CardDescription>Add a new ticket type to the event</CardDescription>
              </CardHeader>
              <CardContent>
                <TicketForm
                  formData={formData}
                  setFormData={setFormData}
                  addBenefit={addBenefit}
                  updateBenefit={updateBenefit}
                  removeBenefit={removeBenefit}
                  onSave={handleCreate}
                  onCancel={() => {
                    setIsAddingNew(false)
                    resetForm()
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Tickets List */}
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">Loading tickets...</p>
                </CardContent>
              </Card>
            ) : tickets.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Ticket className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No tickets found</p>
                </CardContent>
              </Card>
            ) : (
              tickets.map((ticket) => (
                <Card key={ticket.id}>
                  <CardContent className="pt-6">
                    {editingId === ticket.id ? (
                      <TicketForm
                        formData={formData}
                        setFormData={setFormData}
                        addBenefit={addBenefit}
                        updateBenefit={updateBenefit}
                        removeBenefit={removeBenefit}
                        onSave={() => handleUpdate(ticket.id)}
                        onCancel={() => {
                          setEditingId(null)
                          resetForm()
                        }}
                      />
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{ticket.name}</h3>
                            <Badge variant={ticket.is_active ? "default" : "secondary"}>
                              {ticket.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">{ticket.category}</Badge>
                            <Badge variant="outline">{ticket.duration}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {ticket.description}
                          </p>
                          <div className="flex items-center gap-6 text-sm">
                            <div>
                              <span className="text-muted-foreground">Price:</span>
                              <span className="ml-2 font-semibold">
                                ₦{ticket.price.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Sold:</span>
                              <span className="ml-2">{ticket.sold_quantity}</span>
                            </div>
                            {ticket.available_quantity && (
                              <div>
                                <span className="text-muted-foreground">Available:</span>
                                <span className="ml-2">
                                  {ticket.available_quantity - ticket.sold_quantity}
                                </span>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Order:</span>
                              <span className="ml-2">{ticket.display_order}</span>
                            </div>
                          </div>
                          {ticket.benefits.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-1">Benefits:</p>
                              <ul className="text-sm text-muted-foreground list-disc list-inside">
                                {ticket.benefits.map((benefit, idx) => (
                                  <li key={idx}>{benefit}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleActive(ticket)}
                            title={ticket.is_active ? "Deactivate" : "Activate"}
                          >
                            {ticket.is_active ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEdit(ticket)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(ticket.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  )
}

// Ticket Form Component
function TicketForm({
  formData,
  setFormData,
  addBenefit,
  updateBenefit,
  removeBenefit,
  onSave,
  onCancel,
}: {
  formData: any
  setFormData: (data: any) => void
  addBenefit: () => void
  updateBenefit: (index: number, value: string) => void
  removeBenefit: (index: number) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Ticket ID *</Label>
          <Input
            value={formData.ticket_id}
            onChange={(e) =>
              setFormData((prev: any) => ({ ...prev, ticket_id: e.target.value }))
            }
            placeholder="standard-day"
          />
        </div>
        <div>
          <Label>Ticket Name *</Label>
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData((prev: any) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Standard Day Pass"
          />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev: any) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Brief description of the ticket"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Price (₦) *</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData((prev: any) => ({ ...prev, price: Number(e.target.value) }))
            }
            placeholder="20000"
          />
        </div>
        <div>
          <Label>Available Quantity</Label>
          <Input
            type="number"
            value={formData.available_quantity || ''}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                available_quantity: e.target.value ? Number(e.target.value) : null,
              }))
            }
            placeholder="Leave empty for unlimited"
          />
        </div>
        <div>
          <Label>Display Order</Label>
          <Input
            type="number"
            value={formData.display_order}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                display_order: Number(e.target.value),
              }))
            }
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData((prev: any) => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="early-bird">Early Bird</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Duration</Label>
          <Select
            value={formData.duration}
            onValueChange={(value) =>
              setFormData((prev: any) => ({ ...prev, duration: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-day">1 Day</SelectItem>
              <SelectItem value="3-day">3 Days</SelectItem>
              <SelectItem value="full-event">Full Event</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Benefits</Label>
          <Button type="button" variant="outline" size="sm" onClick={addBenefit}>
            <Plus className="w-3 h-3 mr-1" />
            Add Benefit
          </Button>
        </div>
        <div className="space-y-2">
          {formData.benefits.map((benefit: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                value={benefit}
                onChange={(e) => updateBenefit(index, e.target.value)}
                placeholder="Enter benefit"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeBenefit(index)}
                disabled={formData.benefits.length === 1}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={formData.is_active}
          onCheckedChange={(checked) =>
            setFormData((prev: any) => ({ ...prev, is_active: checked }))
          }
        />
        <Label>Active (visible to public)</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={onSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Ticket
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  )
}
