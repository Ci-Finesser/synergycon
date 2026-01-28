-- Migration: Create Email Campaigns Schema
-- Description: Creates tables for mailing lists, subscribers, email campaigns, and campaign recipients
-- Author: Admin Email Campaign System
-- Date: 2025-12-26
-- Updated: 2025-12-30 - Fixed table creation order, added template_id column, added missing indexes
--
-- IMPORTANT: If you've already run the previous version of this migration,
-- run the patch script: 20251230_patch_email_campaigns_template_id.sql

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- UUID generation functions
CREATE EXTENSION IF NOT EXISTS "citext";        -- Case-insensitive text type

-- ============================================================================
-- DOMAINS (Reusable constrained types)
-- ============================================================================

-- Create email domain with validation (safe - skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_address') THEN
    CREATE DOMAIN email_address AS CITEXT
      CHECK (VALUE ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    COMMENT ON DOMAIN email_address IS 'Email address with case-insensitive comparison and format validation';
  END IF;
END $$;

-- ============================================================================
-- CUSTOM TYPES
-- ============================================================================

-- Create ENUM types for better type safety and performance (safe - skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_status') THEN
    CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recipient_status') THEN
    CREATE TYPE recipient_status AS ENUM ('pending', 'sent', 'failed', 'bounced');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscriber_status') THEN
    CREATE TYPE subscriber_status AS ENUM ('active', 'unsubscribed', 'bounced');
  END IF;
END $$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Create mailing_lists table
CREATE TABLE IF NOT EXISTS public.mailing_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.admin_users(id),
  total_subscribers INTEGER DEFAULT 0
);

COMMENT ON TABLE public.mailing_lists IS 'Stores mailing list information for email campaigns';
COMMENT ON COLUMN public.mailing_lists.total_subscribers IS 'Automatically updated by trigger when subscribers are added/removed';

-- Create mailing_list_subscribers table
CREATE TABLE IF NOT EXISTS public.mailing_list_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mailing_list_id UUID NOT NULL REFERENCES public.mailing_lists(id) ON DELETE CASCADE,
  email email_address NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  status subscriber_status DEFAULT 'active',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  CONSTRAINT mailing_list_subscribers_unique_email_per_list UNIQUE(mailing_list_id, email)
);

COMMENT ON TABLE public.mailing_list_subscribers IS 'Stores subscriber information for each mailing list';
COMMENT ON COLUMN public.mailing_list_subscribers.custom_fields IS 'JSONB field for storing additional custom data from CSV imports';

-- Create subscriber_preferences table
CREATE TABLE IF NOT EXISTS public.subscriber_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mailing_list_subscriber_id UUID NOT NULL REFERENCES public.mailing_list_subscribers(id) ON DELETE CASCADE,
  unsubscribe_reason TEXT,
  unsubscribe_timestamp TIMESTAMPTZ,
  notification_frequency TEXT DEFAULT 'weekly' CHECK (notification_frequency IN ('daily', 'weekly', 'monthly', 'never')),
  email_categories JSONB DEFAULT '[]'::jsonb,
  gdpr_consent BOOLEAN DEFAULT false,
  consent_timestamp TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT subscriber_preferences_unique_subscriber UNIQUE(mailing_list_subscriber_id)
);

COMMENT ON TABLE public.subscriber_preferences IS 'Stores detailed preferences and consent for subscribers';
COMMENT ON COLUMN public.subscriber_preferences.email_categories IS 'JSONB array of enabled email categories like ["newsletters", "updates", "promotions"]';

-- Create email_templates table for reusable templates (MOVED BEFORE email_campaigns)
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  html_template TEXT,
  preview_text TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT email_templates_unique_name_version UNIQUE(name, version)
);

-- Add missing columns to existing email_templates table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_templates' AND column_name = 'variables') THEN
    ALTER TABLE public.email_templates ADD COLUMN variables JSONB DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_templates' AND column_name = 'html_template') THEN
    ALTER TABLE public.email_templates ADD COLUMN html_template TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_templates' AND column_name = 'preview_text') THEN
    ALTER TABLE public.email_templates ADD COLUMN preview_text TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_templates' AND column_name = 'category') THEN
    ALTER TABLE public.email_templates ADD COLUMN category TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_templates' AND column_name = 'tags') THEN
    ALTER TABLE public.email_templates ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_templates' AND column_name = 'version') THEN
    ALTER TABLE public.email_templates ADD COLUMN version INTEGER DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_templates' AND column_name = 'is_active') THEN
    ALTER TABLE public.email_templates ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_templates' AND column_name = 'created_by') THEN
    ALTER TABLE public.email_templates ADD COLUMN created_by UUID REFERENCES public.admin_users(id);
  END IF;
END $$;

-- Comments on email_templates (only if columns exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_templates' AND column_name = 'variables') THEN
    COMMENT ON COLUMN public.email_templates.variables IS 'JSONB array of template variables: [{name: "firstName", type: "string", required: true, description: "..."}]';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_templates' AND column_name = 'html_template') THEN
    COMMENT ON COLUMN public.email_templates.html_template IS 'HTML version of the template for rich email clients';
  END IF;
END $$;

COMMENT ON TABLE public.email_templates IS 'Stores reusable email templates with support for versioning and variables';

-- Create SMTP configuration table (MOVED BEFORE email_dispatch_log)
CREATE TABLE IF NOT EXISTS public.smtp_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  provider TEXT NOT NULL CHECK (provider IN ('smtp', 'resend', 'sendgrid', 'mailgun', 'aws_ses')),
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_username TEXT,
  smtp_password TEXT,
  api_key TEXT,
  from_email email_address NOT NULL,
  from_name TEXT,
  reply_to_email email_address,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rate_limit INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.admin_users(id)
);

COMMENT ON TABLE public.smtp_configurations IS 'Dynamic SMTP and email API provider configurations';
COMMENT ON COLUMN public.smtp_configurations.provider IS 'Email service provider: smtp, resend, sendgrid, mailgun, aws_ses';

-- Create email_campaigns table (MOVED UP - other tables depend on it)
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  mailing_list_id UUID REFERENCES public.mailing_lists(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  status campaign_status DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.admin_users(id),
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0
);

COMMENT ON TABLE public.email_campaigns IS 'Stores email campaign information and tracking';
COMMENT ON COLUMN public.email_campaigns.body IS 'HTML content of the email campaign';
COMMENT ON COLUMN public.email_campaigns.template_id IS 'Optional reference to email template for campaign content';
COMMENT ON COLUMN public.email_campaigns.tags IS 'Array of tags for organizing campaigns';

-- Create campaign_analytics table (depends on email_campaigns)
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE UNIQUE,
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_unsubscribed INTEGER DEFAULT 0,
  open_rate DECIMAL(5, 2) DEFAULT 0,
  click_rate DECIMAL(5, 2) DEFAULT 0,
  bounce_rate DECIMAL(5, 2) DEFAULT 0,
  unsubscribe_rate DECIMAL(5, 2) DEFAULT 0,
  conversion_value DECIMAL(12, 2),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.campaign_analytics IS 'Aggregated analytics and metrics for campaigns';

-- Create email_suppression_list table (depends on email_campaigns)
CREATE TABLE IF NOT EXISTS public.email_suppression_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email email_address NOT NULL UNIQUE,
  reason TEXT CHECK (reason IN ('bounce', 'complaint', 'manual', 'unsubscribe', 'invalid')),
  source_campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE SET NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

COMMENT ON TABLE public.email_suppression_list IS 'Suppression list to prevent sending to bad emails';

-- Create campaign_recipients table (track individual sends)
CREATE TABLE IF NOT EXISTS public.campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  email email_address NOT NULL,
  personalized_subject TEXT,
  personalized_body TEXT,
  status recipient_status DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  CONSTRAINT campaign_recipients_unique_email_per_campaign UNIQUE(campaign_id, email)
);

COMMENT ON TABLE public.campaign_recipients IS 'Tracks individual email sends and their status for each campaign';
COMMENT ON COLUMN public.campaign_recipients.personalized_subject IS 'Subject with merge fields replaced with actual values';
COMMENT ON COLUMN public.campaign_recipients.personalized_body IS 'Body with merge fields replaced with actual values';
COMMENT ON COLUMN public.campaign_recipients.opened_at IS 'Timestamp when recipient opened the email (via tracking pixel)';
COMMENT ON COLUMN public.campaign_recipients.clicked_at IS 'Timestamp when recipient clicked a link';
COMMENT ON COLUMN public.campaign_recipients.next_retry_at IS 'When to retry failed send (exponential backoff)';

-- Create email_dispatch_log table (detailed tracking)
-- Moved here from earlier in file to satisfy foreign key dependencies
CREATE TABLE IF NOT EXISTS public.email_dispatch_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_recipient_id UUID NOT NULL REFERENCES public.campaign_recipients(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  email email_address NOT NULL,
  smtp_config_id UUID REFERENCES public.smtp_configurations(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'sending', 'sent', 'failed', 'bounced', 'blocked')),
  message_id TEXT UNIQUE,
  http_status_code INTEGER,
  response_body TEXT,
  error_details TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.email_dispatch_log IS 'Detailed log of each email dispatch attempt for debugging and analytics';
COMMENT ON COLUMN public.email_dispatch_log.message_id IS 'Provider-specific message ID for tracking';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.mailing_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mailing_list_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;

-- Mailing lists policies
CREATE POLICY "Admin users can manage mailing lists"
  ON public.mailing_lists FOR ALL
  USING (auth.role() = 'authenticated');

-- Mailing list subscribers policies
CREATE POLICY "Admin users can manage mailing list subscribers"
  ON public.mailing_list_subscribers FOR ALL
  USING (auth.role() = 'authenticated');

-- Email campaigns policies
CREATE POLICY "Admin users can manage email campaigns"
  ON public.email_campaigns FOR ALL
  USING (auth.role() = 'authenticated');

-- Campaign recipients policies
CREATE POLICY "Admin users can view campaign recipients"
  ON public.campaign_recipients FOR SELECT
  USING (auth.role() = 'authenticated');

-- NOTE: These policies allow system-level operations for campaign sending
-- In production, consider implementing service role authentication
-- or using a more restrictive policy that validates against campaign ownership
CREATE POLICY "Authenticated users can insert campaign recipients"
  ON public.campaign_recipients FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update campaign recipients"
  ON public.campaign_recipients FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS mailing_lists_created_by_idx ON public.mailing_lists(created_by);
CREATE INDEX IF NOT EXISTS mailing_list_subscribers_list_idx ON public.mailing_list_subscribers(mailing_list_id);
CREATE INDEX IF NOT EXISTS mailing_list_subscribers_email_idx ON public.mailing_list_subscribers(email);
CREATE INDEX IF NOT EXISTS email_campaigns_status_idx ON public.email_campaigns(status);
CREATE INDEX IF NOT EXISTS email_campaigns_list_idx ON public.email_campaigns(mailing_list_id);
CREATE INDEX IF NOT EXISTS email_campaigns_template_idx ON public.email_campaigns(template_id) WHERE template_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS email_campaigns_tags_idx ON public.email_campaigns USING gin(tags);
CREATE INDEX IF NOT EXISTS campaign_recipients_campaign_idx ON public.campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS campaign_recipients_status_idx ON public.campaign_recipients(status);

-- JSONB index for efficient custom_fields queries
CREATE INDEX IF NOT EXISTS mailing_list_subscribers_custom_fields_idx 
  ON public.mailing_list_subscribers USING gin(custom_fields);

COMMENT ON INDEX mailing_list_subscribers_custom_fields_idx IS 'GIN index for efficient JSONB queries on custom_fields using @>, ?, ?&, ?| operators';

-- Partial index for active subscribers (most common query)
CREATE INDEX IF NOT EXISTS mailing_list_subscribers_active_idx 
  ON public.mailing_list_subscribers(mailing_list_id, email) 
  WHERE status = 'active';

COMMENT ON INDEX mailing_list_subscribers_active_idx IS 'Partial index for efficient queries on active subscribers only';

-- Composite index for campaign recipient lookups by campaign and status
CREATE INDEX IF NOT EXISTS campaign_recipients_campaign_status_idx 
  ON public.campaign_recipients(campaign_id, status);

COMMENT ON INDEX campaign_recipients_campaign_status_idx IS 'Composite index for efficient filtering by campaign and delivery status';

-- ============================================================================
-- ADDITIONAL INDEXES FOR ENHANCED FEATURES
-- ============================================================================

-- Indexes on email_templates
CREATE INDEX IF NOT EXISTS email_templates_category_idx ON public.email_templates(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS email_templates_tags_idx ON public.email_templates USING gin(tags);
CREATE INDEX IF NOT EXISTS email_templates_created_by_idx ON public.email_templates(created_by);

-- Indexes on SMTP configurations
CREATE INDEX IF NOT EXISTS smtp_configurations_provider_idx ON public.smtp_configurations(provider) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS smtp_configurations_default_idx ON public.smtp_configurations(is_default) WHERE is_default = true;

-- Indexes on campaign_recipients (engagement tracking)
CREATE INDEX IF NOT EXISTS campaign_recipients_email_idx ON public.campaign_recipients(email);
CREATE INDEX IF NOT EXISTS campaign_recipients_opened_idx ON public.campaign_recipients(campaign_id, opened_at) WHERE opened_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS campaign_recipients_clicked_idx ON public.campaign_recipients(campaign_id, clicked_at) WHERE clicked_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS campaign_recipients_unsubscribed_idx ON public.campaign_recipients(unsubscribed_at) WHERE unsubscribed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS campaign_recipients_retry_idx ON public.campaign_recipients(next_retry_at) WHERE status = 'failed' AND next_retry_at IS NOT NULL;

-- Indexes on subscriber_preferences
CREATE INDEX IF NOT EXISTS subscriber_preferences_notification_freq_idx ON public.subscriber_preferences(notification_frequency);
CREATE INDEX IF NOT EXISTS subscriber_preferences_categories_idx ON public.subscriber_preferences USING gin(email_categories);

-- Indexes on email_dispatch_log
CREATE INDEX IF NOT EXISTS email_dispatch_log_campaign_id_idx ON public.email_dispatch_log(campaign_id);
CREATE INDEX IF NOT EXISTS email_dispatch_log_email_idx ON public.email_dispatch_log(email);
CREATE INDEX IF NOT EXISTS email_dispatch_log_status_idx ON public.email_dispatch_log(status);
CREATE INDEX IF NOT EXISTS email_dispatch_log_message_id_idx ON public.email_dispatch_log(message_id) WHERE message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS email_dispatch_log_retry_idx ON public.email_dispatch_log(next_retry_at) WHERE status = 'failed' AND next_retry_at IS NOT NULL;

-- Indexes on suppression list
CREATE INDEX IF NOT EXISTS email_suppression_list_reason_idx ON public.email_suppression_list(reason);
CREATE INDEX IF NOT EXISTS email_suppression_list_expires_idx ON public.email_suppression_list(expires_at) WHERE expires_at IS NOT NULL;

-- Indexes on campaign_analytics
CREATE INDEX IF NOT EXISTS campaign_analytics_campaign_idx ON public.campaign_analytics(campaign_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update mailing list subscriber count
CREATE OR REPLACE FUNCTION update_mailing_list_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.mailing_lists
    SET total_subscribers = total_subscribers + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.mailing_list_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.mailing_lists
    SET total_subscribers = GREATEST(0, total_subscribers - 1),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.mailing_list_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_mailing_list_count() IS 'Automatically updates the total_subscribers count in mailing_lists when subscribers are added or removed';

-- Create trigger for mailing list count (fires only when needed)
DROP TRIGGER IF EXISTS update_mailing_list_count_trigger ON public.mailing_list_subscribers;
CREATE TRIGGER update_mailing_list_count_trigger
AFTER INSERT OR DELETE ON public.mailing_list_subscribers
FOR EACH ROW
EXECUTE FUNCTION update_mailing_list_count();

-- Function to update campaign recipient count
CREATE OR REPLACE FUNCTION update_campaign_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.email_campaigns
    SET total_recipients = total_recipients + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.campaign_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only update if status actually changed
    IF NEW.status = 'sent' AND OLD.status != 'sent' THEN
      UPDATE public.email_campaigns
      SET total_sent = total_sent + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.campaign_id;
    ELSIF NEW.status = 'failed' AND OLD.status != 'failed' THEN
      UPDATE public.email_campaigns
      SET total_failed = total_failed + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.campaign_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_campaign_counts() IS 'Automatically updates recipient counts in email_campaigns when recipients are added or their status changes';

-- Create trigger for campaign counts (fire on insert or status update)
DROP TRIGGER IF EXISTS update_campaign_counts_trigger ON public.campaign_recipients;
CREATE TRIGGER update_campaign_counts_trigger
AFTER INSERT OR UPDATE OF status ON public.campaign_recipients
FOR EACH ROW
EXECUTE FUNCTION update_campaign_counts();

-- ============================================================================
-- ADVANCED ENGAGEMENT TRACKING FUNCTIONS
-- ============================================================================

-- Function to update campaign analytics on recipient status change
CREATE OR REPLACE FUNCTION update_campaign_analytics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.campaign_analytics (campaign_id, total_sent)
    VALUES (NEW.campaign_id, 1)
    ON CONFLICT (campaign_id) DO UPDATE
    SET total_sent = total_sent + 1,
        last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Track opens
    IF NEW.opened_at IS NOT NULL AND OLD.opened_at IS NULL THEN
      UPDATE public.campaign_analytics
      SET total_opened = total_opened + 1,
          open_rate = CASE WHEN total_sent > 0 THEN (total_opened + 1)::DECIMAL / total_sent * 100 ELSE 0 END,
          last_updated = CURRENT_TIMESTAMP
      WHERE campaign_id = NEW.campaign_id;
    END IF;
    
    -- Track clicks
    IF NEW.clicked_at IS NOT NULL AND OLD.clicked_at IS NULL THEN
      UPDATE public.campaign_analytics
      SET total_clicked = total_clicked + 1,
          click_rate = CASE WHEN total_sent > 0 THEN (total_clicked + 1)::DECIMAL / total_sent * 100 ELSE 0 END,
          last_updated = CURRENT_TIMESTAMP
      WHERE campaign_id = NEW.campaign_id;
    END IF;
    
    -- Track bounces
    IF NEW.status = 'bounced' AND OLD.status != 'bounced' THEN
      UPDATE public.campaign_analytics
      SET total_bounced = total_bounced + 1,
          bounce_rate = CASE WHEN total_sent > 0 THEN (total_bounced + 1)::DECIMAL / total_sent * 100 ELSE 0 END,
          last_updated = CURRENT_TIMESTAMP
      WHERE campaign_id = NEW.campaign_id;
    END IF;
    
    -- Track unsubscribes
    IF NEW.unsubscribed_at IS NOT NULL AND OLD.unsubscribed_at IS NULL THEN
      UPDATE public.campaign_analytics
      SET total_unsubscribed = total_unsubscribed + 1,
          unsubscribe_rate = CASE WHEN total_sent > 0 THEN (total_unsubscribed + 1)::DECIMAL / total_sent * 100 ELSE 0 END,
          last_updated = CURRENT_TIMESTAMP
      WHERE campaign_id = NEW.campaign_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_campaign_analytics() IS 'Updates campaign analytics and engagement metrics in real-time';

-- Create trigger for analytics updates
DROP TRIGGER IF EXISTS update_campaign_analytics_trigger ON public.campaign_recipients;
CREATE TRIGGER update_campaign_analytics_trigger
AFTER INSERT OR UPDATE OF opened_at, clicked_at, unsubscribed_at, status ON public.campaign_recipients
FOR EACH ROW
EXECUTE FUNCTION update_campaign_analytics();

-- Function to auto-add bounced/complained emails to suppression list
CREATE OR REPLACE FUNCTION add_to_suppression_list()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'bounced' THEN
    INSERT INTO public.email_suppression_list (email, reason, source_campaign_id)
    VALUES (NEW.email, 'bounce', NEW.campaign_id)
    ON CONFLICT (email) DO NOTHING;
  ELSIF NEW.status = 'failed' AND NEW.error_message LIKE '%complaint%' THEN
    INSERT INTO public.email_suppression_list (email, reason, source_campaign_id)
    VALUES (NEW.email, 'complaint', NEW.campaign_id)
    ON CONFLICT (email) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION add_to_suppression_list() IS 'Automatically adds bounced/complained emails to suppression list';

-- Create trigger for suppression list
DROP TRIGGER IF EXISTS add_to_suppression_list_trigger ON public.campaign_recipients;
CREATE TRIGGER add_to_suppression_list_trigger
AFTER UPDATE OF status ON public.campaign_recipients
FOR EACH ROW
WHEN (NEW.status IN ('bounced', 'failed'))
EXECUTE FUNCTION add_to_suppression_list();

-- Function to update subscriber activity timestamp
CREATE OR REPLACE FUNCTION update_subscriber_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.subscriber_preferences
  SET last_activity_at = CURRENT_TIMESTAMP
  WHERE mailing_list_subscriber_id = (
    SELECT id FROM public.mailing_list_subscribers 
    WHERE email = NEW.email
    LIMIT 1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_subscriber_activity() IS 'Tracks subscriber engagement activity timestamp';

-- Create trigger for subscriber activity
DROP TRIGGER IF EXISTS update_subscriber_activity_trigger ON public.campaign_recipients;
CREATE TRIGGER update_subscriber_activity_trigger
AFTER UPDATE OF opened_at, clicked_at ON public.campaign_recipients
FOR EACH ROW
WHEN (NEW.opened_at IS NOT NULL OR NEW.clicked_at IS NOT NULL)
EXECUTE FUNCTION update_subscriber_activity();

-- ============================================================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smtp_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriber_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_dispatch_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_suppression_list ENABLE ROW LEVEL SECURITY;

-- Email templates policies
CREATE POLICY "Admin users can manage email templates"
  ON public.email_templates FOR ALL
  USING (auth.role() = 'authenticated');

-- SMTP configurations policies (sensitive - restricted access)
CREATE POLICY "Admin users can manage SMTP configurations"
  ON public.smtp_configurations FOR ALL
  USING (auth.role() = 'authenticated');

-- Subscriber preferences policies
CREATE POLICY "Admin users can manage subscriber preferences"
  ON public.subscriber_preferences FOR ALL
  USING (auth.role() = 'authenticated');

-- Email dispatch log policies
CREATE POLICY "Admin users can view dispatch logs"
  ON public.email_dispatch_log FOR SELECT
  USING (auth.role() = 'authenticated');

-- Campaign analytics policies
CREATE POLICY "Admin users can view campaign analytics"
  ON public.campaign_analytics FOR ALL
  USING (auth.role() = 'authenticated');

-- Email suppression list policies
CREATE POLICY "Admin users can manage suppression list"
  ON public.email_suppression_list FOR ALL
  USING (auth.role() = 'authenticated');
