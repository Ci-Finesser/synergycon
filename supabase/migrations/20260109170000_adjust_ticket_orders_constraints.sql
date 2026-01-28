-- This migration adjusts constraints on the 'ticket_orders' table
-- to accommodate aggregate orders where multiple ticket types are stored in the metadata.
-- The frontend sends a single order record containing all tickets in a JSONB field,
-- so per-row fields like unit_price and ticket_type_id are not applicable.

-- Make unit_price nullable as it doesn't apply to an aggregate order.
ALTER TABLE public.ticket_orders
ALTER COLUMN unit_price DROP NOT NULL;

-- Make ticket_type_id nullable as it doesn't apply to an aggregate order.
ALTER TABLE public.ticket_orders
ALTER COLUMN ticket_type_id DROP NOT NULL;
