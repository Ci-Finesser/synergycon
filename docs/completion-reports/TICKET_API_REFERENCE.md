# Ticket Management API - Quick Reference

## Public Endpoints

### Get Active Tickets
**GET** `/api/tickets`

**Description**: Retrieve all active tickets available for public registration

**Auth**: None required

**Response**:
```json
{
  "success": true,
  "tickets": [
    {
      "id": "uuid",
      "ticket_id": "standard-day",
      "name": "Standard Day Pass",
      "description": "For 1 day only",
      "price": 20000,
      "benefits": ["Day-specific sessions", "Exhibition access"],
      "available_quantity": 500,
      "sold_quantity": 120,
      "category": "standard",
      "duration": "1-day",
      "display_order": 1,
      "is_available": true
    }
  ]
}
```

---

## Admin Endpoints

### List All Tickets
**GET** `/api/admin/tickets`

**Auth**: Bearer Token required

**Query Parameters**:
- `category` - Filter by category (standard, vip, early-bird)
- `duration` - Filter by duration (1-day, 3-day, full-event)
- `is_active` - Filter by status (true/false)
- `search` - Text search in name and description

**Example**:
```
GET /api/admin/tickets?category=vip&is_active=true
```

**Response**:
```json
{
  "success": true,
  "tickets": [...],
  "total": 4
}
```

---

### Create Ticket
**POST** `/api/admin/tickets`

**Auth**: Bearer Token required

**Request Body**:
```json
{
  "ticket_id": "early-bird-vip",
  "name": "Early Bird VIP Pass",
  "description": "Limited time VIP offer",
  "price": 120000,
  "benefits": ["VIP lounge", "Priority seating", "Meet & greet"],
  "available_quantity": 50,
  "category": "vip",
  "duration": "3-day",
  "display_order": 1
}
```

**Response**:
```json
{
  "success": true,
  "ticket": {
    "id": "uuid",
    "ticket_id": "early-bird-vip",
    "name": "Early Bird VIP Pass",
    ...
  }
}
```

---

### Update Ticket
**PATCH** `/api/admin/tickets`

**Auth**: Bearer Token required

**Request Body**:
```json
{
  "id": "ticket-uuid",
  "price": 150000,
  "available_quantity": 75,
  "is_active": true
}
```

**Response**:
```json
{
  "success": true,
  "ticket": {
    "id": "ticket-uuid",
    ...
  }
}
```

---

### Delete Ticket
**DELETE** `/api/admin/tickets?id={uuid}`

**Auth**: Bearer Token required

**Query Parameters**:
- `id` - UUID of ticket to delete

**Response**:
```json
{
  "success": true
}
```

---

### Get Statistics
**GET** `/api/admin/tickets/stats`

**Auth**: Bearer Token required

**Response**:
```json
{
  "success": true,
  "stats": {
    "total_tickets": 6,
    "active_tickets": 4,
    "inactive_tickets": 2,
    "total_revenue_potential": 15000000,
    "total_sold": 450,
    "total_available": 1050
  }
}
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common Status Codes**:
- `200` - Success
- `400` - Bad Request (missing/invalid data)
- `401` - Unauthorized (missing/invalid token)
- `500` - Internal Server Error

---

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get public tickets
const tickets = await fetch('/api/tickets')
  .then(res => res.json())

// Create ticket (admin)
const newTicket = await fetch('/api/admin/tickets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    ticket_id: 'weekend-pass',
    name: 'Weekend Pass',
    price: 80000,
  }),
}).then(res => res.json())

// Update ticket (admin)
const updated = await fetch('/api/admin/tickets', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    id: ticketId,
    price: 90000,
  }),
}).then(res => res.json())

// Delete ticket (admin)
await fetch(`/api/admin/tickets?id=${ticketId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
  },
})

// Get stats (admin)
const stats = await fetch('/api/admin/tickets/stats', {
  headers: {
    'Authorization': `Bearer ${adminToken}`,
  },
}).then(res => res.json())
```

### cURL

```bash
# Get public tickets
curl https://yoursite.com/api/tickets

# Create ticket (admin)
curl -X POST https://yoursite.com/api/admin/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_id": "vip-3day",
    "name": "VIP 3-Day Pass",
    "price": 150000
  }'

# Update ticket (admin)
curl -X PATCH https://yoursite.com/api/admin/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "uuid-here",
    "is_active": false
  }'

# Delete ticket (admin)
curl -X DELETE "https://yoursite.com/api/admin/tickets?id=uuid-here" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get statistics (admin)
curl https://yoursite.com/api/admin/tickets/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Field Validation

### Required Fields (Create)
- `ticket_id` - Unique identifier (string)
- `name` - Display name (string)
- `price` - Price in Naira (number, >= 0)

### Optional Fields
- `description` - Ticket description (string)
- `benefits` - Array of benefit strings
- `available_quantity` - Stock limit (number, null = unlimited)
- `category` - Ticket category (string)
- `duration` - Event duration (string)
- `display_order` - Sort order (number, default 0)
- `valid_from` - Start date (ISO 8601 string)
- `valid_until` - End date (ISO 8601 string)

### Update Fields
All fields optional (only provided fields will be updated)

---

## Best Practices

1. **Always check `success` field** before accessing data
2. **Handle errors gracefully** with user-friendly messages
3. **Cache public tickets** to reduce API calls
4. **Use filters** to reduce response size
5. **Store admin token securely** (never in client-side code)
6. **Validate input** before sending to API
7. **Handle offline scenarios** using Zustand stores
8. **Log security events** for audit trails

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding for production:
- Public endpoints: 100 requests/minute per IP
- Admin endpoints: 1000 requests/minute per token

---

## Support

For API issues:
- Check browser console for detailed errors
- Verify authentication token is valid
- Ensure request body matches expected format
- Check Supabase dashboard for database issues
