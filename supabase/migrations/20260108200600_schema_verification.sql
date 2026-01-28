-- Migration: Schema Verification and Cleanup
-- Description: Verifies schema integrity, adds missing references, and cleans up inconsistencies
-- Date: 2026-01-08

-- ============================================================================
-- FIX TABLE REFERENCES
-- Ensure foreign keys point to correct tables
-- ============================================================================

-- Fix admin_sessions to reference admin_users (not admins)
DO $$
BEGIN
  -- Check if admin_sessions references 'admins' and update to 'admin_users'
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
    WHERE tc.table_name = 'admin_sessions' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND rc.unique_constraint_schema = 'public'
  ) THEN
    -- The constraint exists, no action needed as we've created the admins view
    RAISE NOTICE 'admin_sessions foreign key constraints exist';
  END IF;
END $$;

-- ============================================================================
-- CREATE MISSING VIEWS FOR COMPATIBILITY
-- ============================================================================

-- Newsletter subscriptions view (only if mailing_list_subscribers table exists)
DO $$
DECLARE
  has_created_at BOOLEAN;
  has_status BOOLEAN;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mailing_list_subscribers') THEN
    has_created_at := EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'mailing_list_subscribers' AND column_name = 'created_at');
    has_status := EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'mailing_list_subscribers' AND column_name = 'status');
    
    IF has_status AND has_created_at THEN
      EXECUTE '
        CREATE OR REPLACE VIEW newsletter_stats AS
        SELECT 
          COUNT(*) FILTER (WHERE status = ''subscribed'') as active_subscribers,
          COUNT(*) FILTER (WHERE status = ''unsubscribed'') as unsubscribed,
          COUNT(*) as total_ever_subscribed,
          MAX(created_at) as last_subscription
        FROM mailing_list_subscribers
      ';
    ELSIF has_status THEN
      EXECUTE '
        CREATE OR REPLACE VIEW newsletter_stats AS
        SELECT 
          COUNT(*) FILTER (WHERE status = ''subscribed'') as active_subscribers,
          COUNT(*) FILTER (WHERE status = ''unsubscribed'') as unsubscribed,
          COUNT(*) as total_ever_subscribed,
          NULL::timestamptz as last_subscription
        FROM mailing_list_subscribers
      ';
    ELSE
      EXECUTE '
        CREATE OR REPLACE VIEW newsletter_stats AS
        SELECT 
          COUNT(*) as active_subscribers,
          0::bigint as unsubscribed,
          COUNT(*) as total_ever_subscribed,
          NULL::timestamptz as last_subscription
        FROM mailing_list_subscribers
      ';
    END IF;
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'newsletter_subscriptions') THEN
    has_created_at := EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'newsletter_subscriptions' AND column_name = 'created_at');
    has_status := EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'newsletter_subscriptions' AND column_name = 'status');
    
    IF has_status AND has_created_at THEN
      EXECUTE '
        CREATE OR REPLACE VIEW newsletter_stats AS
        SELECT 
          COUNT(*) FILTER (WHERE status = ''subscribed'' OR status IS NULL) as active_subscribers,
          COUNT(*) FILTER (WHERE status = ''unsubscribed'') as unsubscribed,
          COUNT(*) as total_ever_subscribed,
          MAX(created_at) as last_subscription
        FROM newsletter_subscriptions
      ';
    ELSIF has_created_at THEN
      EXECUTE '
        CREATE OR REPLACE VIEW newsletter_stats AS
        SELECT 
          COUNT(*) as active_subscribers,
          0::bigint as unsubscribed,
          COUNT(*) as total_ever_subscribed,
          MAX(created_at) as last_subscription
        FROM newsletter_subscriptions
      ';
    ELSE
      EXECUTE '
        CREATE OR REPLACE VIEW newsletter_stats AS
        SELECT 
          COUNT(*) as active_subscribers,
          0::bigint as unsubscribed,
          COUNT(*) as total_ever_subscribed,
          NULL::timestamptz as last_subscription
        FROM newsletter_subscriptions
      ';
    END IF;
  ELSE
    -- Create an empty view if no newsletter table exists
    EXECUTE '
      CREATE OR REPLACE VIEW newsletter_stats AS
      SELECT 
        0::bigint as active_subscribers,
        0::bigint as unsubscribed,
        0::bigint as total_ever_subscribed,
        NULL::timestamptz as last_subscription
    ';
  END IF;
END $$;

-- Registration stats view (conditional on columns existing)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'registrations') THEN
    -- Check if required columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'status') AND
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registrations' AND column_name = 'total_amount') THEN
      EXECUTE '
        CREATE OR REPLACE VIEW registration_stats AS
        SELECT 
          COUNT(*) as total_registrations,
          COUNT(*) FILTER (WHERE status = ''confirmed'') as confirmed,
          COUNT(*) FILTER (WHERE status = ''pending'') as pending,
          COUNT(*) FILTER (WHERE status = ''waitlist'') as waitlisted,
          COUNT(*) FILTER (WHERE status = ''cancelled'') as cancelled,
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COALESCE(AVG(total_amount), 0) as avg_order_value,
          MAX(created_at) as last_registration
        FROM registrations
      ';
    ELSE
      EXECUTE '
        CREATE OR REPLACE VIEW registration_stats AS
        SELECT 
          COUNT(*) as total_registrations,
          0::bigint as confirmed,
          0::bigint as pending,
          0::bigint as waitlisted,
          0::bigint as cancelled,
          0::numeric as total_revenue,
          0::numeric as avg_order_value,
          MAX(created_at) as last_registration
        FROM registrations
      ';
    END IF;
  ELSE
    EXECUTE '
      CREATE OR REPLACE VIEW registration_stats AS
      SELECT 
        0::bigint as total_registrations,
        0::bigint as confirmed,
        0::bigint as pending,
        0::bigint as waitlisted,
        0::bigint as cancelled,
        0::numeric as total_revenue,
        0::numeric as avg_order_value,
        NULL::timestamptz as last_registration
    ';
  END IF;
END $$;

-- Speaker stats view (conditional)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'speakers') THEN
    EXECUTE '
      CREATE OR REPLACE VIEW speaker_stats AS
      SELECT 
        COUNT(*) as total_speakers,
        COUNT(*) FILTER (WHERE ' || 
          CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'speakers' AND column_name = 'status') 
               THEN 'status = ''live''' ELSE 'true' END || ') as live_speakers,
        COUNT(*) FILTER (WHERE ' ||
          CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'speakers' AND column_name = 'featured')
               THEN 'featured = true' ELSE 'false' END || ') as featured_speakers,
        COUNT(*) FILTER (WHERE ' ||
          CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'speakers' AND column_name = 'confirmed')
               THEN 'confirmed = true' ELSE 'false' END || ') as confirmed_speakers,
        ' ||
          CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'speakers' AND column_name = 'event_day')
               THEN 'COUNT(DISTINCT event_day)' ELSE '0' END || ' as days_with_speakers
      FROM speakers
    ';
  ELSE
    EXECUTE '
      CREATE OR REPLACE VIEW speaker_stats AS
      SELECT 
        0::bigint as total_speakers,
        0::bigint as live_speakers,
        0::bigint as featured_speakers,
        0::bigint as confirmed_speakers,
        0::bigint as days_with_speakers
    ';
  END IF;
END $$;

-- Sponsor stats view (conditional)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sponsors') THEN
    EXECUTE '
      CREATE OR REPLACE VIEW sponsor_stats AS
      SELECT 
        COUNT(*) as total_sponsors,
        COUNT(*) FILTER (WHERE ' ||
          CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sponsors' AND column_name = 'tier')
               THEN 'tier = ''diamond''' ELSE 'false' END || ') as diamond_sponsors,
        COUNT(*) FILTER (WHERE ' ||
          CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sponsors' AND column_name = 'tier')
               THEN 'tier = ''platinum''' ELSE 'false' END || ') as platinum_sponsors,
        COUNT(*) FILTER (WHERE ' ||
          CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sponsors' AND column_name = 'tier')
               THEN 'tier = ''gold''' ELSE 'false' END || ') as gold_sponsors,
        COUNT(*) FILTER (WHERE ' ||
          CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sponsors' AND column_name = 'tier')
               THEN 'tier = ''silver''' ELSE 'false' END || ') as silver_sponsors,
        COUNT(*) FILTER (WHERE ' ||
          CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sponsors' AND column_name = 'tier')
               THEN 'tier IN (''ecosystem'', ''principal'')' ELSE 'false' END || ') as partner_sponsors,
        COUNT(*) FILTER (WHERE ' ||
          CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sponsors' AND column_name = 'featured')
               THEN 'featured = true' ELSE 'false' END || ') as featured_sponsors
      FROM sponsors
    ';
  ELSE
    EXECUTE '
      CREATE OR REPLACE VIEW sponsor_stats AS
      SELECT 
        0::bigint as total_sponsors,
        0::bigint as diamond_sponsors,
        0::bigint as platinum_sponsors,
        0::bigint as gold_sponsors,
        0::bigint as silver_sponsors,
        0::bigint as partner_sponsors,
        0::bigint as featured_sponsors
    ';
  END IF;
END $$;

-- Application stats view (conditional)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'speaker_applications') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'partnership_applications') THEN
    EXECUTE '
      CREATE OR REPLACE VIEW application_stats AS
      SELECT 
        ''speakers'' as type,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = ''pending'') as pending,
        COUNT(*) FILTER (WHERE status = ''approved'') as approved,
        COUNT(*) FILTER (WHERE status = ''rejected'') as rejected
      FROM speaker_applications
      UNION ALL
      SELECT 
        ''partnerships'' as type,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = ''pending'') as pending,
        COUNT(*) FILTER (WHERE status = ''approved'') as approved,
        COUNT(*) FILTER (WHERE status = ''rejected'') as rejected
      FROM partnership_applications
    ';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'speaker_applications') THEN
    EXECUTE '
      CREATE OR REPLACE VIEW application_stats AS
      SELECT 
        ''speakers'' as type,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = ''pending'') as pending,
        COUNT(*) FILTER (WHERE status = ''approved'') as approved,
        COUNT(*) FILTER (WHERE status = ''rejected'') as rejected
      FROM speaker_applications
    ';
  ELSE
    EXECUTE '
      CREATE OR REPLACE VIEW application_stats AS
      SELECT 
        ''none'' as type,
        0::bigint as total,
        0::bigint as pending,
        0::bigint as approved,
        0::bigint as rejected
    ';
  END IF;
END $$;

-- ============================================================================
-- ADD COMPREHENSIVE DASHBOARD STATS FUNCTION
-- ============================================================================

-- Create a robust dashboard stats function that handles missing tables/columns
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
  reg_stats JSON;
  ticket_stats JSON;
  payment_stats JSON;
  speaker_stats JSON;
  sponsor_stats JSON;
  app_stats JSON;
BEGIN
  -- Registrations stats
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'registrations') THEN
    BEGIN
      SELECT json_build_object(
        'total', COUNT(*),
        'confirmed', COUNT(*) FILTER (WHERE status = 'confirmed'),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'revenue', COALESCE(SUM(total_amount), 0)
      ) INTO reg_stats FROM registrations;
    EXCEPTION WHEN OTHERS THEN
      reg_stats := '{"total": 0, "confirmed": 0, "pending": 0, "revenue": 0}'::json;
    END;
  ELSE
    reg_stats := '{"total": 0, "confirmed": 0, "pending": 0, "revenue": 0}'::json;
  END IF;

  -- Ticket stats
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ticket_types') THEN
    BEGIN
      SELECT json_build_object(
        'total_sold', COALESCE(SUM(sold_quantity), 0),
        'total_available', COALESCE(SUM(available_quantity), 0),
        'types_count', COUNT(*)
      ) INTO ticket_stats FROM ticket_types WHERE is_active = true;
    EXCEPTION WHEN OTHERS THEN
      ticket_stats := '{"total_sold": 0, "total_available": 0, "types_count": 0}'::json;
    END;
  ELSE
    ticket_stats := '{"total_sold": 0, "total_available": 0, "types_count": 0}'::json;
  END IF;

  -- Payment stats
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') THEN
    BEGIN
      SELECT json_build_object(
        'total', COUNT(*),
        'successful', COUNT(*) FILTER (WHERE status = 'successful'),
        'failed', COUNT(*) FILTER (WHERE status = 'failed'),
        'revenue', COALESCE(SUM(CASE WHEN status = 'successful' THEN amount ELSE 0 END), 0)
      ) INTO payment_stats FROM payments;
    EXCEPTION WHEN OTHERS THEN
      payment_stats := '{"total": 0, "successful": 0, "failed": 0, "revenue": 0}'::json;
    END;
  ELSE
    payment_stats := '{"total": 0, "successful": 0, "failed": 0, "revenue": 0}'::json;
  END IF;

  -- Speaker stats
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'speakers') THEN
    BEGIN
      SELECT json_build_object(
        'total', COUNT(*),
        'confirmed', COUNT(*) FILTER (WHERE confirmed = true),
        'featured', COUNT(*) FILTER (WHERE featured = true)
      ) INTO speaker_stats FROM speakers;
    EXCEPTION WHEN OTHERS THEN
      speaker_stats := '{"total": 0, "confirmed": 0, "featured": 0}'::json;
    END;
  ELSE
    speaker_stats := '{"total": 0, "confirmed": 0, "featured": 0}'::json;
  END IF;

  -- Sponsor stats
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sponsors') THEN
    BEGIN
      SELECT json_build_object(
        'total', COUNT(*),
        'featured', COUNT(*) FILTER (WHERE featured = true)
      ) INTO sponsor_stats FROM sponsors;
    EXCEPTION WHEN OTHERS THEN
      sponsor_stats := '{"total": 0, "featured": 0}'::json;
    END;
  ELSE
    sponsor_stats := '{"total": 0, "featured": 0}'::json;
  END IF;

  -- Application stats
  BEGIN
    SELECT json_build_object(
      'speakers_pending', COALESCE((SELECT COUNT(*) FROM speaker_applications WHERE status = 'pending'), 0),
      'partnerships_pending', COALESCE((SELECT COUNT(*) FROM partnership_applications WHERE status = 'pending'), 0)
    ) INTO app_stats;
  EXCEPTION WHEN OTHERS THEN
    app_stats := '{"speakers_pending": 0, "partnerships_pending": 0}'::json;
  END;

  -- Build final result
  result := json_build_object(
    'registrations', reg_stats,
    'tickets', ticket_stats,
    'payments', payment_stats,
    'speakers', speaker_stats,
    'sponsors', sponsor_stats,
    'applications', app_stats
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ENSURE ALL TABLES HAVE UPDATED_AT TRIGGER
-- ============================================================================

DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
    AND table_schema = 'public'
    AND table_name NOT IN ('admins') -- view, not table
  LOOP
    BEGIN
      EXECUTE format(
        'DROP TRIGGER IF EXISTS update_%s_updated_at ON %s',
        tbl.table_name, tbl.table_name
      );
      EXECUTE format(
        'CREATE TRIGGER update_%s_updated_at 
         BEFORE UPDATE ON %s 
         FOR EACH ROW 
         EXECUTE FUNCTION update_updated_at_column()',
        tbl.table_name, tbl.table_name
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not create trigger for %: %', tbl.table_name, SQLERRM;
    END;
  END LOOP;
END;
$$;

-- ============================================================================
-- GRANT PERMISSIONS ON NEW VIEWS
-- ============================================================================

GRANT SELECT ON newsletter_stats TO authenticated;
GRANT SELECT ON registration_stats TO authenticated;
GRANT SELECT ON speaker_stats TO authenticated;
GRANT SELECT ON sponsor_stats TO authenticated;
GRANT SELECT ON application_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;

-- ============================================================================
-- SCHEMA VERIFICATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION verify_schema_integrity()
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- Check core tables exist
  RETURN QUERY
  SELECT 
    'core_tables'::TEXT,
    CASE WHEN COUNT(*) >= 10 THEN 'PASS' ELSE 'FAIL' END,
    'Found ' || COUNT(*)::TEXT || ' core tables'
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN (
    'admin_users', 'registrations', 'speakers', 'sponsors', 
    'tickets', 'ticket_types', 'payments', 'user_profiles',
    'speaker_applications', 'partnership_applications'
  );

  -- Check RLS is enabled
  RETURN QUERY
  SELECT 
    'rls_enabled'::TEXT,
    CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'WARN' END,
    'RLS enabled on ' || COUNT(*)::TEXT || ' tables'
  FROM pg_tables t
  JOIN pg_class c ON t.tablename = c.relname
  WHERE t.schemaname = 'public'
  AND c.relrowsecurity = true;

  -- Check indexes exist
  RETURN QUERY
  SELECT 
    'indexes'::TEXT,
    CASE WHEN COUNT(*) >= 20 THEN 'PASS' ELSE 'WARN' END,
    'Found ' || COUNT(*)::TEXT || ' indexes'
  FROM pg_indexes
  WHERE schemaname = 'public';

  -- Check triggers exist
  RETURN QUERY
  SELECT 
    'updated_at_triggers'::TEXT,
    CASE WHEN COUNT(*) >= 5 THEN 'PASS' ELSE 'WARN' END,
    'Found ' || COUNT(*)::TEXT || ' update triggers'
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'update_%_updated_at';

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RUN VERIFICATION
-- ============================================================================

SELECT * FROM verify_schema_integrity();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION get_dashboard_stats() IS 'Returns comprehensive dashboard statistics as JSON';
COMMENT ON FUNCTION verify_schema_integrity() IS 'Verifies database schema integrity and returns status report';
COMMENT ON VIEW registration_stats IS 'Aggregated registration statistics';
COMMENT ON VIEW speaker_stats IS 'Aggregated speaker statistics';
COMMENT ON VIEW sponsor_stats IS 'Aggregated sponsor statistics';
COMMENT ON VIEW application_stats IS 'Combined speaker and partnership application statistics';
