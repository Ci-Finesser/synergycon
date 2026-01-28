# Database Migration Guide

This guide explains how to manage database migrations for the SynergyCon website.

## Overview

The project has transitioned from manual SQL scripts to a proper migration system using Supabase migrations. This provides better version control, easier deployments, and safer schema changes.

## Project Structure

```
synergycon-website/
├── supabase/
│   ├── config.toml                    # Supabase project configuration
│   ├── .gitignore                     # Ignore local development files
│   └── migrations/                    # Migration files
│       ├── README.md                  # Detailed migration documentation
│       └── 20251226053932_create_email_campaigns_schema.sql
└── scripts/                           # Legacy SQL scripts (deprecated)
    └── 017_create_mailing_lists_and_campaigns.sql
```

## Migration vs. Legacy Scripts

### New Migration System (✅ Recommended)
- **Location**: `supabase/migrations/`
- **Format**: Timestamped SQL files with version control
- **Benefits**: 
  - Automatic tracking of applied migrations
  - Easy rollback capabilities
  - Better collaboration across teams
  - Integrated with Supabase CLI
  - Includes comprehensive documentation

### Legacy Scripts (⚠️ Deprecated)
- **Location**: `scripts/`
- **Format**: Numbered SQL files
- **Status**: Still functional but no longer maintained
- **Use case**: Existing installations only

## Getting Started

### 1. Install Supabase CLI

Choose your platform:

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Linux:**
```bash
curl -fsSL https://deb.supabase.com/supabase-cli.sh | bash
```

**Windows:**

**⚠️ Important:** npm global install (`npm install -g supabase`) is NOT supported. Use one of these methods:

**Option 1: Direct Binary Download (Recommended - No dependencies)**

1. Download the latest release from [Supabase CLI releases](https://github.com/supabase/cli/releases)
2. Look for `supabase_windows_amd64.zip` or `supabase_windows_arm64.zip`
3. Extract the ZIP file
4. Move `supabase.exe` to a folder in your PATH (e.g., `C:\Program Files\Supabase\`)
5. Or add the folder to your PATH environment variable

**Option 2: Scoop Package Manager**

First, install Scoop if you don't have it:
```powershell
# Run in PowerShell (as administrator)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

Then install Supabase CLI:
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Option 3: NPX (Requires Node.js installed)**

⚠️ Only works if Node.js is installed and in your PATH:
```powershell
# Check if Node.js is installed first
node --version

# If Node.js is installed, use npx
npx supabase --version
```

**Verify installation:**
```powershell
supabase --version
# Or if using npx: npx supabase --version
```

### 2. Link Your Project

Connect the CLI to your Supabase project:

```bash
# Login to Supabase
supabase login
# Or with npx: npx supabase login

# Link to your project
supabase link --project-ref your-project-ref
# Or with npx: npx supabase link --project-ref your-project-ref
```

Your project ref can be found in your Supabase project URL or settings.

**💡 Tip:** If you're using `npx`, prefix all `supabase` commands with `npx` (e.g., `npx supabase db push`).

### 3. Apply Migrations

Apply all pending migrations:

```bash
cd /path/to/synergycon-website
supabase db push
```

This will:
1. Check which migrations have been applied
2. Apply any new migrations in order
3. Track the migration history in your database

## Email Campaigns Migration

The email campaigns schema is defined in:
```
supabase/migrations/20251226053932_create_email_campaigns_schema.sql
```

### What It Creates

**Tables:**
1. `mailing_lists` - Organize subscribers into lists
2. `mailing_list_subscribers` - Store subscriber information
3. `email_campaigns` - Campaign definitions and tracking
4. `campaign_recipients` - Individual send tracking

**Additional Components:**
- Row Level Security (RLS) policies
- Performance indexes
- Automated count update triggers
- Helper functions for data consistency

### Dependencies

This migration requires:
- `admin_users` table (from previous migrations)
- PostgreSQL 12+ with UUID extension

## Common Tasks

### Check Migration Status

See which migrations have been applied:

```bash
supabase migration list
```

### Apply a Specific Migration

```bash
supabase db push --file supabase/migrations/20251226053932_create_email_campaigns_schema.sql
```

### Create a New Migration

```bash
supabase migration new add_new_feature
```

This creates a new timestamped file in `supabase/migrations/`.

### Rollback Changes

Rollback requires creating a new migration that reverses the changes:

```bash
supabase migration new rollback_email_campaigns
```

Then write SQL to drop the tables/functions/triggers.

### Reset Local Database

⚠️ **Warning**: This destroys all local data!

```bash
supabase db reset
```

## Manual Application (Without CLI)

If you can't use the Supabase CLI:

### Via Supabase Dashboard

1. Navigate to your project in [app.supabase.com](https://app.supabase.com)
2. Go to **SQL Editor**
3. Create a new query
4. Copy the contents of `supabase/migrations/20251226053932_create_email_campaigns_schema.sql`
5. Paste and click **Run**

### Via PostgreSQL Client

If you have direct database access:

```bash
psql -h db.your-project.supabase.co \
     -U postgres \
     -d postgres \
     -f supabase/migrations/20251226053932_create_email_campaigns_schema.sql
```

## Development Workflow

### Making Schema Changes

1. **Create a new migration:**
   ```bash
   supabase migration new your_change_description
   ```

2. **Write your SQL:**
   Edit the generated file in `supabase/migrations/`

3. **Test locally:**
   ```bash
   supabase db reset  # Start fresh
   supabase db push   # Apply all migrations
   ```

4. **Commit your changes:**
   ```bash
   git add supabase/migrations/
   git commit -m "Add migration for your_change_description"
   ```

5. **Deploy to production:**
   ```bash
   supabase db push --linked
   ```

### Best Practices

✅ **DO:**
- Keep migrations small and focused
- Add comments explaining complex logic
- Test migrations locally before deploying
- Include both up and down migrations when possible
- Version control all migration files

❌ **DON'T:**
- Modify existing migration files
- Include sensitive data in migrations
- Skip migrations in the sequence
- Make breaking changes without planning

## Troubleshooting

### Windows: "The system cannot find the path specified" (npx)

**Cause:** Node.js is not installed or not in your PATH.

**Solution:** 
1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Restart your terminal
3. Try `node --version` to verify installation
4. If Node.js is installed, use the direct binary download method instead (see installation section above)

### Windows: "scoop is not recognized"

**Cause:** Scoop is not installed.

**Solution:**
1. **Easiest:** Use the direct binary download method instead (no dependencies needed)
2. **Or install Scoop first:**
   ```powershell
   # Run in PowerShell (may need administrator)
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   irm get.scoop.sh | iex
   ```

### Windows: "supabase is not recognized"

**Cause:** Supabase CLI is not installed or not in PATH.

**Solution:**
1. Download the binary: [github.com/supabase/cli/releases](https://github.com/supabase/cli/releases)
2. Extract `supabase.exe` from the ZIP file
3. **Quick test:** Open PowerShell in the extracted folder and run `.\supabase.exe --version`
4. **Permanent install:** Move to `C:\Program Files\Supabase\` and add to PATH:
   - Search Windows for "Environment Variables"
   - Click "Environment Variables"
   - Under "System variables", find "Path" and click "Edit"
   - Click "New" and add: `C:\Program Files\Supabase`
   - Click OK, restart terminal

### Migration Already Applied

If you manually ran the legacy script (017):

```bash
# Mark the migration as applied
supabase migration repair 20251226053932 --status applied
```

### Permission Denied

Ensure your database user has proper permissions:

```sql
GRANT ALL ON SCHEMA public TO your_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO your_user;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO your_user;
```

### Table Already Exists

The migration uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times. However, if you need to force recreation:

1. Drop existing tables (⚠️ **destroys data**):
```sql
DROP TABLE IF EXISTS campaign_recipients CASCADE;
DROP TABLE IF EXISTS email_campaigns CASCADE;
DROP TABLE IF EXISTS mailing_list_subscribers CASCADE;
DROP TABLE IF EXISTS mailing_lists CASCADE;
```

2. Reapply the migration

### Missing template_id Column

If you applied the migration before 2025-12-30 and are getting errors about `template_id`:

```bash
# Apply the patch migration
supabase db push supabase/migrations/20251230_patch_email_campaigns_template_id.sql
```

Or run this SQL directly:
```sql
ALTER TABLE public.email_campaigns 
ADD COLUMN IF NOT EXISTS template_id UUID 
REFERENCES public.email_templates(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS email_campaigns_template_idx 
ON public.email_campaigns(template_id) 
WHERE template_id IS NOT NULL;
```

### Missing admin_users Table

The email campaigns migration depends on the `admin_users` table. Apply earlier migrations first:

```bash
# Apply all migrations in order
supabase db push
```

## Verification

After applying migrations, verify everything is working:

### Check Tables

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%campaign%' OR table_name LIKE '%mailing%')
ORDER BY table_name;
```

Expected tables:
- `campaign_recipients`
- `email_campaigns`
- `mailing_list_subscribers`
- `mailing_lists`

### Check Policies

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename IN ('mailing_lists', 'mailing_list_subscribers', 
                    'email_campaigns', 'campaign_recipients')
ORDER BY tablename, policyname;
```

### Check Triggers

```sql
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND (event_object_table LIKE '%campaign%' OR event_object_table LIKE '%mailing%')
ORDER BY event_object_table, trigger_name;
```

### Test Functionality

Run a quick test:

```sql
-- Create a test mailing list
INSERT INTO mailing_lists (name, description) 
VALUES ('Test List', 'Test Description')
RETURNING *;

-- Check that total_subscribers is 0
SELECT name, total_subscribers FROM mailing_lists WHERE name = 'Test List';

-- Clean up
DELETE FROM mailing_lists WHERE name = 'Test List';
```

## Migration History

| Date       | Migration File                                      | Description                           | Status |
|------------|-----------------------------------------------------|---------------------------------------|--------|
| 2025-12-26 | `20251226053932_create_email_campaigns_schema.sql`  | Initial email campaigns infrastructure | ✅ Fixed |
| 2025-12-30 | `20251230_patch_email_campaigns_template_id.sql`    | Patch: Add template_id column | 📦 New |

### What Changed on Dec 30, 2025

**Problem Identified:**
- Original migration had `email_campaigns` table created before `email_templates`
- Missing `template_id` column caused foreign key constraint violations
- API routes expecting `template_id` field failed

**Fix Applied:**
- ✅ Reorganized table creation order (templates before campaigns)
- ✅ Added `template_id UUID` column to `email_campaigns`
- ✅ Added foreign key constraint: `REFERENCES email_templates(id) ON DELETE SET NULL`
- ✅ Added performance index: `email_campaigns_template_idx`
- ✅ Updated all documentation

**Action Required:**
- **New deployments**: The fixed migration runs automatically
- **Existing databases**: Apply the patch script (see EXECUTE_SCRIPTS.txt)

## Support Resources

- **Migration README**: `supabase/migrations/README.md`
- **Supabase CLI Docs**: https://supabase.com/docs/guides/cli
- **Migration Docs**: https://supabase.com/docs/guides/cli/local-development#database-migrations
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

## FAQ

**Q: Can I use both legacy scripts and new migrations?**
A: It's not recommended. Choose one approach. If you've already run script 017, mark the corresponding migration as applied.

**Q: Will migrations affect my production database?**
A: Only when you explicitly run `supabase db push --linked`. Always test locally first.

**Q: How do I migrate from legacy scripts to the new system?**
A: If legacy scripts are already applied, use `supabase migration repair` to mark corresponding migrations as applied.

**Q: Are migrations reversible?**
A: Not automatically. You need to create a new migration that reverses the changes.

**Q: Can I edit a migration after applying it?**
A: No. Once applied, create a new migration to make changes.

## Next Steps

1. ✅ Install Supabase CLI
2. ✅ Link your project
3. ✅ Apply the email campaigns migration
4. ✅ Verify tables were created
5. ✅ Test the admin email campaigns feature
6. 📖 Read `supabase/migrations/README.md` for detailed information

---

**For questions or issues**, refer to the project documentation or Supabase support.
