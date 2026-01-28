-- Migration: Add Enterprise and Team Management Tables
-- Description: Creates tables for enterprise ticket purchases and team member management
-- Date: 2026-01-08

-- ============================================================================
-- ENTERPRISE MEMBERS TABLE
-- Based on types/user.ts EnterpriseMember interface
-- ============================================================================

CREATE TABLE IF NOT EXISTS enterprise_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_email TEXT NOT NULL,
  member_name TEXT,
  member_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invitation_status TEXT DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'accepted', 'declined', 'expired')),
  invitation_token TEXT UNIQUE,
  invitation_expires_at TIMESTAMPTZ,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_enterprise_members_enterprise_user ON enterprise_members(enterprise_user_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_members_member_email ON enterprise_members(member_email);
CREATE INDEX IF NOT EXISTS idx_enterprise_members_status ON enterprise_members(invitation_status);
CREATE INDEX IF NOT EXISTS idx_enterprise_members_token ON enterprise_members(invitation_token);

-- RLS
ALTER TABLE enterprise_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their enterprise members" ON enterprise_members
  FOR SELECT USING (
    auth.uid() = enterprise_user_id OR 
    auth.uid() = member_user_id
  );

CREATE POLICY "Users can manage their enterprise members" ON enterprise_members
  FOR ALL USING (auth.uid() = enterprise_user_id);

-- ============================================================================
-- BARCODE SCANS TABLE
-- Based on types/user.ts BarcodeScan interface
-- ============================================================================

CREATE TABLE IF NOT EXISTS barcode_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scanner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scanned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  scanned_ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('profile', 'ticket', 'checkin')),
  scan_data TEXT,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_barcode_scans_scanner ON barcode_scans(scanner_user_id);
CREATE INDEX IF NOT EXISTS idx_barcode_scans_scanned_user ON barcode_scans(scanned_user_id);
CREATE INDEX IF NOT EXISTS idx_barcode_scans_scanned_ticket ON barcode_scans(scanned_ticket_id);
CREATE INDEX IF NOT EXISTS idx_barcode_scans_type ON barcode_scans(scan_type);
CREATE INDEX IF NOT EXISTS idx_barcode_scans_scanned_at ON barcode_scans(scanned_at DESC);

-- RLS
ALTER TABLE barcode_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scans" ON barcode_scans
  FOR SELECT USING (
    auth.uid() = scanner_user_id OR 
    auth.uid() = scanned_user_id
  );

CREATE POLICY "Users can create scans" ON barcode_scans
  FOR INSERT WITH CHECK (auth.uid() = scanner_user_id);

-- ============================================================================
-- SHARING TEMPLATES TABLE
-- Based on types/user.ts SharingTemplate interface
-- ============================================================================

CREATE TABLE IF NOT EXISTS sharing_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL CHECK (template_type IN ('speaker', 'attendee', 'sponsor', 'custom')),
  template_name TEXT NOT NULL,
  template_content JSONB NOT NULL,
  platforms TEXT[] DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sharing_templates_user_id ON sharing_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_sharing_templates_type ON sharing_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_sharing_templates_default ON sharing_templates(is_default);

-- RLS
ALTER TABLE sharing_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own templates" ON sharing_templates
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- SPEAKER COMMUNICATIONS TABLE
-- Based on types/user.ts SpeakerCommunication interface
-- ============================================================================

CREATE TABLE IF NOT EXISTS speaker_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  speaker_id UUID NOT NULL,
  speaker_application_id UUID REFERENCES speaker_applications(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('application_received', 'approved', 'rejected', 'session_assigned', 'reminder', 'thank_you', 'custom')),
  subject TEXT,
  content TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  sent_by UUID REFERENCES admin_users(id),
  email_id TEXT, -- External email service ID
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_speaker_communications_speaker_id ON speaker_communications(speaker_id);
CREATE INDEX IF NOT EXISTS idx_speaker_communications_application_id ON speaker_communications(speaker_application_id);
CREATE INDEX IF NOT EXISTS idx_speaker_communications_type ON speaker_communications(type);
CREATE INDEX IF NOT EXISTS idx_speaker_communications_sent_at ON speaker_communications(sent_at DESC);

-- RLS
ALTER TABLE speaker_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage speaker communications" ON speaker_communications
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND is_active = true)
  );

-- ============================================================================
-- ADD UPDATED_AT TRIGGERS
-- ============================================================================

CREATE TRIGGER update_enterprise_members_updated_at
  BEFORE UPDATE ON enterprise_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sharing_templates_updated_at
  BEFORE UPDATE ON sharing_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON enterprise_members, barcode_scans, sharing_templates, speaker_communications TO authenticated;
GRANT SELECT ON enterprise_members, barcode_scans, sharing_templates TO anon;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE enterprise_members IS 'Tracks team members for enterprise ticket purchases';
COMMENT ON TABLE barcode_scans IS 'Records QR code/barcode scans for profiles and tickets';
COMMENT ON TABLE sharing_templates IS 'User-customizable templates for social media sharing';
COMMENT ON TABLE speaker_communications IS 'Tracks all communications sent to speakers';
