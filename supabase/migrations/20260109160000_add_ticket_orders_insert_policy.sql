-- This migration adds a Row Level Security (RLS) policy to the 'ticket_orders' table.
-- The policy allows public users (both anonymous and authenticated) to create new ticket orders.
-- This is necessary for the public registration form to function correctly.

CREATE POLICY "Allow public access to create ticket orders"
ON public.ticket_orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
