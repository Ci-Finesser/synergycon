# Ticket System - Quick Reference Guide

## 🎫 Store Methods

### Fetch & Display
```typescript
const { tickets, fetchTickets, isLoadingTickets } = useTicketsStore()

// Fetch tickets
await fetchTickets()

// Filter tickets
setFilterStatus('active') // 'all' | 'active' | 'used' | 'cancelled' | 'expired'
```

### Ticket Operations
```typescript
// Download ticket (HTML)
await downloadTicket(ticketId)

// Email ticket
await emailTicket(ticketId)

// Transfer ticket
await transferTicket(ticketId, 'recipient@example.com', 'reason')

// Validate ticket (Admin only)
await validateTicket(ticketId, 'Main Entrance', 'Check-in notes')

// Refresh QR code
const qrImage = await refreshQRCode(ticketId)

// Cancel ticket
await cancelTicket(ticketId)
```

### Team Management
```typescript
// Add team member
addTeamMember({
  id: uuid(),
  name: 'John Doe',
  email: 'john@example.com',
  status: 'pending'
})

// Assign ticket
await assignTicket(memberId, ticketId)

// Purchase for team
await purchaseTicketsForTeam([
  { id, name, email, status: 'pending' }
])
```

## 🔌 API Endpoints

### User Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/tickets?status=active` | Fetch user's tickets |
| GET | `/api/tickets/{id}` | Get single ticket |
| PATCH | `/api/tickets/{id}` | Update ticket |

### Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets/{id}/download` | Download HTML |
| POST | `/api/tickets/{id}/email` | Email ticket |
| POST | `/api/tickets/{id}/validate` | Check-in (admin) |
| POST | `/api/tickets/{id}/transfer` | Transfer ownership |
| GET | `/api/tickets/{id}/qr?format=json` | Get QR code |

### Team
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tickets/assign` | Assign to member |
| POST | `/api/tickets/purchase-team` | Bulk purchase |

## 📋 Ticket Object

```typescript
interface Ticket {
  id: string
  order_id: string
  user_id: string
  ticket_type: 'early_bird' | 'regular' | 'vip' | 'enterprise'
  status: 'active' | 'used' | 'cancelled' | 'expired'
  qr_code?: string
  attendee_name: string
  attendee_email: string
  purchase_date: Date
  event_date: string
  seat_number?: string
  ticket_number: string
  price: number
  validated_at?: Date
  validated_by?: string
  transferred_from?: string
  transferred_at?: Date
  metadata?: Record<string, any>
}
```

## 🗄️ Database Tables

### tickets
- Primary ticket records
- RLS: Users see only their tickets
- Admins have full access

### team_members
- Enterprise team management
- Links tickets to team members
- Status: pending, sent, accepted

### ticket_transfers
- Audit trail for transfers
- Tracks from/to users
- Includes reason field

## 🔒 Security Rules

### User Permissions
✅ View own tickets  
✅ Update own non-validated tickets  
✅ Transfer own active tickets  
❌ Validate tickets (admin only)

### Admin Permissions
✅ View all tickets  
✅ Validate any ticket  
✅ Full ticket management  

### Validation Rules
- Ticket must be 'active'
- Cannot validate twice
- Cannot transfer validated tickets
- Cannot update after validation

## 📧 Email Configuration

Required environment variable:
```bash
RESEND_API_KEY=re_your_key_here
```

Email features:
- Ticket delivery with QR code
- Transfer notifications
- Team member invitations

## 🔍 QR Code Format

```
TICKET:{ticket_number}:{email}:{event_date}:{timestamp}
```

Endpoints:
- `GET /api/tickets/{id}/qr?format=json` - Data URL
- `GET /api/tickets/{id}/qr?format=image` - PNG image

## ⚡ Quick Examples

### Display Tickets
```tsx
function TicketsList() {
  const { tickets, fetchTickets, isLoadingTickets } = useTicketsStore()

  useEffect(() => {
    fetchTickets()
  }, [])

  if (isLoadingTickets) return <Spinner />

  return (
    <div>
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  )
}
```

### Download Button
```tsx
function DownloadButton({ ticketId }: { ticketId: string }) {
  const { downloadTicket } = useTicketsStore()
  const { toast } = useToast()

  const handleDownload = async () => {
    try {
      await downloadTicket(ticketId)
      toast({ title: 'Downloaded!' })
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  return <Button onClick={handleDownload}>Download</Button>
}
```

### Transfer Dialog
```tsx
function TransferDialog({ ticket }: { ticket: Ticket }) {
  const { transferTicket } = useTicketsStore()
  const [email, setEmail] = useState('')

  const handleTransfer = async () => {
    try {
      await transferTicket(ticket.id, email, 'Transfer reason')
      toast({ title: 'Transferred successfully!' })
    } catch (error) {
      toast({ title: error.message, variant: 'destructive' })
    }
  }

  return (
    <Dialog>
      <Input value={email} onChange={e => setEmail(e.target.value)} />
      <Button onClick={handleTransfer}>Transfer</Button>
    </Dialog>
  )
}
```

### QR Code Display
```tsx
function QRCodeDisplay({ ticketId }: { ticketId: string }) {
  const { refreshQRCode } = useTicketsStore()
  const [qrImage, setQrImage] = useState('')

  const loadQR = async () => {
    const image = await refreshQRCode(ticketId)
    setQrImage(image)
  }

  useEffect(() => {
    loadQR()
  }, [ticketId])

  return <img src={qrImage} alt="QR Code" />
}
```

### Admin Validation
```tsx
function ValidateButton({ ticketId }: { ticketId: string }) {
  const { validateTicket } = useTicketsStore()

  const handleValidate = async () => {
    try {
      await validateTicket(ticketId, 'Main Entrance', 'Scanned at 9:00 AM')
      toast({ title: 'Ticket validated!' })
    } catch (error) {
      toast({ title: error.message, variant: 'destructive' })
    }
  }

  return <Button onClick={handleValidate}>Check In</Button>
}
```

## 🚀 Setup

1. **Run migration**
   ```bash
   pnpm migrate
   ```

2. **Add Resend key**
   ```bash
   # .env.local
   RESEND_API_KEY=re_...
   ```

3. **Import store**
   ```typescript
   import { useTicketsStore } from '@/lib/stores/tickets-store'
   ```

## 🐛 Common Issues

### "Ticket not found"
- Verify user owns ticket
- Check ticket ID is correct
- Ensure RLS policies applied

### "Cannot transfer ticket"
- Ticket must be 'active'
- Cannot transfer validated tickets
- Recipient must be registered

### "Validation failed"
- Admin permissions required
- Ticket already validated
- Check ticket status

### Email not sending
- Verify RESEND_API_KEY set
- Check email address valid
- Review server logs

## 📊 Status Flow

```
Purchase → active
  ↓
active → validated (check-in)
  ↓
validated → used

active → cancelled (user)
active → expired (auto)
```

## 💡 Pro Tips

1. **Filter before fetching**
   ```typescript
   setFilterStatus('active')
   await fetchTickets() // Uses filter
   ```

2. **Batch operations**
   ```typescript
   await Promise.all(
     ticketIds.map(id => emailTicket(id))
   )
   ```

3. **Error handling**
   ```typescript
   try {
     await transferTicket(id, email)
   } catch (error) {
     if (error.message.includes('validated')) {
       // Show specific error
     }
   }
   ```

4. **Optimistic updates**
   ```typescript
   updateTicket(id, { status: 'cancelled' })
   cancelTicket(id).catch(() => {
     updateTicket(id, { status: 'active' }) // Revert
   })
   ```

## 📚 Related Docs

- [TICKET_SYSTEM_COMPLETE.md](./TICKET_SYSTEM_COMPLETE.md) - Full documentation
- [TICKET_VALIDATION_QUICK_REFERENCE.md](./TICKET_VALIDATION_QUICK_REFERENCE.md) - Validation guide
- [Project_Architecture_Blueprint.md](./Project_Architecture_Blueprint.md) - System architecture

---

**Need Help?** Check the complete documentation or server logs for detailed error messages.
