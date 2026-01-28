import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TicketsState, StoreTicket, TeamMember } from '@/types/stores'

// Re-export for backward compatibility
export type { StoreTicket as Ticket, TeamMember }
export type TicketType = 'early_bird' | 'regular' | 'vip' | 'enterprise'
export type { TicketsState }

export const useTicketsStore = create<TicketsState>()(
  persist(
    (set, get) => ({
      tickets: [],
      selectedTicket: null,
      isLoadingTickets: false,
      teamMembers: [],
      isLoadingTeam: false,
      filterStatus: 'all',

      setTickets: (tickets) => set({ tickets }),

      addTicket: (ticket) =>
        set((state) => ({
          tickets: [...state.tickets, ticket]
        })),

      updateTicket: (ticketId, updates) =>
        set((state) => ({
          tickets: state.tickets.map(t =>
            t.id === ticketId ? { ...t, ...updates } : t
          )
        })),

      selectTicket: (ticket) => set({ selectedTicket: ticket }),

      setLoadingTickets: (loading) => set({ isLoadingTickets: loading }),

      setTeamMembers: (members) => set({ teamMembers: members }),

      addTeamMember: (member) =>
        set((state) => ({
          teamMembers: [...state.teamMembers, member]
        })),

      removeTeamMember: (memberId) =>
        set((state) => ({
          teamMembers: state.teamMembers.filter(m => m.id !== memberId)
        })),

      assignTicket: async (memberId, ticketId) => {
        try {
          const res = await fetch('/api/tickets/assign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId, ticketId }),
          })

          if (!res.ok) throw new Error('Failed to assign ticket')

          set((state) => ({
            teamMembers: state.teamMembers.map(m =>
              m.id === memberId ? { ...m, ticket_id: ticketId, status: 'sent' } : m
            )
          }))
        } catch (error) {
          console.error('Assign ticket error:', error)
          throw error
        }
      },

      setLoadingTeam: (loading) => set({ isLoadingTeam: loading }),

      setFilterStatus: (status) => set({ filterStatus: status }),

      fetchTickets: async () => {
        set({ isLoadingTickets: true })
        
        try {
          const filterStatus = get().filterStatus
          const statusParam = filterStatus !== 'all' ? `?status=${filterStatus}` : ''
          const res = await fetch(`/api/user/tickets${statusParam}`)
          const data = await res.json()
          
          if (data.success) {
            set({ tickets: data.tickets })
          }
        } catch (error) {
          console.error('Fetch tickets error:', error)
        } finally {
          set({ isLoadingTickets: false })
        }
      },

      downloadTicket: async (ticketId) => {
        try {
          const res = await fetch(`/api/tickets/${ticketId}/download`)
          const blob = await res.blob()
          
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `ticket-${ticketId}.pdf`
          a.click()
          window.URL.revokeObjectURL(url)
        } catch (error) {
          console.error('Download ticket error:', error)
          throw error
        }
      },

      emailTicket: async (ticketId) => {
        try {
          const res = await fetch(`/api/tickets/${ticketId}/email`, {
            method: 'POST',
          })
          
          if (!res.ok) throw new Error('Failed to email ticket')
        } catch (error) {
          console.error('Email ticket error:', error)
          throw error
        }
      },

      generateQRCode: async (ticketId) => {
        try {
          const res = await fetch(`/api/tickets/${ticketId}/qr`)
          
          if (!res.ok) throw new Error('Failed to generate QR code')
          
          const data = await res.json()
          return data.qr_image || data.qr_code
        } catch (error) {
          console.error('Generate QR code error:', error)
          throw error
        }
      },

      purchaseTicketsForTeam: async (members) => {
        set({ isLoadingTeam: true })
        
        try {
          const res = await fetch('/api/tickets/purchase-team', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ members }),
          })
          
          if (!res.ok) throw new Error('Failed to purchase team tickets')
          
          const data = await res.json()
          set({ teamMembers: data.teamMembers })
          
          // Refresh tickets
          await get().fetchTickets()
        } catch (error) {
          console.error('Purchase team tickets error:', error)
          throw error
        } finally {
          set({ isLoadingTeam: false })
        }
      },

      validateTicket: async (ticketId, location, notes) => {
        try {
          const res = await fetch(`/api/tickets/${ticketId}/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location, notes }),
          })
          
          if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || 'Failed to validate ticket')
          }

          const data = await res.json()
          
          // Update ticket in store
          set((state) => ({
            tickets: state.tickets.map(t =>
              t.id === ticketId ? { ...t, ...data.ticket } : t
            )
          }))
        } catch (error) {
          console.error('Validate ticket error:', error)
          throw error
        }
      },

      transferTicket: async (ticketId, toEmail, reason) => {
        try {
          const res = await fetch(`/api/tickets/${ticketId}/transfer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to_email: toEmail, reason }),
          })
          
          if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || 'Failed to transfer ticket')
          }

          // Remove transferred ticket from store
          set((state) => ({
            tickets: state.tickets.filter(t => t.id !== ticketId)
          }))
        } catch (error) {
          console.error('Transfer ticket error:', error)
          throw error
        }
      },

      refreshQRCode: async (ticketId) => {
        try {
          const res = await fetch(`/api/tickets/${ticketId}/qr`)
          
          if (!res.ok) throw new Error('Failed to refresh QR code')
          
          const data = await res.json()
          
          // Update ticket QR code in store
          set((state) => ({
            tickets: state.tickets.map(t =>
              t.id === ticketId ? { ...t, qr_code: data.qr_code } : t
            )
          }))

          return data.qr_image
        } catch (error) {
          console.error('Refresh QR code error:', error)
          throw error
        }
      },

      cancelTicket: async (ticketId) => {
        try {
          const res = await fetch(`/api/tickets/${ticketId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'cancelled' }),
          })
          
          if (!res.ok) throw new Error('Failed to cancel ticket')
          
          const data = await res.json()
          
          // Update ticket in store
          set((state) => ({
            tickets: state.tickets.map(t =>
              t.id === ticketId ? { ...t, ...data.ticket } : t
            )
          }))
        } catch (error) {
          console.error('Cancel ticket error:', error)
          throw error
        }
      },
    }),
    {
      name: 'tickets-storage',
      partialize: (state) => ({
        filterStatus: state.filterStatus,
      }),
    }
  )
)
