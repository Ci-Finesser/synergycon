# Schema Altering Migrations - January 8, 2026

## ✅ Migration Status: COMPLETE

All migrations have been successfully applied to the remote database.

### Verification Results
- **Tables**: 43 public tables
- **Index Hit Rate**: 99%
- **Table Hit Rate**: 100%
- **Total Database Size**: 15 MB
- **Total Index Size**: 2,320 KB

---

## Overview

This document summarizes the schema review and altering migrations created to align the database with TypeScript type definitions.

## Analysis Summary

The review compared TypeScript types in `/types/` directory against existing database migrations and identified the following gaps:

### Gap Categories

1. **Missing Core Tables** - Tables defined in scripts but not in migrations
2. **Missing Columns** - Fields in TypeScript types not in database schema
3. **Inconsistent Naming** - `admins` vs `admin_users` table naming
4. **Missing References** - Foreign key relationships not established
5. **Missing Features** - Refunds, discount codes, enterprise features

## New Migrations Created

### 1. `20260108200000_create_core_tables.sql`

Creates foundational tables that other migrations depend on:

| Table | Purpose |
|-------|---------|
| `admin_users` | Unified admin user management |
| `registrations` | Event registration records |
| `speakers` | Speaker profiles with all fields from types |
| `sponsors` | Sponsor/partner profiles |
| `testimonials` | Event testimonials |
| `gallery_items` | Gallery/media content |
| `schedule_sessions` | Event schedule management |

**Key Features:**
- Creates `admins` view for backward compatibility
- Includes RLS policies for all tables
- Adds comprehensive indexes
- Creates `update_updated_at_column()` trigger function

### 2. `20260108200100_alter_speaker_applications.sql`

Adds missing columns to `speaker_applications`:

| Column | Type | Description |
|--------|------|-------------|
| `full_name` | TEXT | Auto-generated from first_name + last_name |
| `role` | TEXT | Speaker role (keynote, panelist, etc.) |
| `twitter_url` | TEXT | Twitter profile URL |
| `website_url` | TEXT | Personal website URL |
| `topic` | TEXT | Synced with topic_title |
| `previous_speaking` | TEXT | Previous speaking experience |
| `headshot_url` | TEXT | Profile photo URL |
| `confirmed` | BOOLEAN | Participation confirmation |

### 3. `20260108200200_alter_partnership_applications.sql`

Adds missing columns to `partnership_applications`:

| Column | Type | Description |
|--------|------|-------------|
| `partnership_type` | TEXT | Type: sponsor, exhibitor, media, vendor |
| `message` | TEXT | Additional contact message |

### 4. `20260108200300_alter_user_profiles.sql`

Adds public profile fields based on `UserProfile` interface:

| Column | Type | Description |
|--------|------|-------------|
| `public_name` | TEXT | Display name for public profile |
| `public_title` | TEXT | Job title for public profile |
| `public_company` | TEXT | Company for public profile |
| `public_bio` | TEXT | Bio for public profile |
| `public_linkedin_url` | TEXT | LinkedIn URL for sharing |
| `public_twitter_url` | TEXT | Twitter URL for sharing |
| `public_instagram_url` | TEXT | Instagram URL for sharing |
| `public_website_url` | TEXT | Website URL for sharing |
| `organization` | TEXT | Private organization field |
| `industry` | TEXT | Industry sector |
| `dietary_requirements` | TEXT | Dietary needs |
| `special_needs` | TEXT | Accessibility needs |

**Creates:**
- `public_user_profiles` view for shareable profile pages
- Auto-sync trigger for public fields

### 5. `20260108200400_enhance_payments_tickets.sql`

Comprehensive payment and ticket system enhancements:

**Payments Table Additions:**
| Column | Description |
|--------|-------------|
| `payment_method` | Payment method used |
| `processor_ref` | External processor reference |
| `processor_response` | Raw processor response (JSONB) |
| `ip_address` | For fraud detection |
| `coupon_code` | Applied discount code |
| `discount_amount` | Discount value |
| `failure_reason` | Reason for failures |

**Tickets Table Additions:**
| Column | Description |
|--------|-------------|
| `ticket_tier` | standard or vip |
| `ticket_duration` | single-day or 3-day |
| `ticket_name` | Display name |
| `checked_in` | Check-in status |
| `valid_for_day` | Specific valid day |

**New Tables Created:**
- `refunds` - Refund request tracking
- `discount_codes` - Coupon/discount code management

### 6. `20260108200500_add_enterprise_team_tables.sql`

Enterprise and team management features:

| Table | Purpose |
|-------|---------|
| `enterprise_members` | Team member management for enterprise tickets |
| `barcode_scans` | QR code/barcode scan records |
| `sharing_templates` | Social media sharing templates |
| `speaker_communications` | Speaker communication history |

### 7. `20260108200600_schema_verification.sql`

Schema integrity verification and statistics:

**New Views:**
- `registration_stats` - Registration analytics
- `speaker_stats` - Speaker analytics
- `sponsor_stats` - Sponsor analytics
- `application_stats` - Combined application analytics
- `newsletter_stats` - Newsletter subscription stats

**Functions:**
- `get_dashboard_stats()` - Comprehensive dashboard JSON
- `verify_schema_integrity()` - Schema validation checks

## Running Migrations

```bash
# Run all migrations
pnpm migrate

# Or using Supabase CLI
supabase db push

# Or manually via SQL Editor in Supabase Dashboard
```

## Verification

After running migrations, execute the schema verification:

```sql
SELECT * FROM verify_schema_integrity();
```

Expected output:
```
check_name           | status | details
---------------------|--------|---------------------------
core_tables          | PASS   | Found 10+ core tables
rls_enabled          | PASS   | RLS enabled on N tables
indexes              | PASS   | Found 20+ indexes
updated_at_triggers  | PASS   | Found 5+ update triggers
```

## Type-to-Schema Mapping

| TypeScript Type | Database Table | Status |
|-----------------|----------------|--------|
| `User` | `auth.users` | ✅ Supabase managed |
| `UserProfile` | `user_profiles` | ✅ Enhanced |
| `AdminUser` | `admin_users` | ✅ Created |
| `SpeakerApplication` | `speaker_applications` | ✅ Enhanced |
| `PartnershipApplication` | `partnership_applications` | ✅ Enhanced |
| `Speaker` | `speakers` | ✅ Created with full schema |
| `Sponsor` | `sponsors` | ✅ Created with full schema |
| `Ticket` | `tickets` | ✅ Enhanced |
| `TicketType` | `ticket_types` | ✅ Enhanced |
| `TicketOrder` | `ticket_orders` | ✅ Enhanced |
| `Payment` | `payments` | ✅ Enhanced |
| `EnterpriseMember` | `enterprise_members` | ✅ Created |
| `BarcodeScan` | `barcode_scans` | ✅ Created |
| `SharingTemplate` | `sharing_templates` | ✅ Created |
| `SpeakerCommunication` | `speaker_communications` | ✅ Created |
| `RefundRecord` | `refunds` | ✅ Created |

## Notes

1. **Backward Compatibility**: The `admins` view provides compatibility with scripts referencing the old table name.

2. **Idempotent Migrations**: All migrations use `IF NOT EXISTS` and `IF EXISTS` checks to be safely re-run.

3. **RLS Policies**: All new tables have Row Level Security enabled with appropriate policies.

4. **Indexes**: Performance indexes added for common query patterns.

5. **Triggers**: All tables with `updated_at` columns have automatic update triggers.

## Related Documentation

- [Migration Guide](../docs/migration/MIGRATION_GUIDE.md)
- [Pre-Deployment Checklist](../docs/migration/PRE_DEPLOYMENT_CHECKLIST.md)
- [Project Architecture](../docs/architecture/Project_Architecture_Blueprint.md)
