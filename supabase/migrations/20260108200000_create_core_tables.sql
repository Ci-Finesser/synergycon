-- Migration: Create Core Tables
-- Description: Creates foundational tables that other migrations depend on
-- Date: 2026-01-08
-- This ensures all core tables exist before other migrations reference them

-- ============================================================================
-- ADMIN USERS TABLE (admin_users)
-- Unified admin table to replace inconsistent naming (admins vs admin_users)
-- ============================================================================

-- First, add missing columns to existing admin_users table if it exists
DO $$
BEGIN
  -- Add missing columns to admin_users if they don't exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_users') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'full_name') THEN
      ALTER TABLE admin_users ADD COLUMN full_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'permissions') THEN
      ALTER TABLE admin_users ADD COLUMN permissions JSONB DEFAULT '[]'::JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'is_active') THEN
      ALTER TABLE admin_users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'last_login_at') THEN
      ALTER TABLE admin_users ADD COLUMN last_login_at TIMESTAMPTZ;
    END IF;
  ELSE
    -- Create admin_users table if it doesn't exist
    CREATE TABLE admin_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      full_name TEXT,
      role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
      permissions JSONB DEFAULT '[]'::JSONB,
      is_active BOOLEAN DEFAULT true,
      last_login_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Sync full_name with name for compatibility
CREATE OR REPLACE FUNCTION sync_admin_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.full_name IS NULL AND NEW.name IS NOT NULL THEN
    NEW.full_name := NEW.name;
  ELSIF NEW.name IS NULL AND NEW.full_name IS NOT NULL THEN
    NEW.name := NEW.full_name;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_admin_name_trigger ON admin_users;
CREATE TRIGGER sync_admin_name_trigger
  BEFORE INSERT OR UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION sync_admin_name();

-- Indexes (wrapped in DO block for safety)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'is_active') THEN
    CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- RLS (safe to re-run)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating (idempotent)
DROP POLICY IF EXISTS "System manages admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admins can view other admins" ON admin_users;

CREATE POLICY "System manages admin_users" ON admin_users 
  FOR ALL TO service_role USING (true);

-- Recreate policy only if is_active column exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'is_active') THEN
    EXECUTE 'CREATE POLICY "Admins can view other admins" ON admin_users FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid() AND au.is_active = true))';
  ELSE
    EXECUTE 'CREATE POLICY "Admins can view other admins" ON admin_users FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM admin_users au WHERE au.id = auth.uid()))';
  END IF;
END $$;

-- ============================================================================
-- LEGACY ADMINS VIEW (for backward compatibility)
-- ============================================================================

-- Create view dynamically based on which columns exist
DO $$
DECLARE
  has_name BOOLEAN;
  has_full_name BOOLEAN;
  name_col TEXT;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'name') INTO has_name;
  SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'full_name') INTO has_full_name;
  
  IF has_full_name AND has_name THEN
    name_col := 'COALESCE(full_name, name)';
  ELSIF has_full_name THEN
    name_col := 'full_name';
  ELSIF has_name THEN
    name_col := 'name';
  ELSE
    name_col := '''Unknown''';
  END IF;
  
  EXECUTE format('CREATE OR REPLACE VIEW admins AS SELECT id, email, password_hash, %s as full_name, role, created_at, updated_at FROM admin_users', name_col);
END $$;

-- ============================================================================
-- REGISTRATIONS TABLE
-- Core table for event registrations
-- ============================================================================

-- Add missing columns to existing registrations table or create new
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'registrations') THEN
    -- Add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'registrations' AND column_name = 'user_id') THEN
      ALTER TABLE registrations ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'registrations' AND column_name = 'industry') THEN
      ALTER TABLE registrations ADD COLUMN industry TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'registrations' AND column_name = 'attendance_reason') THEN
      ALTER TABLE registrations ADD COLUMN attendance_reason TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'registrations' AND column_name = 'expectations') THEN
      ALTER TABLE registrations ADD COLUMN expectations TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'registrations' AND column_name = 'special_needs') THEN
      ALTER TABLE registrations ADD COLUMN special_needs TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'registrations' AND column_name = 'tickets') THEN
      ALTER TABLE registrations ADD COLUMN tickets JSONB DEFAULT '[]'::JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'registrations' AND column_name = 'payment_status') THEN
      ALTER TABLE registrations ADD COLUMN payment_status TEXT DEFAULT 'pending';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'registrations' AND column_name = 'confirmed_at') THEN
      ALTER TABLE registrations ADD COLUMN confirmed_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'registrations' AND column_name = 'updated_at') THEN
      ALTER TABLE registrations ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
  ELSE
    CREATE TABLE registrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      order_id TEXT UNIQUE,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone_number TEXT,
      organization TEXT,
      role TEXT,
      industry TEXT,
      how_did_you_hear TEXT,
      why_attend TEXT,
      attendance_reason TEXT,
      expectations TEXT,
      dietary_requirements TEXT,
      special_needs TEXT,
      tickets JSONB DEFAULT '[]'::JSONB,
      total_amount DECIMAL(12,2) DEFAULT 0,
      payment_status TEXT DEFAULT 'pending',
      status TEXT DEFAULT 'pending',
      confirmed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Indexes (conditional on column existence)
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'registrations' AND column_name = 'order_id') THEN
    CREATE INDEX IF NOT EXISTS idx_registrations_order_id ON registrations(order_id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'registrations' AND column_name = 'status') THEN
    CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'registrations' AND column_name = 'payment_status') THEN
    CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'registrations' AND column_name = 'created_at') THEN
    CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at DESC);
  END IF;
END $$;

-- RLS
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert registrations" ON registrations;
DROP POLICY IF EXISTS "Users can view own registrations" ON registrations;
DROP POLICY IF EXISTS "Admins can manage registrations" ON registrations;

CREATE POLICY "Public can insert registrations" ON registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own registrations" ON registrations
  FOR SELECT USING (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'is_active') THEN
    EXECUTE 'CREATE POLICY "Admins can manage registrations" ON registrations FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND is_active = true))';
  ELSE
    EXECUTE 'CREATE POLICY "Admins can manage registrations" ON registrations FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))';
  END IF;
END $$;

-- ============================================================================
-- SPEAKERS TABLE
-- Manages speaker profiles
-- ============================================================================

-- Add missing columns to existing speakers table or create new
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'speakers') THEN
    -- Add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'speakers' AND column_name = 'user_id') THEN
      ALTER TABLE speakers ADD COLUMN user_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'speakers' AND column_name = 'position') THEN
      ALTER TABLE speakers ADD COLUMN position TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'speakers' AND column_name = 'topic') THEN
      ALTER TABLE speakers ADD COLUMN topic TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'speakers' AND column_name = 'speaker_role') THEN
      ALTER TABLE speakers ADD COLUMN speaker_role TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'speakers' AND column_name = 'event_day') THEN
      ALTER TABLE speakers ADD COLUMN event_day INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'speakers' AND column_name = 'instagram_url') THEN
      ALTER TABLE speakers ADD COLUMN instagram_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'speakers' AND column_name = 'website_url') THEN
      ALTER TABLE speakers ADD COLUMN website_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'speakers' AND column_name = 'confirmed') THEN
      ALTER TABLE speakers ADD COLUMN confirmed BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'speakers' AND column_name = 'status') THEN
      ALTER TABLE speakers ADD COLUMN status TEXT DEFAULT 'draft';
    END IF;
  ELSE
    CREATE TABLE speakers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      bio TEXT NOT NULL,
      company TEXT,
      position TEXT,
      image_url TEXT,
      topic TEXT,
      speaker_role TEXT,
      event_day INTEGER,
      linkedin_url TEXT,
      twitter_url TEXT,
      instagram_url TEXT,
      website_url TEXT,
      featured BOOLEAN DEFAULT false,
      confirmed BOOLEAN DEFAULT false,
      status TEXT DEFAULT 'draft',
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Indexes (only create if columns exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'speakers' AND column_name = 'featured') THEN
    CREATE INDEX IF NOT EXISTS idx_speakers_featured ON speakers(featured);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'speakers' AND column_name = 'status') THEN
    CREATE INDEX IF NOT EXISTS idx_speakers_status ON speakers(status);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'speakers' AND column_name = 'event_day') THEN
    CREATE INDEX IF NOT EXISTS idx_speakers_event_day ON speakers(event_day);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'speakers' AND column_name = 'display_order') THEN
    CREATE INDEX IF NOT EXISTS idx_speakers_display_order ON speakers(display_order);
  END IF;
END $$;

-- RLS
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view live speakers" ON speakers;
DROP POLICY IF EXISTS "Public can view speakers" ON speakers;
DROP POLICY IF EXISTS "Admins can manage speakers" ON speakers;

CREATE POLICY "Public can view speakers" ON speakers
  FOR SELECT USING (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'is_active') THEN
    EXECUTE 'CREATE POLICY "Admins can manage speakers" ON speakers FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND is_active = true))';
  ELSE
    EXECUTE 'CREATE POLICY "Admins can manage speakers" ON speakers FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))';
  END IF;
END $$;

-- ============================================================================
-- SPONSORS TABLE
-- Manages sponsor/partner profiles
-- ============================================================================

-- Add missing columns to existing sponsors table or create new
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sponsors') THEN
    -- Add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sponsors' AND column_name = 'user_id') THEN
      ALTER TABLE sponsors ADD COLUMN user_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sponsors' AND column_name = 'bio') THEN
      ALTER TABLE sponsors ADD COLUMN bio TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sponsors' AND column_name = 'category') THEN
      ALTER TABLE sponsors ADD COLUMN category TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sponsors' AND column_name = 'sub_category') THEN
      ALTER TABLE sponsors ADD COLUMN sub_category TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sponsors' AND column_name = 'contact_email') THEN
      ALTER TABLE sponsors ADD COLUMN contact_email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sponsors' AND column_name = 'contact_phone') THEN
      ALTER TABLE sponsors ADD COLUMN contact_phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sponsors' AND column_name = 'featured') THEN
      ALTER TABLE sponsors ADD COLUMN featured BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sponsors' AND column_name = 'status') THEN
      ALTER TABLE sponsors ADD COLUMN status TEXT DEFAULT 'draft';
    END IF;
  ELSE
    CREATE TABLE sponsors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID,
      name TEXT NOT NULL,
      logo_url TEXT NOT NULL,
      website_url TEXT,
      description TEXT,
      bio TEXT,
      tier TEXT,
      category TEXT,
      sub_category TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      featured BOOLEAN DEFAULT false,
      status TEXT DEFAULT 'draft',
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Indexes (only create if columns exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sponsors' AND column_name = 'tier') THEN
    CREATE INDEX IF NOT EXISTS idx_sponsors_tier ON sponsors(tier);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sponsors' AND column_name = 'category') THEN
    CREATE INDEX IF NOT EXISTS idx_sponsors_category ON sponsors(category);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sponsors' AND column_name = 'featured') THEN
    CREATE INDEX IF NOT EXISTS idx_sponsors_featured ON sponsors(featured);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sponsors' AND column_name = 'status') THEN
    CREATE INDEX IF NOT EXISTS idx_sponsors_status ON sponsors(status);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sponsors' AND column_name = 'display_order') THEN
    CREATE INDEX IF NOT EXISTS idx_sponsors_display_order ON sponsors(display_order);
  END IF;
END $$;

-- RLS
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view live sponsors" ON sponsors;
DROP POLICY IF EXISTS "Public can view sponsors" ON sponsors;
DROP POLICY IF EXISTS "Admins can manage sponsors" ON sponsors;

CREATE POLICY "Public can view sponsors" ON sponsors
  FOR SELECT USING (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'is_active') THEN
    EXECUTE 'CREATE POLICY "Admins can manage sponsors" ON sponsors FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND is_active = true))';
  ELSE
    EXECUTE 'CREATE POLICY "Admins can manage sponsors" ON sponsors FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))';
  END IF;
END $$;

-- ============================================================================
-- TESTIMONIALS TABLE
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'testimonials') THEN
    -- Add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'company') THEN
      ALTER TABLE testimonials ADD COLUMN company TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'display_order') THEN
      ALTER TABLE testimonials ADD COLUMN display_order INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'is_active') THEN
      ALTER TABLE testimonials ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
  ELSE
    CREATE TABLE testimonials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      company TEXT,
      quote TEXT NOT NULL,
      image_url TEXT,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'display_order') THEN
    CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON testimonials(display_order);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'is_active') THEN
    CREATE INDEX IF NOT EXISTS idx_testimonials_is_active ON testimonials(is_active);
  END IF;
END $$;

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;

CREATE POLICY "Public can view active testimonials" ON testimonials
  FOR SELECT USING (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'is_active') THEN
    EXECUTE 'CREATE POLICY "Admins can manage testimonials" ON testimonials FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND is_active = true))';
  ELSE
    EXECUTE 'CREATE POLICY "Admins can manage testimonials" ON testimonials FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))';
  END IF;
END $$;

-- ============================================================================
-- GALLERY ITEMS TABLE
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'gallery_items') THEN
    -- Add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'gallery_items' AND column_name = 'type') THEN
      ALTER TABLE gallery_items ADD COLUMN type TEXT DEFAULT 'image';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'gallery_items' AND column_name = 'youtube_url') THEN
      ALTER TABLE gallery_items ADD COLUMN youtube_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'gallery_items' AND column_name = 'content') THEN
      ALTER TABLE gallery_items ADD COLUMN content TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'gallery_items' AND column_name = 'category') THEN
      ALTER TABLE gallery_items ADD COLUMN category TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'gallery_items' AND column_name = 'display_order') THEN
      ALTER TABLE gallery_items ADD COLUMN display_order INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'gallery_items' AND column_name = 'is_active') THEN
      ALTER TABLE gallery_items ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
  ELSE
    CREATE TABLE gallery_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL DEFAULT 'image',
      media_url TEXT,
      youtube_url TEXT,
      content TEXT,
      category TEXT,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'gallery_items' AND column_name = 'type') THEN
    CREATE INDEX IF NOT EXISTS idx_gallery_items_type ON gallery_items(type);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'gallery_items' AND column_name = 'category') THEN
    CREATE INDEX IF NOT EXISTS idx_gallery_items_category ON gallery_items(category);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'gallery_items' AND column_name = 'display_order') THEN
    CREATE INDEX IF NOT EXISTS idx_gallery_items_display_order ON gallery_items(display_order);
  END IF;
END $$;

ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Admins can manage gallery" ON gallery_items;

CREATE POLICY "Public can view active gallery items" ON gallery_items
  FOR SELECT USING (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'is_active') THEN
    EXECUTE 'CREATE POLICY "Admins can manage gallery" ON gallery_items FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND is_active = true))';
  ELSE
    EXECUTE 'CREATE POLICY "Admins can manage gallery" ON gallery_items FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))';
  END IF;
END $$;

-- ============================================================================
-- SCHEDULE SESSIONS TABLE
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'schedule_sessions') THEN
    -- Add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schedule_sessions' AND column_name = 'start_time') THEN
      ALTER TABLE schedule_sessions ADD COLUMN start_time TIME;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schedule_sessions' AND column_name = 'end_time') THEN
      ALTER TABLE schedule_sessions ADD COLUMN end_time TIME;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schedule_sessions' AND column_name = 'session_type') THEN
      ALTER TABLE schedule_sessions ADD COLUMN session_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schedule_sessions' AND column_name = 'speaker_id') THEN
      ALTER TABLE schedule_sessions ADD COLUMN speaker_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schedule_sessions' AND column_name = 'capacity') THEN
      ALTER TABLE schedule_sessions ADD COLUMN capacity INTEGER DEFAULT 50;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schedule_sessions' AND column_name = 'is_active') THEN
      ALTER TABLE schedule_sessions ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
  ELSE
    CREATE TABLE schedule_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      day INTEGER NOT NULL,
      district TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      start_time TIME,
      end_time TIME,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      session_type TEXT NOT NULL,
      location TEXT NOT NULL,
      venue TEXT NOT NULL,
      speaker TEXT,
      speaker_id UUID,
      capacity INTEGER DEFAULT 50,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schedule_sessions' AND column_name = 'day') THEN
    CREATE INDEX IF NOT EXISTS idx_schedule_sessions_day ON schedule_sessions(day);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schedule_sessions' AND column_name = 'session_type') THEN
    CREATE INDEX IF NOT EXISTS idx_schedule_sessions_session_type ON schedule_sessions(session_type);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schedule_sessions' AND column_name = 'is_active') THEN
    CREATE INDEX IF NOT EXISTS idx_schedule_sessions_is_active ON schedule_sessions(is_active);
  END IF;
END $$;

ALTER TABLE schedule_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active sessions" ON schedule_sessions;
DROP POLICY IF EXISTS "Admins can manage schedule" ON schedule_sessions;

CREATE POLICY "Public can view active sessions" ON schedule_sessions
  FOR SELECT USING (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'is_active') THEN
    EXECUTE 'CREATE POLICY "Admins can manage schedule" ON schedule_sessions FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid() AND is_active = true))';
  ELSE
    EXECUTE 'CREATE POLICY "Admins can manage schedule" ON schedule_sessions FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))';
  END IF;
END $$;

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY['admin_users', 'registrations', 'speakers', 'sponsors', 'testimonials', 'gallery_items', 'schedule_sessions'];
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %s', tbl, tbl);
    EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', tbl, tbl);
  END LOOP;
END;
$$;

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON speakers, sponsors, testimonials, gallery_items, schedule_sessions TO anon, authenticated;
GRANT ALL ON admin_users, registrations TO service_role;
GRANT SELECT ON admins TO authenticated;
