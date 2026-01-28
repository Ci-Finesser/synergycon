# Database Migration Setup - Quick Start

## Overview

Database migrations are now **automatically executed** during every deployment to ensure your database schema stays synchronized with your application code.

## What Was Added

### 1. GitHub Actions Integration
- Migrations run automatically before Docker build
- Uses Supabase CLI for reliable execution
- See [.github/workflows/deploy.yml](.github/workflows/deploy.yml)

### 2. Migration Scripts
- **Node.js Script**: [scripts/migrate.js](scripts/migrate.js) - Fallback migration runner
- **Bash Script**: [scripts/migrate.sh](scripts/migrate.sh) - CLI-based migration runner

### 3. NPM Scripts
Added to [package.json](package.json):
- `pnpm run migrate` - Run migrations (Node.js)
- `pnpm run migrate:cli` - Run migrations (bash)
- `pnpm run db:push` - Push migrations (Supabase CLI - recommended)
- `pnpm run db:reset` - Reset local database

### 4. Documentation
- **[DEPLOYMENT_MIGRATIONS.md](DEPLOYMENT_MIGRATIONS.md)** - Complete migration guide
- **[.github/SECRETS_CHECKLIST.md](.github/SECRETS_CHECKLIST.md)** - Required GitHub secrets
- **[PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist

## Required Setup (ONE TIME)

### Step 1: Configure GitHub Secrets

Add these secrets in GitHub repository settings:

1. **SUPABASE_ACCESS_TOKEN**
   - Get from: https://supabase.com/dashboard/account/tokens
   - Create new token named "GitHub Actions Deploy"

2. **SUPABASE_PROJECT_REF**
   - Get from: Project Settings → General → Reference ID
   - Example format: `abcdefghijklmnop`

3. **SUPABASE_DB_PASSWORD**
   - Get from: Project Settings → Database
   - Your database password

See detailed instructions: [.github/SECRETS_CHECKLIST.md](.github/SECRETS_CHECKLIST.md)

### Step 2: Install Supabase CLI Locally

```bash
# macOS
brew install supabase/tap/supabase

# Windows (npm install -g supabase NOT supported)
# Use Scoop:
scoop install supabase
# Or use npx (no install needed):
npx supabase --version

# Linux
curl -fsSL https://deb.supabase.com/supabase-cli.sh | bash
```

**⚠️ Windows Users:** Do NOT use `npm install -g supabase`. Use Scoop or npx instead.

### Step 3: Link to Your Project

```bash
supabase link --project-ref your-project-ref
```

## How It Works

### Automatic Deployment Flow

```
1. Push to main branch
   ↓
2. GitHub Actions triggers
   ↓
3. Setup Supabase CLI
   ↓
4. Run database migrations ← NEW STEP
   ↓
5. Build Docker image
   ↓
6. Push to Azure Container Registry
   ↓
7. Deploy to Azure Web App
```

### Migration Tracking

- Supabase automatically tracks applied migrations
- Migrations run only once (idempotent)
- Failed migrations prevent deployment
- Rollback support available

## Daily Development

### Creating a New Migration

```bash
# Create new migration file
supabase migration new add_user_preferences

# Edit the generated file in supabase/migrations/
# Add your SQL changes

# Test locally
pnpm run db:push

# Commit and push
git add supabase/migrations/
git commit -m "Add user preferences migration"
git push origin main
```

### Testing Migrations Locally

```bash
# Apply all pending migrations
pnpm run db:push

# Reset database to clean state
pnpm run db:reset
```

### Manual Migration Execution

If you need to run migrations manually:

```bash
# Using Supabase CLI (recommended)
supabase db push

# Using Node.js script
pnpm run migrate

# Using bash script
pnpm run migrate:cli
```

## Deployment

### Normal Deployment

Just push to main - migrations run automatically:

```bash
git push origin main
```

### Monitoring

1. Go to GitHub Actions tab in your repository
2. Watch the deployment workflow
3. Check "Run Database Migrations" step
4. Verify success before deployment continues

### If Migration Fails

The deployment will stop automatically. To fix:

1. Check GitHub Actions logs for errors
2. Fix the migration SQL
3. Test locally: `pnpm run db:push`
4. Commit fix and push again

## Best Practices

✅ **DO:**
- Test migrations locally first
- Keep migrations small and focused
- Add comments explaining complex changes
- Create rollback migrations for major changes
- Review migration before pushing

❌ **DON'T:**
- Edit already-applied migrations
- Skip local testing
- Deploy during high-traffic periods
- Make destructive changes without backups

## Troubleshooting

### "Migration already applied"
This is normal - Supabase tracks applied migrations. No action needed.

### "Connection refused"
Check your GitHub secrets are correctly configured.

### "Syntax error in SQL"
Test the migration locally first with `pnpm run db:push`.

### Need to rollback?
Create a new migration that reverses the changes.

## Quick Reference

| Command | Description |
|---------|-------------|
| `pnpm run db:push` | Apply migrations locally |
| `pnpm run db:reset` | Reset local database |
| `supabase migration new name` | Create new migration |
| `supabase db push` | Push migrations (direct) |

## Documentation Links

- 📘 [Complete Migration Guide](DEPLOYMENT_MIGRATIONS.md)
- 🔐 [GitHub Secrets Setup](.github/SECRETS_CHECKLIST.md)
- ✅ [Pre-Deployment Checklist](PRE_DEPLOYMENT_CHECKLIST.md)
- 🗂️ [Migration Files](supabase/migrations/README.md)
- 🚀 [Deployment Workflow](.github/workflows/deploy.yml)

## Support

For issues or questions:
1. Check [DEPLOYMENT_MIGRATIONS.md](DEPLOYMENT_MIGRATIONS.md) troubleshooting section
2. Review [TESTING_GUIDE.md](TESTING_GUIDE.md) for testing scenarios
3. Check GitHub Actions logs for deployment errors
4. Contact the development team

---

**Status**: ✅ Migrations are now automated in deployment pipeline

**Last Updated**: December 29, 2025
