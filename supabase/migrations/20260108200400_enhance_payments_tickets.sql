-- Migration: Enhance Payments and Tickets Tables
-- Description: Adds missing tracking fields for comprehensive payment and ticket management
-- Date: 2026-01-08

-- ============================================================================
-- ENHANCE PAYMENTS TABLE
-- Based on types/payment.ts PaymentRecord interface
-- ============================================================================

-- Add payment_method field
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add processor_ref for external payment processor reference
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS processor_ref TEXT;

-- Add processor_response for storing raw processor response
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS processor_response JSONB;

-- Add ip_address for fraud detection
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Add user_agent for tracking
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Add session_id for linking to user session
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Add coupon_code for discount tracking
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS coupon_code TEXT;

-- Add discount_amount
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

-- Add original_amount (before discount)
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS original_amount DECIMAL(10,2);

-- Add failure_reason for failed payments
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- Add retry_count for payment retries
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- Update status constraint to include 'refunded' if not already
DO $$
BEGIN
  -- Check and update status constraint
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_status_check') THEN
    ALTER TABLE payments DROP CONSTRAINT payments_status_check;
  END IF;
  ALTER TABLE payments ADD CONSTRAINT payments_status_check 
    CHECK (status IN ('pending', 'processing', 'successful', 'failed', 'cancelled', 'refunded'));
EXCEPTION WHEN OTHERS THEN
  -- Constraint might already be correct
  NULL;
END $$;

-- ============================================================================
-- ENHANCE TICKETS TABLE
-- Based on types/user.ts Ticket interface
-- ============================================================================

-- Add ticket_tier column
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS ticket_tier TEXT CHECK (ticket_tier IN ('standard', 'vip'));

-- Add ticket_duration column
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS ticket_duration TEXT CHECK (ticket_duration IN ('single-day', '3-day'));

-- Add ticket_name for display
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS ticket_name TEXT;

-- Add subtotal for line item total
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2);

-- Add quantity field
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- Add valid_for_day date field
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS valid_for_day DATE;

-- Add check_in tracking
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT false;

ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;

ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES admin_users(id) ON DELETE SET NULL;

-- ============================================================================
-- ENHANCE TICKET_TYPES TABLE
-- ============================================================================

-- Add max_per_order limit
ALTER TABLE ticket_types
  ADD COLUMN IF NOT EXISTS max_per_order INTEGER DEFAULT 10;

-- Add min_per_order limit
ALTER TABLE ticket_types
  ADD COLUMN IF NOT EXISTS min_per_order INTEGER DEFAULT 1;

-- Add early_bird_price for promotional pricing
ALTER TABLE ticket_types
  ADD COLUMN IF NOT EXISTS early_bird_price DECIMAL(10,2);

-- Add early_bird_until date
ALTER TABLE ticket_types
  ADD COLUMN IF NOT EXISTS early_bird_until TIMESTAMPTZ;

-- Add group_discount_threshold
ALTER TABLE ticket_types
  ADD COLUMN IF NOT EXISTS group_discount_threshold INTEGER;

-- Add group_discount_percent
ALTER TABLE ticket_types
  ADD COLUMN IF NOT EXISTS group_discount_percent DECIMAL(5,2);

-- ============================================================================
-- ENHANCE TICKET_ORDERS TABLE
-- ============================================================================

-- Add organization field
ALTER TABLE ticket_orders
  ADD COLUMN IF NOT EXISTS organization TEXT;

-- Add role field
ALTER TABLE ticket_orders
  ADD COLUMN IF NOT EXISTS role TEXT;

-- Add industry field
ALTER TABLE ticket_orders
  ADD COLUMN IF NOT EXISTS industry TEXT;

-- Add attendance_reason field
ALTER TABLE ticket_orders
  ADD COLUMN IF NOT EXISTS attendance_reason TEXT;

-- Add expectations field
ALTER TABLE ticket_orders
  ADD COLUMN IF NOT EXISTS expectations TEXT;

-- Add dietary_requirements field
ALTER TABLE ticket_orders
  ADD COLUMN IF NOT EXISTS dietary_requirements TEXT;

-- Add special_needs field
ALTER TABLE ticket_orders
  ADD COLUMN IF NOT EXISTS special_needs TEXT;

-- Add how_did_you_hear field
ALTER TABLE ticket_orders
  ADD COLUMN IF NOT EXISTS how_did_you_hear TEXT;

-- Add discount_code field
ALTER TABLE ticket_orders
  ADD COLUMN IF NOT EXISTS discount_code TEXT;

-- Add discount_amount field
ALTER TABLE ticket_orders
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

-- Add original_amount (before discount)
ALTER TABLE ticket_orders
  ADD COLUMN IF NOT EXISTS original_amount DECIMAL(12,2);

-- Add fulfillment_status
ALTER TABLE ticket_orders
  ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'processing', 'fulfilled', 'cancelled'));

-- Add confirmed_at timestamp
ALTER TABLE ticket_orders
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Add cancelled_at timestamp
ALTER TABLE ticket_orders
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Add cancellation_reason
ALTER TABLE ticket_orders
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- ============================================================================
-- CREATE REFUNDS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'rejected')),
  processed_by UUID REFERENCES admin_users(id),
  processor_ref TEXT,
  processor_response JSONB,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_created_at ON refunds(created_at DESC);

ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage refunds" ON refunds
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND is_active = true)
  );

-- ============================================================================
-- CREATE DISCOUNT_CODES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2),
  max_discount_amount DECIMAL(10,2),
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  applies_to TEXT[] DEFAULT '{}', -- ticket type IDs
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(UPPER(code));
CREATE INDEX IF NOT EXISTS idx_discount_codes_is_active ON discount_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_discount_codes_valid_dates ON discount_codes(valid_from, valid_until);

ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage discount codes" ON discount_codes
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND is_active = true)
  );

-- ============================================================================
-- ADD NEW INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_session_id ON payments(session_id);
CREATE INDEX IF NOT EXISTS idx_payments_coupon_code ON payments(coupon_code);

CREATE INDEX IF NOT EXISTS idx_tickets_ticket_tier ON tickets(ticket_tier);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_duration ON tickets(ticket_duration);
CREATE INDEX IF NOT EXISTS idx_tickets_checked_in ON tickets(checked_in);
CREATE INDEX IF NOT EXISTS idx_tickets_valid_for_day ON tickets(valid_for_day);

CREATE INDEX IF NOT EXISTS idx_ticket_orders_fulfillment_status ON ticket_orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_ticket_orders_discount_code ON ticket_orders(discount_code);

-- ============================================================================
-- ADD COMMENTS
-- ============================================================================

COMMENT ON COLUMN payments.payment_method IS 'Payment method used (card, bank_transfer, etc)';
COMMENT ON COLUMN payments.processor_ref IS 'External payment processor reference ID';
COMMENT ON COLUMN payments.processor_response IS 'Raw response from payment processor';
COMMENT ON COLUMN payments.coupon_code IS 'Discount code applied to this payment';
COMMENT ON COLUMN payments.failure_reason IS 'Reason for payment failure if applicable';

COMMENT ON COLUMN tickets.ticket_tier IS 'Ticket tier: standard or vip';
COMMENT ON COLUMN tickets.ticket_duration IS 'Duration: single-day or 3-day';
COMMENT ON COLUMN tickets.checked_in IS 'Whether ticket holder has checked in';
COMMENT ON COLUMN tickets.valid_for_day IS 'Specific day this ticket is valid for';

COMMENT ON TABLE refunds IS 'Tracks all refund requests and their processing status';
COMMENT ON TABLE discount_codes IS 'Discount/coupon codes for ticket purchases';

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON refunds, discount_codes TO service_role;
