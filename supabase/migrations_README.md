# Supabase Migrations

This directory contains database migrations for the SynergyCon website project.

## Overview

Migrations are SQL files that define changes to your database schema. They are versioned and applied in order to keep your database structure synchronized across different environments.

## Migration Files

Each migration file follows the naming convention: `{timestamp}_{description}.sql`

### Current Migrations

1. **20251226053932_create_email_campaigns_schema.sql** (Updated 2025-12-30)
   - Creates the complete email campaigns infrastructure
   - Tables: `mailing_lists`, `mailing_list_subscribers`, `email_campaigns`, `campaign_recipients`, `email_templates`, `smtp_configurations`, and 4 additional tables
   - **Fixed**: Table creation order, added `template_id` column to `email_campaigns`
   - Includes RLS policies, indexes, triggers, and helper functions

2. **20251230_patch_email_campaigns_template_id.sql** (Patch)
   - **FOR EXISTING DATABASES ONLY**: Adds `template_id` column if missing
   - Run this only if you applied the original migration before 2025-12-30
   - Includes verification checks and automatic rollback if not needed

## Running Migrations

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI:**
   ```bash
   # macOS
   brew install supabase/tap/supabase
   
   # Linux
   curl -fsSL https://deb.supabase.com/supabase-cli.sh | bash
   
   # Windows (npm global install NOT supported)
   # Use Scoop: scoop install supabase
   # Or NPX: npx supabase [command]
   ```

2. **Link to your Supabase project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Apply migrations:**
   ```bash
   # Apply all pending migrations
   supabase db push
   
   # Or apply a specific migration
   supabase db push --file supabase/migrations/20251226053932_create_email_campaigns_schema.sql
   ```

4. **Check migration status:**
   ```bash
   supabase migration list
   ```

### Option 2: Manual Application via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the migration file content
4. Copy and paste the SQL into the editor
5. Click **Run** to execute the migration

### Option 3: Direct PostgreSQL Connection

If you have direct database access:

```bash
psql -h your-host -U your-user -d your-database -f supabase/migrations/20251226053932_create_email_campaigns_schema.sql
```

## Migration Content

### Tables Created

#### mailing_lists
Stores mailing list information for organizing subscribers.

**Columns:**
- `id` (UUID) - Primary key
- `name` (TEXT) - List name
- `description` (TEXT) - Optional description
- `total_subscribers` (INTEGER) - Auto-updated count
- `created_by` (UUID) - Reference to admin user
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### mailing_list_subscribers
Stores subscriber information for each mailing list.

**Columns:**
- `id` (UUID) - Primary key
- `mailing_list_id` (UUID) - Foreign key to mailing_lists
- `email` (TEXT) - Subscriber email
- `first_name`, `last_name`, `full_name` (TEXT)
- `custom_fields` (JSONB) - Additional data from CSV imports
- `status` (TEXT) - active, unsubscribed, bounced
- `subscribed_at`, `unsubscribed_at` (TIMESTAMPTZ)

#### email_campaigns
Stores email campaign information and tracking.

**Columns:**
- `id` (UUID) - Primary key
- `name` (TEXT) - Campaign name
- `subject` (TEXT) - Email subject
- `body` (TEXT) - HTML content
- `template_id` (UUID) - **NEW**: Optional reference to email_templates
- `mailing_list_id` (UUID) - Foreign key to mailing_lists
- `tags` (TEXT[]) - Array of tags
- `status` (TEXT) - draft, scheduled, sending, sent, failed
- `total_recipients`, `total_sent`, `total_failed` (INTEGER)
- `scheduled_at`, `sent_at` (TIMESTAMPTZ)
- `created_by` (UUID) - Reference to admin user
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### campaign_recipients
Tracks individual email sends and their status.

**Columns:**
- `id` (UUID) - Primary key
- `campaign_id` (UUID) - Foreign key to email_campaigns
- `email` (TEXT) - Recipient email
- `personalized_subject`, `personalized_body` (TEXT)
- `status` (TEXT) - pending, sent, failed, bounced
- `sent_at` (TIMESTAMPTZ)
- `error_message` (TEXT)

### Security

All tables have Row Level Security (RLS) enabled with policies that:
- Allow authenticated users to manage all email campaign data
- Provide system-level access for campaign sending operations

### Triggers and Functions

**update_mailing_list_count()**
- Automatically updates the `total_subscribers` count when subscribers are added/removed

**update_campaign_counts()**
- Automatically updates recipient counts when recipients are added or their status changes

### Indexes

Performance indexes are created on:
- Foreign keys (mailing_list_id, campaign_id)
- Lookup columns (email, status)
- Tags array (using GIN index)

## Creating New Migrations

When making schema changes:

1. **Using Supabase CLI:**
   ```bash
   supabase migration new your_migration_name
   ```

2. **Manually:**
   - Create a new file with timestamp: `YYYYMMDDHHMMSS_description.sql`
   - Write your SQL changes
   - Test locally before applying to production

## Best Practices

1. **Never modify existing migrations** - Create new ones instead
2. **Make migrations reversible** when possible
3. **Test migrations locally** before applying to production
4. **Include comments** to explain complex changes
5. **Keep migrations atomic** - One logical change per migration
6. **Use transactions** for multi-step migrations

## Rollback

If you need to rollback a migration:

```bash
# Using Supabase CLI
supabase db reset

# Or create a new migration that reverses the changes
supabase migration new rollback_campaign_schema
```

## Verification

After applying migrations, verify:

1. **Tables exist:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE '%campaign%' OR table_name LIKE '%mailing%';
   ```

2. **Policies are active:**
   ```sql
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE tablename IN ('mailing_lists', 'email_campaigns');
   ```

3. **Triggers are working:**
   ```sql
   SELECT trigger_name, event_manipulation, event_object_table 
   FROM information_schema.triggers 
   WHERE event_object_schema = 'public';
   ```

## Troubleshooting

### Migration Already Applied
If a migration was already applied manually, you can mark it as applied:
```bash
supabase migration repair 20251226053932 --status applied
```

### Permission Errors
Ensure your database user has sufficient privileges:
```sql
GRANT ALL ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO your_user;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO your_user;
```

### Dependency Issues
If tables reference `admin_users` table, ensure it exists first by running previous migrations in order.

## Resources

- [Supabase Migrations Documentation](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
