# Ticket Management System - Complete Implementation

## Overview
Comprehensive ticket management system for SynergyCon 2.0 with QR codes, team management, validation, transfers, and email delivery.

## Features Implemented

### 1. Ticket Management
- **User Tickets**: View all purchased tickets with filtering
- **Ticket Details**: Get individual ticket information
- **Ticket Updates**: Modify attendee details (before validation)
- **Status Tracking**: Active, Used, Cancelled, Expired states
- **QR Code Generation**: Unique QR codes for each ticket
- **Metadata Storage**: JSONB field for custom ticket data

### 2. Team Management (Enterprise)
- **Team Members**: Manage team member invitations
- **Ticket Assignment**: Assign tickets to specific team members
- **Bulk Purchase**: Purchase multiple tickets for team
- **Status Tracking**: Pending, Sent, Accepted states
- **Email Notifications**: Automatic notifications on assignment

### 3. Ticket Operations
- **Download**: Generate HTML tickets (PDF-ready)
- **Email**: Send tickets via Resend email service
- **Validate**: Check-in tickets with admin verification
- **Transfer**: Transfer ticket ownership between users
- **QR Code Refresh**: Regenerate QR codes as needed
- **Cancel**: Mark tickets as cancelled

### 4. Security & Validation
- **Row Level Security**: Users only see their own tickets
- **Admin Access**: Special permissions for validation
- **Transfer Tracking**: Complete audit trail
- **Duplicate Prevention**: Unique ticket numbers and QR codes
- **Validation Status**: Track checked-in tickets

## File Structure

```
app/
└── api/
    ├── user/
    │   └── tickets/
    │       └── route.ts                           # GET user tickets
    └── tickets/
        ├── [id]/
        │   ├── route.ts                           # GET/PATCH single ticket
        │   ├── download/
        │   │   └── route.ts                       # GET ticket download (HTML)
        │   ├── email/
        │   │   └── route.ts                       # POST send ticket email
        │   ├── validate/
        │   │   └── route.ts                       # POST validate ticket (check-in)
        │   ├── transfer/
        │   │   └── route.ts                       # POST transfer ticket
        │   └── qr/
        │       └── route.ts                       # GET QR code generation
        ├── assign/
        │   └── route.ts                           # POST assign to team member
        └── purchase-team/
            └── route.ts                           # POST bulk team purchase

lib/
└── stores/
    └── tickets-store.ts                           # Enhanced Zustand store

supabase/
└── migrations/
    └── 20260103140000_create_tickets_table.sql    # Database schema
```

## Database Schema

### tickets
```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY,
  order_id TEXT NOT NULL,                    -- Links to payment order
  user_id UUID REFERENCES auth.users,        -- Ticket owner
  ticket_type TEXT NOT NULL,                 -- early_bird, regular, vip, enterprise
  status TEXT NOT NULL,                      -- active, used, cancelled, expired
  qr_code TEXT UNIQUE,                       -- QR code data string
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  purchase_date TIMESTAMPTZ,
  event_date TEXT NOT NULL,
  seat_number TEXT,
  metadata JSONB,
  ticket_number TEXT UNIQUE NOT NULL,        -- e.g., SYN2-ABC123
  price NUMERIC(10, 2) NOT NULL,
  validated_at TIMESTAMPTZ,                  -- When checked in
  validated_by UUID REFERENCES admin_users,
  transferred_from UUID REFERENCES auth.users,
  transferred_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### team_members
```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,        -- Enterprise purchaser
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  ticket_id UUID REFERENCES tickets,         -- Assigned ticket
  status TEXT NOT NULL,                      -- pending, sent, accepted
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### ticket_transfers
```sql
CREATE TABLE ticket_transfers (
  id UUID PRIMARY KEY,
  ticket_id UUID REFERENCES tickets,
  from_user_id UUID REFERENCES auth.users,
  to_user_id UUID REFERENCES auth.users,
  transferred_at TIMESTAMPTZ,
  reason TEXT,
  created_at TIMESTAMPTZ
);
```

## API Endpoints

### User Tickets

#### Get All User Tickets
```typescript
GET /api/user/tickets?status=active&orderBy=purchase_date&order=desc

Query Parameters:
- status: Filter by status (all|active|used|cancelled|expired)
- orderBy: Sort field (purchase_date|event_date|ticket_type)
- order: Sort order (asc|desc)

Response:
{
  "success": true,
  "tickets": [
    {
      "id": "uuid",
      "order_id": "SYN2-ORDER123",
      "user_id": "uuid",
      "ticket_type": "vip",
      "status": "active",
      "qr_code": "TICKET:SYN2-ABC123:user@example.com",
      "attendee_name": "John Doe",
      "attendee_email": "john@example.com",
      "purchase_date": "2026-01-03T10:00:00Z",
      "event_date": "March 20-22, 2026",
      "ticket_number": "SYN2-ABC123",
      "price": 150000,
      "metadata": {}
    }
  ]
}
```

#### Get Single Ticket
```typescript
GET /api/tickets/{id}

Response:
{
  "success": true,
  "ticket": { /* ticket object */ }
}
```

#### Update Ticket
```typescript
PATCH /api/tickets/{id}

Body:
{
  "status": "cancelled",
  "attendee_name": "New Name",
  "attendee_email": "new@example.com"
}

Response:
{
  "success": true,
  "ticket": { /* updated ticket */ }
}
```

### Ticket Operations

#### Download Ticket
```typescript
GET /api/tickets/{id}/download

Returns: HTML file for ticket (can be saved or printed as PDF)
```

#### Email Ticket
```typescript
POST /api/tickets/{id}/email

Response:
{
  "success": true,
  "message": "Ticket emailed successfully",
  "emailId": "resend_email_id"
}
```

#### Validate Ticket (Admin Only)
```typescript
POST /api/tickets/{id}/validate

Body:
{
  "location": "Main Entrance",
  "notes": "Checked in at 9:00 AM"
}

Response:
{
  "success": true,
  "message": "Ticket validated successfully",
  "ticket": { /* validated ticket with validated_at timestamp */ }
}
```

#### Transfer Ticket
```typescript
POST /api/tickets/{id}/transfer

Body:
{
  "to_email": "recipient@example.com",
  "reason": "Cannot attend, giving to colleague"
}

Response:
{
  "success": true,
  "message": "Ticket transferred successfully",
  "ticket": { /* transferred ticket with new user_id */ }
}
```

#### Get/Refresh QR Code
```typescript
GET /api/tickets/{id}/qr?format=json

Query Parameters:
- format: Response format (json|image)

Response (json):
{
  "success": true,
  "qr_code": "TICKET:SYN2-ABC123:...",
  "qr_image": "data:image/png;base64,...",
  "ticket_number": "SYN2-ABC123"
}

Response (image):
Content-Type: image/png
(PNG image binary data)
```

### Team Management

#### Assign Ticket to Team Member
```typescript
POST /api/tickets/assign

Body:
{
  "memberId": "uuid",
  "ticketId": "uuid"
}

Response:
{
  "success": true,
  "member": { /* updated team member with ticket_id */ }
}
```

#### Purchase Team Tickets
```typescript
POST /api/tickets/purchase-team

Body:
{
  "members": [
    { "name": "John Doe", "email": "john@example.com" },
    { "name": "Jane Smith", "email": "jane@example.com" }
  ],
  "ticket_type": "enterprise",
  "order_id": "SYN2-ORDER123"
}

Response:
{
  "success": true,
  "message": "Successfully created 2 tickets",
  "tickets": [ /* created tickets */ ],
  "teamMembers": [ /* created team members */ ]
}
```

## Zustand Store Usage

### Initialize and Fetch Tickets
```typescript
import { useTicketsStore } from '@/lib/stores/tickets-store'

function MyComponent() {
  const { tickets, fetchTickets, isLoadingTickets } = useTicketsStore()

  useEffect(() => {
    fetchTickets()
  }, [])

  return (
    <div>
      {isLoadingTickets ? 'Loading...' : tickets.map(ticket => (
        <div key={ticket.id}>{ticket.ticket_number}</div>
      ))}
    </div>
  )
}
```

### Filter Tickets
```typescript
const { setFilterStatus, filterStatus } = useTicketsStore()

// Set filter
setFilterStatus('active') // Only show active tickets

// Fetch with current filter
fetchTickets() // Uses current filterStatus
```

### Download Ticket
```typescript
const { downloadTicket } = useTicketsStore()

async function handleDownload(ticketId: string) {
  try {
    await downloadTicket(ticketId)
    toast({ title: 'Ticket downloaded!' })
  } catch (error) {
    toast({ title: 'Download failed', variant: 'destructive' })
  }
}
```

### Email Ticket
```typescript
const { emailTicket } = useTicketsStore()

async function handleEmail(ticketId: string) {
  try {
    await emailTicket(ticketId)
    toast({ title: 'Ticket sent to email!' })
  } catch (error) {
    toast({ title: 'Email failed', variant: 'destructive' })
  }
}
```

### Transfer Ticket
```typescript
const { transferTicket } = useTicketsStore()

async function handleTransfer() {
  try {
    await transferTicket(ticketId, recipientEmail, 'Cannot attend')
    toast({ title: 'Ticket transferred successfully!' })
  } catch (error) {
    toast({ title: error.message, variant: 'destructive' })
  }
}
```

### Refresh QR Code
```typescript
const { refreshQRCode } = useTicketsStore()

async function handleRefreshQR(ticketId: string) {
  try {
    const qrImage = await refreshQRCode(ticketId)
    // qrImage is a data URL you can display in <img src={qrImage} />
    toast({ title: 'QR code refreshed!' })
  } catch (error) {
    toast({ title: 'QR refresh failed', variant: 'destructive' })
  }
}
```

### Team Management
```typescript
const { 
  teamMembers, 
  addTeamMember, 
  assignTicket, 
  purchaseTicketsForTeam 
} = useTicketsStore()

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
  { id: uuid(), name: 'John', email: 'john@example.com', status: 'pending' }
])
```

## Security Features

### Row Level Security (RLS)
- Users can only view and modify their own tickets
- Admins have full access for validation
- Transfer tracking maintains audit trail

### Validation Rules
- Tickets must be 'active' to be validated
- Cannot validate already used tickets
- Cannot transfer validated tickets
- Cannot update ticket details after validation

### Admin Permissions
Validation endpoints require admin role:
```sql
EXISTS (
  SELECT 1 FROM admin_users
  WHERE admin_users.id = auth.uid()
)
```

## Email Integration

Uses Resend for ticket delivery:

```typescript
await resend.emails.send({
  from: 'SynergyCon <tickets@synergycon.live>',
  to: ticket.attendee_email,
  subject: `Your SynergyCon 2.0 Ticket - ${ticket.ticket_number}`,
  html: emailHtml,
})
```

Email includes:
- QR code image
- Ticket number
- Attendee details
- Event information
- Instructions for check-in

## QR Code Format

QR codes encode ticket information:
```
TICKET:{ticket_number}:{attendee_email}:{event_date}:{timestamp}
```

Generated using database function:
```sql
CREATE FUNCTION generate_ticket_qr_data(ticket_id UUID)
```

Can be refreshed at any time via `/api/tickets/{id}/qr`

## Error Handling

All endpoints return consistent error format:
```json
{
  "error": "Error message",
  "ticket": { /* optional, for context */ }
}
```

Common error codes:
- `401`: Unauthorized (no user session)
- `403`: Forbidden (insufficient permissions)
- `404`: Ticket/resource not found
- `400`: Invalid request (ticket cannot be operated on)
- `500`: Server error

## Testing Checklist

- [ ] Fetch user tickets with filters
- [ ] Get single ticket details
- [ ] Update ticket attendee info
- [ ] Download ticket as HTML
- [ ] Email ticket to attendee
- [ ] Validate ticket (admin only)
- [ ] Transfer ticket to another user
- [ ] Generate/refresh QR code
- [ ] Cancel ticket
- [ ] Add team members
- [ ] Assign tickets to team
- [ ] Purchase tickets for team
- [ ] RLS policies working correctly
- [ ] Cannot validate used tickets
- [ ] Cannot transfer validated tickets
- [ ] Email notifications sent
- [ ] QR codes scannable

## Installation

1. **Run migration**
```bash
pnpm migrate
```

2. **Configure Resend**
Add to `.env.local`:
```
RESEND_API_KEY=re_...
```

3. **Use the store**
```typescript
import { useTicketsStore } from '@/lib/stores/tickets-store'
```

## Future Enhancements

- [ ] PDF generation via puppeteer
- [ ] Bulk ticket operations
- [ ] Ticket refunds with payment integration
- [ ] Mobile app for QR scanning
- [ ] Real-time validation dashboard
- [ ] Analytics and reporting
- [ ] Ticket waitlist management
- [ ] Seat selection for venues
- [ ] Group booking discounts
- [ ] Ticket resale marketplace

## Support

For issues:
1. Check database migrations applied
2. Verify RLS policies active
3. Check authentication tokens
4. Review server logs for errors
5. Ensure Resend API key configured

## License
Part of SynergyCon 2.0 platform - All rights reserved.
