-- Rollback Migration: Remove Email Campaigns Schema
-- Description: Drops all tables, functions, triggers, and related objects for email campaigns
-- WARNING: This will delete all data in the email campaigns tables!
-- Author: Admin Email Campaign System
-- Date: 2025-12-26

-- ============================================================================
-- IMPORTANT NOTICE
-- ============================================================================
-- This rollback script will permanently delete:
-- - All mailing lists
-- - All subscribers
-- - All email campaigns
-- - All campaign recipients
-- - All associated triggers and functions
-- 
-- Make sure you have a backup before running this script!
-- ============================================================================

-- ============================================================================
-- DROP TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_mailing_list_count_trigger ON public.mailing_list_subscribers;
DROP TRIGGER IF EXISTS update_campaign_counts_trigger ON public.campaign_recipients;

-- ============================================================================
-- DROP FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS update_mailing_list_count();
DROP FUNCTION IF EXISTS update_campaign_counts();

-- ============================================================================
-- DROP TABLES (in reverse dependency order)
-- ============================================================================

-- Drop campaign_recipients first (depends on email_campaigns)
DROP TABLE IF EXISTS public.campaign_recipients CASCADE;

-- Drop email_campaigns (depends on mailing_lists)
DROP TABLE IF EXISTS public.email_campaigns CASCADE;

-- Drop mailing_list_subscribers (depends on mailing_lists)
DROP TABLE IF EXISTS public.mailing_list_subscribers CASCADE;

-- Drop mailing_lists last (no dependencies)
DROP TABLE IF EXISTS public.mailing_lists CASCADE;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify tables are removed
DO $$
DECLARE
  remaining_tables INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_tables
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name IN ('mailing_lists', 'mailing_list_subscribers', 'email_campaigns', 'campaign_recipients');
  
  IF remaining_tables = 0 THEN
    RAISE NOTICE '✓ All email campaign tables have been removed successfully';
  ELSE
    RAISE WARNING '✗ Some tables still exist. Count: %', remaining_tables;
  END IF;
END $$;

-- Verify functions are removed
DO $$
DECLARE
  remaining_functions INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_functions
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN ('update_mailing_list_count', 'update_campaign_counts');
  
  IF remaining_functions = 0 THEN
    RAISE NOTICE '✓ All email campaign functions have been removed successfully';
  ELSE
    RAISE WARNING '✗ Some functions still exist. Count: %', remaining_functions;
  END IF;
END $$;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '===========================================================';
  RAISE NOTICE 'Email Campaigns Rollback Complete';
  RAISE NOTICE '===========================================================';
  RAISE NOTICE 'The following have been removed:';
  RAISE NOTICE '  - mailing_lists table';
  RAISE NOTICE '  - mailing_list_subscribers table';
  RAISE NOTICE '  - email_campaigns table';
  RAISE NOTICE '  - campaign_recipients table';
  RAISE NOTICE '  - update_mailing_list_count() function';
  RAISE NOTICE '  - update_campaign_counts() function';
  RAISE NOTICE '  - All associated triggers, indexes, and policies';
  RAISE NOTICE '';
  RAISE NOTICE 'All data has been permanently deleted.';
  RAISE NOTICE '===========================================================';
END $$;
