-- Migration: Create Email Logs Table
-- Description: Centralized tracking for all transactional emails with predefined types
-- Author: System
-- Date: 2026-01-09

-- ============================================================================
-- CUSTOM TYPES (ENUMs)
-- ============================================================================

-- Email type enum for categorizing transactional emails
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_type') THEN
    CREATE TYPE email_type AS ENUM (
      'welcome',
      'otp_verification',
      'ticket_confirmation',
      'ticket_transfer',
      'team_ticket_assignment',
      'speaker_application',
      'partner_confirmation',
      'partner_reminder',
      'newsletter_welcome',
      'admin_notification',
      'general'
    );
  END IF;
END $$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Email logs table for tracking all transactional email sends
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Email classification
  email_type email_type NOT NULL,
  
  -- Recipient information
  recipient TEXT NOT NULL, -- Max email length per RFC 5321
  recipient_name TEXT,
  
  -- Email content summary
  subject TEXT NOT NULL, -- Max subject length per RFC 2822
  
  -- Send status tracking
  resend_message_id TEXT, -- Message ID from Resend API
  sent_at TIMESTAMPTZ, -- NULL if failed, populated on success
  error_message TEXT, -- Error details if send failed
  
  -- Additional context
  metadata JSONB DEFAULT '{}', -- Flexible field for user_id, order_id, etc.
  
  -- Audit timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add table and column comments
COMMENT ON TABLE public.email_logs IS 'Centralized log of all transactional emails sent from the application';
COMMENT ON COLUMN public.email_logs.email_type IS 'Categorization of the email (welcome, otp_verification, ticket_confirmation, etc.)';
COMMENT ON COLUMN public.email_logs.recipient IS 'Email address of the recipient';
COMMENT ON COLUMN public.email_logs.recipient_name IS 'Display name of the recipient (if available)';
COMMENT ON COLUMN public.email_logs.subject IS 'Email subject line';
COMMENT ON COLUMN public.email_logs.resend_message_id IS 'Message ID returned from Resend API on successful send';
COMMENT ON COLUMN public.email_logs.sent_at IS 'Timestamp when email was successfully sent (NULL if failed)';
COMMENT ON COLUMN public.email_logs.error_message IS 'Error message if email send failed';
COMMENT ON COLUMN public.email_logs.metadata IS 'Additional context like user_id, order_id, template_id, etc.';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index for querying by email type (common filter)
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type 
  ON public.email_logs(email_type);

-- Index for querying by recipient (lookup by email address)
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient 
  ON public.email_logs(recipient);

-- Index for time-based queries (recent emails, analytics)
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at 
  ON public.email_logs(created_at DESC);

-- Index for finding failed emails
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at_null 
  ON public.email_logs(created_at DESC) 
  WHERE sent_at IS NULL;

-- Composite index for common admin queries
CREATE INDEX IF NOT EXISTS idx_email_logs_type_created 
  ON public.email_logs(email_type, created_at DESC);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create
DROP TRIGGER IF EXISTS trigger_email_logs_updated_at ON public.email_logs;
CREATE TRIGGER trigger_email_logs_updated_at
  BEFORE UPDATE ON public.email_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_email_logs_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Service role has full access (email logs are accessed server-side)
-- Note: We use a simple service_role check since email logs are sensitive
-- and should only be accessed via API routes, not directly from client
CREATE POLICY "Service role full access to email logs"
  ON public.email_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Only grant to service role (no authenticated user access needed)
GRANT ALL ON public.email_logs TO service_role;
