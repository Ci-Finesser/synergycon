# Database Schemas - Single Source of Truth

This directory contains Zod schemas that serve as the **single source of truth** for all database operations. Each schema file documents the actual PostgreSQL column names and provides type-safe validation.

## ⚠️ Column Naming Conventions

Different tables use different naming conventions. Always check the schema before inserting data.

### Tables with `customer_*` prefix

| Table | Use These Columns | NOT These |
|-------|-------------------|-----------|
| **ticket_orders** | `customer_email` | ~~email~~ |
| **ticket_orders** | `customer_name` | ~~name~~, ~~full_name~~ |
| **ticket_orders** | `customer_phone` | ~~phone~~ |
| **ticket_orders** | `order_number` | ~~order_id~~ (for unique ID) |
| **ticket_orders** | `payment_status`, `fulfillment_status` | ~~status~~ |
| **payments** | `customer_email` | ~~email~~ |
| **payments** | `customer_name` | ~~name~~ |
| **payments** | `customer_phone` | ~~phone~~ |

### Tables with `attendee_*` prefix

| Table | Use These Columns | NOT These |
|-------|-------------------|-----------|
| **tickets** | `attendee_email` | ~~email~~, ~~customer_email~~ |
| **tickets** | `attendee_name` | ~~name~~, ~~customer_name~~ |

### Tables with simple names (no prefix)

| Table | Columns |
|-------|---------|
| **registrations** | `email`, `full_name`, `phone_number` |
| **team_members** | `name`, `email` |
| **newsletter_subscriptions** | `email` |

## Schema Files

| File | Table | Key Notes |
|------|-------|-----------|
| [ticket-orders.ts](./ticket-orders.ts) | `ticket_orders` | Uses `customer_*` prefix, `order_number` |
| [tickets.ts](./tickets.ts) | `tickets` | Uses `attendee_*` prefix |
| [payments.ts](./payments.ts) | `payments` | Uses `customer_*` prefix, has `order_id` |
| [registrations.ts](./registrations.ts) | `registrations` | Simple names, `full_name` |
| [ticket-types.ts](./ticket-types.ts) | `ticket_types` | Ticket configuration |
| [common.ts](./common.ts) | - | Shared validators |

## Usage

### Import schemas and types

```typescript
import { 
  // Ticket Orders
  ticketOrderInsertSchema,
  toTicketOrderInsert,
  validateTicketOrderInput,
  type TicketOrderInsert,
  
  // Tickets
  ticketInsertSchema,
  type TicketInsert,
  
  // Payments
  paymentInsertSchema,
  type PaymentInsert,
  
  // Common validators
  emailSchema,
  phoneSchema,
} from '@/lib/schemas'
```

### Validate API input

```typescript
import { validateTicketOrderInput } from '@/lib/schemas'

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  const result = validateTicketOrderInput(body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error },
      { status: 400 }
    )
  }
  
  // result.data is already transformed to DB column names
  await supabase.from('ticket_orders').insert(result.data)
}
```

### Transform friendly names to DB columns

```typescript
import { toTicketOrderInsert } from '@/lib/schemas'

// Input uses friendly names
const input = {
  email: 'user@example.com',  // ← friendly name
  name: 'John Doe',           // ← friendly name
  orderId: 'ORD-123',         // ← friendly name
  // ...
}

// Transform to DB column names
const dbData = toTicketOrderInsert(input)
// {
//   customer_email: 'user@example.com',  // ← DB column
//   customer_name: 'John Doe',            // ← DB column
//   order_number: 'ORD-123',              // ← DB column
//   ...
// }

await supabase.from('ticket_orders').insert(dbData)
```

### Direct database insert

```typescript
import { paymentInsertSchema } from '@/lib/schemas'

// Validate with DB column names directly
const payment = paymentInsertSchema.parse({
  order_id: 'ORD-123',
  tx_ref: 'FLW-TX-123',
  amount: 50000,
  customer_email: 'user@example.com',
  customer_name: 'John Doe',
  customer_phone: '+2348012345678',
})

await supabase.from('payments').insert(payment)
```

## Adding New Schemas

1. Create `lib/schemas/[table-name].ts`
2. Export from `lib/schemas/index.ts`
3. Document column naming convention in this README
4. Add transform functions if column names differ from API input

## Common Errors

### "Could not find the 'email' column"

**Cause**: Using `email` instead of `customer_email` or `attendee_email`

**Fix**: Check which table you're inserting into:
- `ticket_orders` → `customer_email`
- `tickets` → `attendee_email`
- `registrations` → `email` (no prefix)

### "Could not find the 'order_id' column"

**Cause**: Using `order_id` for `ticket_orders` table

**Fix**: Use `order_number` for `ticket_orders`, `order_id` for `payments`

### "Could not find the 'status' column"

**Cause**: `ticket_orders` doesn't have a single `status` column

**Fix**: Use `payment_status` and/or `fulfillment_status`
