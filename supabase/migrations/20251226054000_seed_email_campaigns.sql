-- Seed file for email campaigns
-- This file contains optional seed data for testing the email campaigns feature
-- Run this after applying the main migration

-- Note: This assumes you have an admin user already created
-- Adjust the created_by UUID to match your actual admin user ID

-- Example: Creating a default mailing list
-- Uncomment and modify as needed
/*
INSERT INTO public.mailing_lists (name, description, created_by)
VALUES 
  ('Newsletter Subscribers', 'Main newsletter mailing list', 'YOUR_ADMIN_USER_UUID_HERE'),
  ('Event Attendees', 'People who attended previous events', 'YOUR_ADMIN_USER_UUID_HERE')
ON CONFLICT DO NOTHING;
*/

-- Example: Adding test subscribers
-- Uncomment and modify as needed
/*
DO $$
DECLARE
  newsletter_list_id UUID;
BEGIN
  -- Get the newsletter list ID
  SELECT id INTO newsletter_list_id 
  FROM public.mailing_lists 
  WHERE name = 'Newsletter Subscribers' 
  LIMIT 1;
  
  IF newsletter_list_id IS NOT NULL THEN
    -- Insert test subscribers
    INSERT INTO public.mailing_list_subscribers 
      (mailing_list_id, email, first_name, last_name, full_name, status)
    VALUES 
      (newsletter_list_id, 'test1@example.com', 'John', 'Doe', 'John Doe', 'active'),
      (newsletter_list_id, 'test2@example.com', 'Jane', 'Smith', 'Jane Smith', 'active'),
      (newsletter_list_id, 'test3@example.com', 'Bob', 'Johnson', 'Bob Johnson', 'active')
    ON CONFLICT (mailing_list_id, email) DO NOTHING;
  END IF;
END $$;
*/

-- Example: Creating a sample campaign
-- Uncomment and modify as needed
/*
DO $$
DECLARE
  newsletter_list_id UUID;
  admin_user_id UUID := 'YOUR_ADMIN_USER_UUID_HERE';
BEGIN
  -- Get the newsletter list ID
  SELECT id INTO newsletter_list_id 
  FROM public.mailing_lists 
  WHERE name = 'Newsletter Subscribers' 
  LIMIT 1;
  
  IF newsletter_list_id IS NOT NULL THEN
    -- Insert a sample draft campaign
    INSERT INTO public.email_campaigns 
      (name, subject, body, mailing_list_id, tags, status, created_by)
    VALUES 
      (
        'Welcome Campaign',
        'Welcome to SynergyCon 2026! 🎉',
        '<p>Hello {{first_name}},</p>' ||
        '<p>Thank you for subscribing to SynergyCon updates!</p>' ||
        '<p>We''re excited to have you join us for <strong>SynergyCon 2.0</strong> ' ||
        'happening March 4-6, 2026.</p>' ||
        '<p>Stay tuned for exclusive updates, speaker announcements, ' ||
        'and early bird registration opportunities.</p>' ||
        '<p>Best regards,<br>The SynergyCon Team</p>',
        newsletter_list_id,
        ARRAY['welcome', 'onboarding'],
        'draft',
        admin_user_id
      )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
*/

-- Verification queries
-- Run these to check that your data was inserted correctly

-- Check mailing lists
SELECT id, name, description, total_subscribers, created_at 
FROM public.mailing_lists 
ORDER BY created_at DESC;

-- Check subscribers (if any)
SELECT ml.name as list_name, mls.email, mls.first_name, mls.last_name, mls.status, mls.subscribed_at
FROM public.mailing_list_subscribers mls
JOIN public.mailing_lists ml ON ml.id = mls.mailing_list_id
ORDER BY mls.subscribed_at DESC;

-- Check campaigns (if any)
SELECT id, name, subject, status, tags, total_recipients, created_at
FROM public.email_campaigns
ORDER BY created_at DESC;

-- Check that triggers are working correctly
-- This should show 0 or more subscribers depending on what you inserted
SELECT ml.name, ml.total_subscribers,
       (SELECT COUNT(*) FROM mailing_list_subscribers WHERE mailing_list_id = ml.id) as actual_count
FROM public.mailing_lists ml;

-- If total_subscribers doesn't match actual_count, the trigger may not be working
-- In that case, you can manually update the count:
/*
UPDATE public.mailing_lists ml
SET total_subscribers = (
  SELECT COUNT(*) 
  FROM mailing_list_subscribers mls 
  WHERE mls.mailing_list_id = ml.id
);
*/
