"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Clock, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminNavigation } from "@/components/admin-navigation"

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic'

type ScheduleSession = {
  id: string
  day: number
  district: string
  date: string
  time: string
  title: string
  description: string
  session_type: string
  location: string
  venue: string
  speaker: string
  capacity: number
}

export default function AdminSchedulePage() {
  const [sessions, setSessions] = useState<ScheduleSession[]>([])
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingInlineId, setEditingInlineId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    day: 1,
    district: "",
    date: "",
    time: "",
    title: "",
    description: "",
    session_type: "Keynote",
    location: "",
    venue: "",
    speaker: "Speaker TBA",
    capacity: 100,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    const { data } = await supabase.from("schedule_sessions").select("*").order("day").order("time")
    if (data) setSessions(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingInlineId) {
      await supabase.from("schedule_sessions").update(formData).eq("id", editingInlineId)
    } else {
      await supabase.from("schedule_sessions").insert([formData])
    }

    resetForm()
    fetchSessions()
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this session?")) {
      await supabase.from("schedule_sessions").delete().eq("id", id)
      fetchSessions()
    }
  }

  const startEdit = (session: ScheduleSession) => {
    setEditingInlineId(session.id)
    setFormData({
      day: session.day,
      district: session.district,
      date: session.date,
      time: session.time,
      title: session.title,
      description: session.description,
      session_type: session.session_type,
      location: session.location,
      venue: session.venue,
      speaker: session.speaker,
      capacity: session.capacity,
    })
  }

  const resetForm = () => {
    setFormData({
      day: 1,
      district: "",
      date: "",
      time: "",
      title: "",
      description: "",
      session_type: "Keynote",
      location: "",
      venue: "",
      speaker: "Speaker TBA",
      capacity: 100,
    })
    setIsAddingNew(false)
    setEditingInlineId(null)
  }

  const EditForm = ({ onCancel }: { onCancel: () => void }) => (
    <form onSubmit={handleSubmit} className="space-y-4 bg-muted/50 p-4 rounded-lg border border-border mt-3">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-sm">Day *</Label>
          <Select
            value={formData.day.toString()}
            onValueChange={(value) => setFormData({ ...formData, day: Number.parseInt(value) })}
          >
            <SelectTrigger className="rounded-lg h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Day 1</SelectItem>
              <SelectItem value="2">Day 2</SelectItem>
              <SelectItem value="3">Day 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Date *</Label>
          <Input
            required
            placeholder="March 4, 2026"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="rounded-lg h-9 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Time *</Label>
          <Input
            required
            placeholder="9:00 AM - 10:30 AM"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="rounded-lg h-9 text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Title *</Label>
        <Input
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="rounded-lg h-9 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Description *</Label>
        <Textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="rounded-lg text-sm"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm">District / Zone *</Label>
          <Input
            required
            placeholder="Arts, Sculpture & Design"
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            className="rounded-lg h-9 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Session Type *</Label>
          <Select
            value={formData.session_type}
            onValueChange={(value) => setFormData({ ...formData, session_type: value })}
          >
            <SelectTrigger className="rounded-lg h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Keynote">Keynote</SelectItem>
              <SelectItem value="Panel">Panel</SelectItem>
              <SelectItem value="Workshop">Workshop</SelectItem>
              <SelectItem value="Masterclass">Masterclass</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm">Venue *</Label>
          <Input
            required
            placeholder="Federal Palace Hotel"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            className="rounded-lg h-9 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Location *</Label>
          <Input
            required
            placeholder="Federal Palace Hotel - Main Hall"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="rounded-lg h-9 text-sm"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm">Speaker *</Label>
          <Input
            required
            placeholder="Speaker TBA"
            value={formData.speaker}
            onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
            className="rounded-lg h-9 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Capacity *</Label>
          <Input
            required
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: Number.parseInt(e.target.value) })}
            className="rounded-lg h-9 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="rounded-lg" size="sm">
          Update Session
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-lg bg-transparent" size="sm">
          Cancel
        </Button>
      </div>
    </form>
  )

  const sessionsByDay = [1, 2, 3].map((day) => ({
    day,
    sessions: sessions.filter((s) => s.day === day),
  }))

  return (
    <>
      <AdminNavigation />
      <main className="min-h-screen py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Manage Schedule</h1>
                <p className="text-sm text-muted-foreground">Add, edit, or remove event sessions</p>
              </div>
              <Button onClick={() => setIsAddingNew(true)} className="rounded-lg" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Session
              </Button>
            </div>
          </div>

          {isAddingNew && (
            <div className="bg-muted/30 border border-border rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Add New Session</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Day *</Label>
                    <Select
                      value={formData.day.toString()}
                      onValueChange={(value) => setFormData({ ...formData, day: Number.parseInt(value) })}
                    >
                      <SelectTrigger className="rounded-lg h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Day 1</SelectItem>
                        <SelectItem value="2">Day 2</SelectItem>
                        <SelectItem value="3">Day 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Date *</Label>
                    <Input
                      required
                      placeholder="March 4, 2026"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="rounded-lg h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Time *</Label>
                    <Input
                      required
                      placeholder="9:00 AM - 10:30 AM"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="rounded-lg h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Title *</Label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="rounded-lg h-9 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Description *</Label>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="rounded-lg text-sm"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">District / Zone *</Label>
                    <Input
                      required
                      placeholder="Arts, Sculpture & Design"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="rounded-lg h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Session Type *</Label>
                    <Select
                      value={formData.session_type}
                      onValueChange={(value) => setFormData({ ...formData, session_type: value })}
                    >
                      <SelectTrigger className="rounded-lg h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Keynote">Keynote</SelectItem>
                        <SelectItem value="Panel">Panel</SelectItem>
                        <SelectItem value="Workshop">Workshop</SelectItem>
                        <SelectItem value="Masterclass">Masterclass</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Venue *</Label>
                    <Input
                      required
                      placeholder="Federal Palace Hotel"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      className="rounded-lg h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Location *</Label>
                    <Input
                      required
                      placeholder="Federal Palace Hotel - Main Hall"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="rounded-lg h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Speaker *</Label>
                    <Input
                      required
                      placeholder="Speaker TBA"
                      value={formData.speaker}
                      onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                      className="rounded-lg h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Capacity *</Label>
                    <Input
                      required
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: Number.parseInt(e.target.value) })}
                      className="rounded-lg h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="rounded-lg" size="sm">
                    Add Session
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="rounded-lg bg-transparent"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-8">
            {sessionsByDay.map(({ day, sessions: daySessions }) => (
              <div key={day}>
                <h2 className="text-xl font-bold mb-4">Day {day}</h2>
                {daySessions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No sessions for this day yet.</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {daySessions.map((session) => (
                      <div key={session.id} className="bg-background border border-border rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${
                              session.session_type === "Keynote"
                                ? "bg-accent-blue/10 text-accent-blue"
                                : session.session_type === "Panel"
                                  ? "bg-accent-green/10 text-accent-green"
                                  : session.session_type === "Workshop"
                                    ? "bg-purple-500/10 text-purple-700"
                                    : "bg-accent-red/10 text-accent-red"
                            }`}
                          >
                            {session.session_type}
                          </span>
                        </div>

                        <h3 className="font-bold text-base mb-2 line-clamp-2">{session.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{session.description}</p>

                        <div className="flex items-center gap-2 mb-2 text-xs">
                          <Clock className="w-3.5 h-3.5 text-neutral-500" />
                          <span className="font-medium">{session.time}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-3 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                          <span className="text-muted-foreground">{session.location}</span>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(session)}
                            className="flex-1 rounded-lg text-xs h-8"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(session.id)}
                            className="rounded-lg text-destructive hover:text-destructive text-xs h-8"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        {editingInlineId === session.id && <EditForm onCancel={resetForm} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
