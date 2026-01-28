# Admin Payment Management & Analytics Guide

## Overview

Complete admin dashboard and API system for analyzing, managing, and exporting payment data with detailed insights into ticket tiers, revenue trends, and payment status tracking.

## How Tiers & Product Types Are Identified

### Ticket Tier Classification

Tiers are automatically identified from the **ticket ID** structure:

```typescript
// Tier detection logic
const tier = ticketId.includes('vip') ? 'vip' : 'standard'
```

**Tier Mapping:**
- `standard-day` → **Standard** tier
- `vip-day` → **VIP** tier
- `3day-standard` → **Standard** tier
- `3day-vip` → **VIP** tier

### Duration Classification

Duration is identified from the ticket ID:

```typescript
const duration = ticketId.includes('3day') ? '3-day' : '1-day'
```

**Duration Options:**
- `1-day` - Single day pass (Day 1, 2, or 3)
- `3-day` - Full festival pass (all 3 days)

### Complete Ticket Metadata Structure

Each payment record stores detailed ticket information in the `meta` field:

```typescript
interface TicketItemMeta {
  ticket_id: string        // e.g., "standard-day", "3day-vip"
  ticket_name: string      // e.g., "Standard Day Pass", "3-Day VIP Access Pass"
  ticket_tier: string      // "standard" | "vip"
  ticket_duration: string  // "1-day" | "3-day"
  quantity: number         // Number of tickets purchased
  price: number            // Unit price in NGN
  subtotal: number         // Total for this ticket type (price × quantity)
}

// Stored as array in payments.meta.tickets
meta: {
  order_id: "SYN2-ABC123",
  tickets: [
    {
      ticket_id: "3day-vip",
      ticket_name: "3-Day VIP Access Pass",
      ticket_tier: "vip",
      ticket_duration: "3-day",
      quantity: 2,
      price: 150000,
      subtotal: 300000
    }
  ],
  total_quantity: 2
}
```

---

## Admin Dashboard Features

### 1. Analytics Overview

**Stats Cards:**
- **Total Revenue** - Sum of all successful payments
- **Success Rate** - Percentage of successful transactions
- **Average Transaction Value** - Mean payment amount
- **Pending Transactions** - Awaiting verification

**Charts:**
- **Daily Revenue** - Line chart of revenue over time
- **Revenue by Tier** - Pie chart showing standard vs VIP split

### 2. Payment Management

**Table with:**
- Order ID (clickable for details)
- Customer name & email
- Payment amount
- Current status (successful, pending, failed, cancelled)
- Payment method (card, bank transfer, USSD, etc.)
- Transaction date
- Action buttons (View, Edit, Refund)

**Filter Options:**
- Status (all, successful, pending, failed, cancelled)
- Date range (start & end date)
- Search (email, phone, order ID)
- Pagination (10 items per page)

### 3. Data Export

**Export Formats:**
- **CSV** - Spreadsheet format for Excel/Sheets
- **JSON** - Raw data for programmatic use

**Export includes:**
- All payment fields
- Applied filters (date range, status)
- Searchable data

---

## API Endpoints

### GET /api/admin/payments/analytics

Returns analytics data for the dashboard.

**Query Parameters:**
```
metric=overview|tickets|daily|methods|tiers  (required)
startDate=2026-01-01                         (optional)
endDate=2026-01-31                           (optional)
```

**Metrics:**

#### `metric=overview`
Returns summary statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 5000000,
    "totalTransactions": 45,
    "successfulTransactions": 42,
    "failedTransactions": 2,
    "pendingTransactions": 1,
    "averageTransactionValue": 119047.62,
    "successRate": 93.33
  }
}
```

#### `metric=tickets`
Returns breakdown by ticket type.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "ticketType": "3day-vip",
      "ticketTier": "vip",
      "quantity": 15,
      "revenue": 2250000,
      "percentage": 45
    },
    {
      "ticketType": "3day-standard",
      "ticketTier": "standard",
      "quantity": 20,
      "revenue": 1000000,
      "percentage": 20
    }
  ]
}
```

#### `metric=daily`
Returns daily revenue trends.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-01-01",
      "revenue": 500000,
      "count": 5,
      "successfulCount": 5
    },
    {
      "date": "2026-01-02",
      "revenue": 1200000,
      "count": 10,
      "successfulCount": 9
    }
  ]
}
```

#### `metric=tiers`
Returns breakdown by tier (Standard vs VIP).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tier": "vip",
      "quantity": 25,
      "revenue": 3750000,
      "orderCount": 15,
      "percentage": 75
    },
    {
      "tier": "standard",
      "quantity": 30,
      "revenue": 1250000,
      "orderCount": 20,
      "percentage": 25
    }
  ]
}
```

### GET /api/admin/payments

List and search payments.

**Query Parameters:**
```
id=payment_id                    (optional)
tx_ref=transaction_ref          (optional)
order_id=order_123              (optional)
status=successful|pending|failed (optional)
limit=50                        (default: 50)
offset=0                        (default: 0)
```

**Response:**
```json
{
  "success": true,
  "payments": [
    {
      "id": "uuid",
      "order_id": "SYN2-ABC123",
      "tx_ref": "SYN2-ABC123-...",
      "amount": 300000,
      "currency": "NGN",
      "status": "successful",
      "payment_type": "card",
      "customer_email": "user@example.com",
      "customer_name": "John Doe",
      "customer_phone": "+2348012345678",
      "created_at": "2026-01-02T10:30:00Z",
      "verified_at": "2026-01-02T10:31:00Z"
    }
  ],
  "pagination": {
    "total": 450,
    "limit": 50,
    "offset": 0,
    "pages": 9
  }
}
```

### PATCH /api/admin/payments

Update payment status.

**Request Body:**
```json
{
  "paymentId": "uuid",
  "status": "successful|pending|failed|refunded",
  "notes": "Refund processed",
  "adminId": "admin-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment updated to refunded"
}
```

### GET /api/admin/payments/export

Export payments in various formats.

**Query Parameters:**
```
format=csv|json              (default: json)
startDate=2026-01-01        (optional)
endDate=2026-01-31          (optional)
status=successful|pending    (optional)
```

**Response:**
- **CSV:** File download with headers and data
- **JSON:** Formatted array of payment objects

---

## Database Schema

### Payments Table Structure

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  order_id TEXT NOT NULL,
  tx_ref TEXT NOT NULL UNIQUE,
  flw_ref TEXT,
  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'NGN',
  status TEXT CHECK (status IN ('pending', 'successful', 'failed', 'cancelled')),
  payment_type TEXT,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  meta JSONB,                  -- Contains tickets array with tier info
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
)
```

### Meta Field Structure

```sql
meta: {
  "order_id": "SYN2-ABC123",
  "tickets": [
    {
      "ticket_id": "3day-vip",
      "ticket_name": "3-Day VIP Access Pass",
      "ticket_tier": "vip",
      "ticket_duration": "3-day",
      "quantity": 2,
      "price": 150000,
      "subtotal": 300000
    }
  ],
  "total_quantity": 2
}
```

---

## Usage Examples

### Get Overview Statistics

```bash
curl -X GET "http://localhost:3000/api/admin/payments/analytics?metric=overview" \
  -H "Authorization: Bearer your-token"
```

### Get Revenue by Tier for a Date Range

```bash
curl -X GET "http://localhost:3000/api/admin/payments/analytics?metric=tiers&startDate=2026-01-01&endDate=2026-01-31" \
  -H "Authorization: Bearer your-token"
```

### Export All Successful Payments as CSV

```bash
curl -X GET "http://localhost:3000/api/admin/payments/export?format=csv&status=successful" \
  -H "Authorization: Bearer your-token" \
  -o payments.csv
```

### Search for a Specific Payment

```bash
curl -X GET "http://localhost:3000/api/admin/payments?order_id=SYN2-ABC123" \
  -H "Authorization: Bearer your-token"
```

### Update Payment Status

```bash
curl -X PATCH "http://localhost:3000/api/admin/payments" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "uuid-here",
    "status": "refunded",
    "notes": "Customer requested refund"
  }'
```

---

## Analyzing Tiers & Product Types

### SQL Queries for Analysis

**Revenue by Tier:**
```sql
SELECT 
  tickets->0->>'ticket_tier' as tier,
  COUNT(*) as order_count,
  SUM(amount) as total_revenue,
  AVG(amount) as avg_payment
FROM payments
WHERE status = 'successful'
GROUP BY tier
ORDER BY total_revenue DESC;
```

**Revenue by Duration:**
```sql
SELECT 
  tickets->0->>'ticket_duration' as duration,
  COUNT(*) as order_count,
  SUM(amount) as total_revenue
FROM payments
WHERE status = 'successful'
GROUP BY duration;
```

**Most Popular Ticket Type:**
```sql
SELECT 
  tickets->0->>'ticket_name' as ticket_name,
  SUM((tickets->0->>'quantity')::int) as total_quantity,
  SUM(amount) as total_revenue
FROM payments
WHERE status = 'successful'
GROUP BY ticket_name
ORDER BY total_quantity DESC;
```

**VIP vs Standard Breakdown:**
```sql
WITH ticket_data AS (
  SELECT 
    CASE WHEN tickets->0->>'ticket_tier' = 'vip' THEN 'VIP' ELSE 'Standard' END as tier,
    (tickets->0->>'quantity')::int as qty,
    amount
  FROM payments
  WHERE status = 'successful'
)
SELECT 
  tier,
  SUM(qty) as total_tickets,
  COUNT(*) as orders,
  SUM(amount) as revenue,
  ROUND((SUM(amount)::numeric / SUM(SUM(amount)) OVER () * 100), 2) as revenue_percent
FROM ticket_data
GROUP BY tier;
```

---

## Best Practices

### 1. Regular Backups
- Export payment data daily
- Store in secure location
- Keep audit trail

### 2. Monitoring
- Check daily revenue trends
- Monitor pending transactions
- Alert on high failure rates
- Track ticket tier distribution

### 3. Reconciliation
- Compare Flutterwave dashboard with local records
- Verify webhook deliveries
- Monitor for duplicate transactions

### 4. Refund Process
1. Verify payment status in dashboard
2. Update status to "refunded" via PATCH
3. Process refund through Flutterwave dashboard
4. Update notes with reason
5. Export updated report

### 5. Data Security
- Always use HTTPS for API calls
- Never expose admin tokens
- Rotate authentication keys regularly
- Log all admin actions

---

## Dashboard UI Components

### Key Metrics Display
- Total Revenue (with comparison)
- Success Rate (percentage)
- Average Transaction Value
- Pending Transactions Count

### Interactive Charts
- Daily Revenue Line Chart (time series)
- Revenue by Tier Pie Chart (distribution)
- Payment Status Distribution Bar Chart
- Conversion Funnel

### Data Table Features
- Sortable columns
- Filterable status
- Searchable fields
- Pagination controls
- Action buttons (View, Edit, Refund)

---

## Performance Optimization

### Indexing Strategy
```sql
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_customer_email ON payments(customer_email);
```

### Query Optimization
- Pre-aggregate daily data
- Cache frequently accessed metrics
- Use pagination for large datasets
- Filter before aggregation

---

## Troubleshooting

### Missing Ticket Metadata
**Issue:** Tickets array empty in payment meta
**Solution:** Ensure payment initialization includes proper ticket structure

### Incorrect Tier Classification
**Issue:** Tiers not matching expected values
**Solution:** Verify ticket ID format matches classification logic

### Slow Analytics Queries
**Issue:** Dashboard takes too long to load
**Solution:** 
1. Check database indexes exist
2. Reduce date range for queries
3. Enable caching layer

### Export File Corrupt
**Issue:** Downloaded CSV/JSON cannot be opened
**Solution:**
1. Try different format
2. Check file size is reasonable
3. Verify encoding is UTF-8

---

## Security Considerations

✅ **Implemented:**
- Admin authorization via Bearer token
- Server-side data validation
- Secure API endpoints
- Audit logging

⚠️ **Additional Measures:**
- Rate limiting on export endpoints
- Admin IP whitelisting
- Session timeouts
- Encryption for sensitive fields

---

## Updates & Improvements

**v1.1.0** (Current)
- ✅ Detailed ticket metadata in payments
- ✅ Tier & duration classification
- ✅ Admin dashboard with charts
- ✅ Analytics API endpoints
- ✅ Export functionality (CSV/JSON)
- ✅ Payment management features
- ✅ SQL query examples

**Future Enhancements:**
- [ ] Predictive analytics
- [ ] Custom report builder
- [ ] Email digest reports
- [ ] Refund automation
- [ ] Payment reconciliation API
- [ ] Transaction notifications
