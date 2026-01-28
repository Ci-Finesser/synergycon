# Email Campaigns Migration - Quick Reference

## Files Overview

```
supabase/
├── config.toml                                              # Supabase project config
├── .gitignore                                              # Ignore local files
└── migrations/
    ├── README.md                                           # Detailed documentation
    ├── 20251226053932_create_email_campaigns_schema.sql    # Main migration
    ├── 20251226054000_seed_email_campaigns.sql             # Optional seed data
    ├── 20251226054100_verify_email_campaigns.sql           # Verification queries
    └── 20251226054200_rollback_email_campaigns.sql         # Rollback script
```

## Quick Commands

### Apply Migration

**Using Supabase CLI:**
```bash
supabase db push
```

**Via Supabase Dashboard:**
1. Go to SQL Editor
2. Paste contents of `20251226053932_create_email_campaigns_schema.sql`
3. Run

**Via psql:**
```bash
psql -h your-host -U postgres -d postgres -f supabase/migrations/20251226053932_create_email_campaigns_schema.sql
```

### Verify Migration

```bash
psql -h your-host -U postgres -d postgres -f supabase/migrations/20251226054100_verify_email_campaigns.sql
```

Expected output: All checks should show "✓ PASS"

### Rollback (if needed)

⚠️ **WARNING: This deletes all data!**

```bash
psql -h your-host -U postgres -d postgres -f supabase/migrations/20251226054200_rollback_email_campaigns.sql
```

## Schema Overview

### Tables Created

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `mailing_lists` | Organize subscribers | Auto-updating subscriber count |
| `mailing_list_subscribers` | Store subscriber data | JSONB custom fields, status tracking |
| `email_campaigns` | Campaign metadata | Status tracking, tag support |
| `campaign_recipients` | Individual sends | Personalization, delivery status |

### Key Features

✅ **Row Level Security** - All tables protected
✅ **Automatic Counts** - Triggers update subscriber/recipient counts
✅ **Performance Indexes** - Optimized queries on common lookups
✅ **Cascade Deletes** - Clean up related data automatically
✅ **JSONB Support** - Store custom CSV fields
✅ **Status Tracking** - Track campaign and recipient status

## Testing

### 1. Create a Test List

```sql
INSERT INTO mailing_lists (name, description)
VALUES ('Test List', 'For testing')
RETURNING *;
```

### 2. Add Subscribers

```sql
INSERT INTO mailing_list_subscribers (mailing_list_id, email, first_name, last_name)
VALUES 
  ('YOUR_LIST_ID', 'test@example.com', 'Test', 'User')
RETURNING *;
```

### 3. Check Auto-Count

```sql
SELECT name, total_subscribers FROM mailing_lists WHERE name = 'Test List';
-- Should show 1 subscriber
```

### 4. Create Campaign

```sql
INSERT INTO email_campaigns (name, subject, body, mailing_list_id, status)
VALUES ('Test Campaign', 'Hello {{first_name}}', '<p>Test</p>', 'YOUR_LIST_ID', 'draft')
RETURNING *;
```

### 5. Clean Up

```sql
DELETE FROM mailing_lists WHERE name = 'Test List';
-- Cascade delete removes subscribers and campaigns
```

## Troubleshooting

### Error: relation "admin_users" does not exist

**Solution:** Run earlier migrations first. This migration depends on the `admin_users` table.

```bash
# Apply all migrations in order
supabase db push
```

### Error: permission denied

**Solution:** Ensure your user has sufficient privileges:

```sql
GRANT ALL ON SCHEMA public TO your_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO your_user;
```

### Migration already applied manually

**Solution:** Mark it as applied in Supabase:

```bash
supabase migration repair 20251226053932 --status applied
```

### Counts not updating

**Solution:** Check if triggers exist:

```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND trigger_name IN ('update_mailing_list_count_trigger', 'update_campaign_counts_trigger');
```

If missing, rerun the migration or manually create triggers.

## API Usage

After migration, these endpoints work:

```
GET    /api/admin/mailing-lists
POST   /api/admin/mailing-lists
GET    /api/admin/mailing-lists/[id]/subscribers
POST   /api/admin/mailing-lists/[id]/subscribers
POST   /api/admin/mailing-lists/[id]/import
DELETE /api/admin/mailing-lists/[id]/subscribers
GET    /api/admin/campaigns
POST   /api/admin/campaigns
POST   /api/admin/campaigns/[id]/send
```

## Security

All tables have RLS enabled with policies:

- ✅ Authenticated users can manage all data
- ✅ System-level operations for campaign sending
- ✅ Foreign key constraints prevent orphaned data
- ✅ Check constraints validate status values

## Performance

Indexes created for:
- Foreign keys (list_id, campaign_id)
- Email lookups
- Status filtering
- Tag searches (GIN index)

Expected query times:
- List lookup: <10ms
- Subscriber search by email: <5ms
- Campaign filtering by status: <10ms
- Tag search: <20ms

## Maintenance

### Backup Before Major Changes

```bash
pg_dump -h your-host -U postgres -d postgres \
  -t mailing_lists \
  -t mailing_list_subscribers \
  -t email_campaigns \
  -t campaign_recipients \
  > email_campaigns_backup.sql
```

### Restore

```bash
psql -h your-host -U postgres -d postgres < email_campaigns_backup.sql
```

### Manual Count Refresh

If counts get out of sync:

```sql
UPDATE mailing_lists ml
SET total_subscribers = (
  SELECT COUNT(*) 
  FROM mailing_list_subscribers mls 
  WHERE mls.mailing_list_id = ml.id
);
```

## Next Steps

1. ✅ Apply migration
2. ✅ Run verification script
3. ✅ Test basic operations
4. ✅ Access admin panel: `/admin/mailing-lists`
5. ✅ Create first mailing list
6. ✅ Import subscribers
7. ✅ Send first campaign

## Support

- 📖 Full docs: `MIGRATION_GUIDE.md`
- 📖 Detailed migration docs: `supabase/migrations/README.md`
- 📖 Feature guide: `MAILING_LIST_FEATURES.md`
- 📖 Implementation: `IMPLEMENTATION_SUMMARY.md`

## Change History

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-26 | 1.0 | Initial migration created || 2025-12-30 | 1.1 | Fixed table creation order, added `template_id` column |

## Known Issues & Fixes

### template_id Column Missing (Fixed in v1.1)

**Symptoms:** API errors when creating campaigns with `template_id`

**Solution:** If you ran the migration before Dec 30, 2025, apply the patch:
```bash
supabase db push supabase/migrations/20251230_patch_email_campaigns_template_id.sql
```