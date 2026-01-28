-- ============================================================================
-- Update Ticket Types Structure
-- Created: 2026-01-20
-- Purpose: Update ticket type constraints to match new pricing tiers
-- 
-- New Ticket Tiers:
--   - vip: Day Access (₦25,000)
--   - vip-plus: Day Access (₦50,000)  
--   - vvip: Full Festival (₦100,000)
--   - priority: Premium Access (₦150,000)
-- ============================================================================

-- ============================================================================
-- UPDATE TICKETS TABLE CONSTRAINTS
-- ============================================================================

-- Update ticket_type constraint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tickets_ticket_type_check') THEN
    ALTER TABLE tickets DROP CONSTRAINT tickets_ticket_type_check;
  END IF;
  ALTER TABLE tickets ADD CONSTRAINT tickets_ticket_type_check 
    CHECK (ticket_type IN ('vip', 'vip-plus', 'vvip', 'priority-pass'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Update ticket_tier constraint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tickets_ticket_tier_check') THEN
    ALTER TABLE tickets DROP CONSTRAINT tickets_ticket_tier_check;
  END IF;
  ALTER TABLE tickets ADD CONSTRAINT tickets_ticket_tier_check 
    CHECK (ticket_tier IN ('vip', 'vip-plus', 'vvip', 'priority'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Update ticket_duration constraint to be more flexible
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tickets_ticket_duration_check') THEN
    ALTER TABLE tickets DROP CONSTRAINT tickets_ticket_duration_check;
  END IF;
  ALTER TABLE tickets ADD CONSTRAINT tickets_ticket_duration_check 
    CHECK (ticket_duration IN ('single-day', 'multi-day', 'full-event'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Add ticket_access_type column if not exists
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS ticket_access_type TEXT CHECK (ticket_access_type IN ('day', 'full'));

-- ============================================================================
-- UPDATE TICKET_TYPES TABLE (Master Ticket Definitions)
-- ============================================================================

-- Update category constraint to match new tiers
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_types_category_check') THEN
    ALTER TABLE ticket_types DROP CONSTRAINT ticket_types_category_check;
  END IF;
  -- Note: category might not have a constraint, adding one for consistency
  ALTER TABLE ticket_types ADD CONSTRAINT ticket_types_category_check 
    CHECK (category IN ('vip', 'vip-plus', 'vvip', 'priority'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Update duration constraint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_types_duration_check') THEN
    ALTER TABLE ticket_types DROP CONSTRAINT ticket_types_duration_check;
  END IF;
  ALTER TABLE ticket_types ADD CONSTRAINT ticket_types_duration_check 
    CHECK (duration IN ('day', 'full-event'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Add access_type column to ticket_types if not exists
ALTER TABLE ticket_types
  ADD COLUMN IF NOT EXISTS access_type TEXT CHECK (access_type IN ('day', 'full'));

-- ============================================================================
-- UPDATE EXISTING TICKET TYPE DATA
-- Migrate old ticket types to new structure
-- ============================================================================

-- Deactivate old ticket types
UPDATE ticket_types 
SET is_active = false 
WHERE ticket_id IN ('standard-day', 'vip-day', '3day-standard', '3day-vip');

-- Insert new ticket types
INSERT INTO ticket_types (ticket_id, name, description, price, benefits, category, duration, access_type, display_order, is_active) VALUES
  (
    'vip',
    'VIP',
    'Single-day access to sessions and exhibitions',
    25000,
    '["Day-specific sessions", "Exhibition area access", "Networking opportunities", "Certificate of attendance"]'::jsonb,
    'vip',
    'day',
    'day',
    1,
    true
  ),
  (
    'vip-plus',
    'VIP+',
    'Single-day premium access with enhanced perks',
    50000,
    '["All VIP benefits", "Priority seating", "Exclusive networking lounge", "Lunch included", "Premium swag bag"]'::jsonb,
    'vip-plus',
    'day',
    'day',
    2,
    true
  ),
  (
    'vvip',
    'VVIP',
    'Full festival access across all event days',
    100000,
    '["Full festival access", "All keynotes & panels", "VIP lounge access", "All meals included", "Official swag bag", "Priority registration"]'::jsonb,
    'vvip',
    'full-event',
    'full',
    3,
    true
  ),
  (
    'priority-pass',
    'Priority Pass',
    'Ultimate premium experience with exclusive access',
    150000,
    '["All VVIP benefits", "Front-row reserved seating", "Exclusive speaker dinner invite", "Meet & greet with speakers", "Backstage access", "Dedicated concierge", "VIP transport included"]'::jsonb,
    'priority',
    'full-event',
    'full',
    4,
    true
  )
ON CONFLICT (ticket_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  benefits = EXCLUDED.benefits,
  category = EXCLUDED.category,
  duration = EXCLUDED.duration,
  access_type = EXCLUDED.access_type,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN tickets.ticket_type IS 'Ticket type: vip, vip-plus, vvip, priority-pass';
COMMENT ON COLUMN tickets.ticket_tier IS 'Ticket tier: vip, vip-plus, vvip, priority';
COMMENT ON COLUMN tickets.ticket_duration IS 'Duration: single-day, multi-day, full-event';
COMMENT ON COLUMN tickets.ticket_access_type IS 'Access type: day (single-day) or full (full event)';

COMMENT ON COLUMN ticket_types.category IS 'Ticket category/tier: vip, vip-plus, vvip, priority';
COMMENT ON COLUMN ticket_types.duration IS 'Duration: day or full-event';
COMMENT ON COLUMN ticket_types.access_type IS 'Access type: day or full';
