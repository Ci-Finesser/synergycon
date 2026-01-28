-- Seed the display_order based on price for existing tickets
-- This ensures a consistent default ordering.
WITH ranked_tickets AS (
    SELECT
        id,
        RANK() OVER (ORDER BY price ASC, name ASC) as new_order
    FROM ticket_types
)
UPDATE ticket_types
SET display_order = ranked_tickets.new_order
FROM ranked_tickets
WHERE ticket_types.id = ranked_tickets.id;

-- Recreate public_tickets view to ensure display_order is included
-- Must DROP first because CREATE OR REPLACE cannot change column structure
DROP VIEW IF EXISTS public_tickets;

CREATE VIEW public_tickets AS
SELECT 
  id,
  ticket_id,
  name,
  description,
  price,
  benefits,
  available_quantity,
  sold_quantity,
  category,
  duration,
  display_order,
  (available_quantity IS NULL OR available_quantity > sold_quantity) as is_available
FROM ticket_types
WHERE is_active = true;

-- Re-grant public access to the view
GRANT SELECT ON public_tickets TO anon, authenticated;

-- Grant access to view
GRANT SELECT ON public_tickets TO anon, authenticated;
