# Ticket Validation - Quick Reference

## 🎫 Overview
Admin system for validating and checking in attendee tickets at event entry points.

---

## 🚀 Quick Start

### Access the Validation Interface
1. Navigate to `/admin/validate-tickets`
2. Or click "Validate" in admin navigation
3. Or click "Validate Tickets" card on admin dashboard

### Validate a Ticket
1. Enter ticket number (e.g., `SYN2-ORDER123-T001`)
2. Press **Enter** or click **Search** to check status
3. Review ticket info (name, email, type, validation status)
4. Optionally add location and notes
5. Click **Validate & Check-In** button
6. ✅ Success! Ticket validated

---

## 📊 Statistics Overview

### Real-Time Metrics
- **Validated Today** - Tickets checked in today
- **Total All Time** - Cumulative validations
- **Unique Tickets** - Individual tickets validated
- **Current Time** - Live clock

### By Ticket Type
- Total validations per ticket type
- Today's validations per type
- Unique tickets per type

---

## 🔍 Validation Responses

### ✅ Valid Ticket (Green)
```
✓ Valid Ticket
👤 John Doe
📧 john@example.com
🎫 General Admission
⚠️  Already validated 1 time(s) [if duplicate]
```

### ❌ Invalid Ticket (Red)
```
✗ Invalid Ticket
Ticket not found in system
```

---

## 🛠️ API Endpoints

### 1. Validate Ticket
```http
POST /api/admin/tickets/validate
Authorization: Bearer {token}
Content-Type: application/json

{
  "ticket_number": "SYN2-ORDER123-T001",
  "validation_location": "Main Entrance",
  "validation_notes": "Early arrival"
}
```

### 2. Check Ticket Status
```http
GET /api/admin/tickets/validate?ticket_number=SYN2-ORDER123-T001
Authorization: Bearer {token}
```

### 3. Get Validation History
```http
GET /api/admin/tickets/validations?limit=50&offset=0
Authorization: Bearer {token}
```

Query params: `limit`, `offset`, `ticket_number`, `order_id`, `date`

---

## 📱 UI Components

### Validation Scanner
- **Ticket Number Input** - Auto-focused, monospace font
- **Search Button** - Check ticket without validating
- **Location Field** - Optional entry point location
- **Notes Field** - Optional additional information
- **Validate Button** - Confirms check-in
- **Clear Button** - Resets form

### Recent Validations
- Last 10 validated tickets
- Real-time updates
- Shows: ticket, name, time, location, notes

### Statistics Cards
- Validated today count
- Total validations
- Unique tickets
- Current time display

---

## 🔐 Security

### Authentication Required
- All validation endpoints require Bearer token
- Admin user must be logged in
- Admin ID tracked in `validated_by` field

### Row Level Security
- Only admins can view/create/update validations
- RLS policies enforced at database level

### Audit Trail
- Every validation logged
- Timestamp recorded
- Admin user tracked
- Location and notes stored
- Security events logged

---

## ⚠️ Common Scenarios

### Duplicate Validation
**Display:** "Already validated X time(s)"
**Action:** Review validation history, decide to proceed or deny

### Ticket Not Found
**Display:** "Ticket not found in system"
**Action:** Verify ticket number, check payment status

### Network Offline
**Display:** Red "Offline" badge
**Action:** Wait for connection (offline sync coming soon)

---

## 🗄️ Database

### Main Table: `ticket_validations`
```sql
- id UUID (primary key)
- ticket_number TEXT (indexed)
- order_id TEXT (indexed)
- ticket_type_id UUID (foreign key)
- attendee_name TEXT
- attendee_email TEXT
- validated_at TIMESTAMPTZ (indexed)
- validated_by UUID (foreign key to admin_users)
- validation_location TEXT
- validation_notes TEXT
- is_valid BOOLEAN
- check_in_time TIMESTAMPTZ
- check_out_time TIMESTAMPTZ
```

### Helper Functions
- `is_ticket_validated(ticket_num)` - Check if validated
- `get_ticket_validation_count(ticket_num)` - Get validation count

### View: `validation_stats`
Pre-aggregated statistics per ticket type

---

## 📁 File Locations

| Purpose | Location |
|---------|----------|
| Database Migration | `supabase/migrations/20260103000000_add_ticket_validation.sql` |
| Type Definitions | `types/ticket.ts` |
| Validation API | `app/api/admin/tickets/validate/route.ts` |
| History API | `app/api/admin/tickets/validations/route.ts` |
| Admin UI | `app/admin/validate-tickets/page.tsx` |
| Navigation | `components/admin-navigation.tsx` |
| Dashboard | `app/admin/page.tsx` |

---

## 🎯 Keyboard Shortcuts

- **Enter** - Check ticket status (when in ticket number field)
- **Tab** - Navigate between fields
- **Escape** - Close any open dialogs

---

## 🔄 Workflow

1. **Admin Opens Page** → Statistics load
2. **Enter Ticket Number** → Press Enter
3. **System Checks Ticket** → Shows ticket info
4. **Admin Reviews** → Checks for duplicates
5. **Add Location/Notes** → Optional details
6. **Click Validate** → Creates validation record
7. **Success Message** → Form clears
8. **Recent List Updates** → Shows new validation
9. **Stats Refresh** → Updated counts
10. **Ready for Next** → Repeat

---

## 📈 Metrics & Analytics

### Available Now
- Total validations (all time)
- Validations today
- Unique tickets validated
- Breakdown by ticket type
- Recent validation history

### Coming Soon
- Peak entry times
- Average validation duration
- Entry flow visualization
- Capacity monitoring
- Real-time dashboard

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Ticket not found | Verify payment completed, check order status |
| Already validated | Check if legitimate re-entry or potential fraud |
| Slow response | Check network, verify database indexes |
| Offline mode | Wait for connection, queue validations locally (soon) |
| Stats not updating | Refresh page, check recent validations |

---

## 🚦 Status Indicators

- **🟢 Green Card** - Valid ticket, ready to validate
- **🔴 Red Card** - Invalid ticket, deny entry
- **🟠 Orange Warning** - Already validated, use caution
- **🔴 Offline Badge** - No network connection

---

## 📞 Support

For issues or questions:
1. Check [Full Documentation](TICKET_VALIDATION_COMPLETE.md)
2. Review [Ticket Management Guide](TICKET_MANAGEMENT_COMPLETE.md)
3. Contact system administrator
4. Check database logs for errors

---

## ✨ Best Practices

1. **Always check status first** - Use Search before validating
2. **Add location** - Helps with reporting and tracking
3. **Review duplicates carefully** - May indicate fraud
4. **Clear form after validation** - Prevents accidental duplicates
5. **Monitor statistics** - Track entry flow throughout event
6. **Report anomalies** - Suspicious patterns or errors

---

## 🎉 Quick Tips

- Use **monospace font** for ticket numbers (automatic)
- **Auto-focus** returns to ticket input after validation
- **Enter key** works from ticket number field
- **Recent list** auto-scrolls to show latest
- **Statistics** update in real-time
- **Network status** visible at all times

---

**Status:** ✅ Production Ready  
**Version:** 1.0  
**Last Updated:** January 3, 2025
