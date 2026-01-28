-- ⚠️ DEPRECATED: This script is replaced by the Supabase migration system
-- Use instead: supabase/migrations/20251226053932_create_email_campaigns_schema.sql
--
-- If you've already run this script, you can mark the migration as applied:
-- supabase migration repair 20251226053932 --status applied
--
-- For new deployments, use:
-- supabase db push
--
-- See MIGRATION_GUIDE.md for full instructions
--
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

-- Create mailing_list_subscribers table
CREATE TABLE IF NOT EXISTS public.mailing_list_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mailing_list_id UUID NOT NULL REFERENCES public.mailing_lists(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  UNIQUE(mailing_list_id, email)
);

-- Create email_campaigns table
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  mailing_list_id UUID REFERENCES public.mailing_lists(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.admin_users(id),
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0
);

-- Create campaign_recipients table (track individual sends)
CREATE TABLE IF NOT EXISTS public.campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  personalized_subject TEXT,
  personalized_body TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  UNIQUE(campaign_id, email)
);

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS mailing_lists_created_by_idx ON public.mailing_lists(created_by);
CREATE INDEX IF NOT EXISTS mailing_list_subscribers_list_idx ON public.mailing_list_subscribers(mailing_list_id);
CREATE INDEX IF NOT EXISTS mailing_list_subscribers_email_idx ON public.mailing_list_subscribers(email);
CREATE INDEX IF NOT EXISTS email_campaigns_status_idx ON public.email_campaigns(status);
CREATE INDEX IF NOT EXISTS email_campaigns_list_idx ON public.email_campaigns(mailing_list_id);
CREATE INDEX IF NOT EXISTS email_campaigns_tags_idx ON public.email_campaigns USING gin(tags);
CREATE INDEX IF NOT EXISTS campaign_recipients_campaign_idx ON public.campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS campaign_recipients_status_idx ON public.campaign_recipients(status);

-- Function to update mailing list subscriber count
CREATE OR REPLACE FUNCTION update_mailing_list_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.mailing_lists
    SET total_subscribers = total_subscribers + 1,
        updated_at = NOW()
    WHERE id = NEW.mailing_list_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.mailing_lists
    SET total_subscribers = GREATEST(0, total_subscribers - 1),
        updated_at = NOW()
    WHERE id = OLD.mailing_list_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for mailing list count
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
        updated_at = NOW()
    WHERE id = NEW.campaign_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'sent' AND OLD.status != 'sent' THEN
    UPDATE public.email_campaigns
    SET total_sent = total_sent + 1,
        updated_at = NOW()
    WHERE id = NEW.campaign_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'failed' AND OLD.status != 'failed' THEN
    UPDATE public.email_campaigns
    SET total_failed = total_failed + 1,
        updated_at = NOW()
    WHERE id = NEW.campaign_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for campaign counts
DROP TRIGGER IF EXISTS update_campaign_counts_trigger ON public.campaign_recipients;
CREATE TRIGGER update_campaign_counts_trigger
AFTER INSERT OR UPDATE ON public.campaign_recipients
FOR EACH ROW
EXECUTE FUNCTION update_campaign_counts();
