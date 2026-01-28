-- Verification Script for Email Campaigns Migration
-- Run this script after applying the migration to verify everything was created correctly

-- ============================================================================
-- VERIFY TABLES EXIST
-- ============================================================================

SELECT 
  'Tables Check' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 4 THEN '✓ PASS - All 4 tables exist'
    ELSE '✗ FAIL - Expected 4 tables, found ' || COUNT(*)
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('mailing_lists', 'mailing_list_subscribers', 'email_campaigns', 'campaign_recipients');

-- ============================================================================
-- VERIFY COLUMNS
-- ============================================================================

-- Check mailing_lists columns
SELECT 
  'mailing_lists columns' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 7 THEN '✓ PASS - All columns present'
    ELSE '✗ FAIL - Missing columns'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'mailing_lists'
  AND column_name IN ('id', 'name', 'description', 'created_at', 'updated_at', 'created_by', 'total_subscribers');

-- Check mailing_list_subscribers columns
SELECT 
  'mailing_list_subscribers columns' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 9 THEN '✓ PASS - All columns present'
    ELSE '✗ FAIL - Missing columns'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'mailing_list_subscribers'
  AND column_name IN ('id', 'mailing_list_id', 'email', 'first_name', 'last_name', 'full_name', 'custom_fields', 'status', 'subscribed_at');

-- Check email_campaigns columns
SELECT 
  'email_campaigns columns' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 13 THEN '✓ PASS - All columns present'
    ELSE '✗ FAIL - Missing columns'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'email_campaigns'
  AND column_name IN ('id', 'name', 'subject', 'body', 'mailing_list_id', 'tags', 'status', 'scheduled_at', 'sent_at', 'created_at', 'updated_at', 'created_by', 'total_recipients');

-- Check campaign_recipients columns
SELECT 
  'campaign_recipients columns' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 7 THEN '✓ PASS - All columns present'
    ELSE '✗ FAIL - Missing columns'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'campaign_recipients'
  AND column_name IN ('id', 'campaign_id', 'email', 'personalized_subject', 'personalized_body', 'status', 'sent_at');

-- ============================================================================
-- VERIFY INDEXES
-- ============================================================================

SELECT 
  'Indexes Check' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 8 THEN '✓ PASS - All indexes exist'
    ELSE '✗ FAIL - Some indexes missing'
  END as status
FROM pg_indexes
WHERE schemaname = 'public' 
  AND indexname IN (
    'mailing_lists_created_by_idx',
    'mailing_list_subscribers_list_idx',
    'mailing_list_subscribers_email_idx',
    'email_campaigns_status_idx',
    'email_campaigns_list_idx',
    'email_campaigns_tags_idx',
    'campaign_recipients_campaign_idx',
    'campaign_recipients_status_idx'
  );

-- ============================================================================
-- VERIFY RLS POLICIES
-- ============================================================================

SELECT 
  'RLS Policies Check' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 6 THEN '✓ PASS - All policies exist'
    ELSE '✗ FAIL - Some policies missing'
  END as status
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('mailing_lists', 'mailing_list_subscribers', 'email_campaigns', 'campaign_recipients');

-- ============================================================================
-- VERIFY TRIGGERS
-- ============================================================================

SELECT 
  'Triggers Check' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 2 THEN '✓ PASS - All triggers exist'
    ELSE '✗ FAIL - Some triggers missing'
  END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND trigger_name IN ('update_mailing_list_count_trigger', 'update_campaign_counts_trigger');

-- ============================================================================
-- VERIFY FUNCTIONS
-- ============================================================================

SELECT 
  'Functions Check' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 2 THEN '✓ PASS - All functions exist'
    ELSE '✗ FAIL - Some functions missing'
  END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN ('update_mailing_list_count', 'update_campaign_counts');

-- ============================================================================
-- VERIFY FOREIGN KEY CONSTRAINTS
-- ============================================================================

SELECT 
  'Foreign Keys Check' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 4 THEN '✓ PASS - All foreign keys exist'
    ELSE '✗ FAIL - Some foreign keys missing'
  END as status
FROM information_schema.table_constraints
WHERE constraint_schema = 'public'
  AND constraint_type = 'FOREIGN KEY'
  AND table_name IN ('mailing_lists', 'mailing_list_subscribers', 'email_campaigns', 'campaign_recipients');

-- ============================================================================
-- DETAILED TABLE INFORMATION
-- ============================================================================

-- List all tables with row counts
SELECT 
  t.table_name,
  obj_description((t.table_schema || '.' || t.table_name)::regclass::oid) as table_comment,
  (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_schema = t.table_schema AND c.table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE t.table_schema = 'public' 
  AND t.table_name IN ('mailing_lists', 'mailing_list_subscribers', 'email_campaigns', 'campaign_recipients')
ORDER BY t.table_name;

-- List all indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename IN ('mailing_lists', 'mailing_list_subscribers', 'email_campaigns', 'campaign_recipients')
ORDER BY tablename, indexname;

-- List all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('mailing_lists', 'mailing_list_subscribers', 'email_campaigns', 'campaign_recipients')
ORDER BY tablename, policyname;

-- List all triggers
SELECT 
  trigger_schema,
  event_object_table as table_name,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND event_object_table IN ('mailing_lists', 'mailing_list_subscribers', 'email_campaigns', 'campaign_recipients')
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- FINAL SUMMARY
-- ============================================================================

SELECT 
  '=== MIGRATION VERIFICATION SUMMARY ===' as summary,
  CASE 
    WHEN (
      (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('mailing_lists', 'mailing_list_subscribers', 'email_campaigns', 'campaign_recipients')) = 4
      AND (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND (indexname LIKE '%mailing%' OR indexname LIKE '%campaign%')) >= 8
      AND (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('mailing_lists', 'mailing_list_subscribers', 'email_campaigns', 'campaign_recipients')) >= 6
      AND (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public' AND trigger_name IN ('update_mailing_list_count_trigger', 'update_campaign_counts_trigger')) >= 2
    ) THEN '✓ MIGRATION SUCCESSFUL - All components verified'
    ELSE '✗ MIGRATION INCOMPLETE - Some components missing'
  END as result;
