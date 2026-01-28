# Database Migration Setup for Deployment

This document describes how database migrations are automatically executed during deployment of the SynergyCon website.

## Overview

Database migrations are now automatically applied during the CI/CD deployment process using GitHub Actions. This ensures that your database schema stays in sync with your application code.

## How It Works

### 1. GitHub Actions Workflow

The [.github/workflows/deploy.yml](.github/workflows/deploy.yml) workflow includes a migration step that runs **before** building and deploying the Docker container:

```yaml
- name: Run Database Migrations
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
    SUPABASE_PROJECT_REF: ${{ secrets.SUPABASE_PROJECT_REF }}
    SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
  run: |
    supabase link --project-ref $SUPABASE_PROJECT_REF
    supabase db push
```

### 2. Migration Files

All migration files are stored in the [supabase/migrations](supabase/migrations) directory and follow the naming convention:

```
{timestamp}_{description}.sql
```

Example:
```
20251226053932_create_email_campaigns_schema.sql
```

### 3. Migration Tracking

Supabase CLI automatically tracks which migrations have been applied using a `schema_migrations` table in your database. This prevents migrations from being run multiple times.

## Required GitHub Secrets

You must configure these secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

### SUPABASE_ACCESS_TOKEN
Your Supabase personal access token for CLI authentication.

**How to get it:**
1. Go to https://supabase.com/dashboard/account/tokens
2. Click "Generate new token"
3. Give it a descriptive name (e.g., "GitHub Actions Deploy")
4. Copy the token and add it as a GitHub secret

### SUPABASE_PROJECT_REF
Your Supabase project reference ID.

**How to get it:**
1. Go to your project dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT
2. Go to Settings → General
3. Copy the "Reference ID" (it looks like: `abcdefghijklmnop`)

### SUPABASE_DB_PASSWORD
Your database password.

**How to get it:**
1. Go to your project dashboard
2. Go to Settings → Database
3. Copy the database password
4. If you don't have it, you can reset it (this will require updating your connection strings)

## Local Development

### Running Migrations Locally

You can run migrations locally using the Supabase CLI:

```bash
# Install dependencies
pnpm install

# Link to your Supabase project (one-time setup)
supabase link --project-ref your-project-ref

# Apply all pending migrations
pnpm run db:push

# Or use the CLI directly
supabase db push
```

### Creating New Migrations

```bash
# Create a new migration file
supabase migration new your_migration_name

# This creates: supabase/migrations/{timestamp}_your_migration_name.sql
# Edit the file to add your SQL changes
```

### Available Scripts

The following npm scripts are available in [package.json](package.json):

- `pnpm run migrate` - Run migrations using Node.js script (fallback)
- `pnpm run migrate:cli` - Run migrations using bash script
- `pnpm run db:push` - Push migrations using Supabase CLI (recommended)
- `pnpm run db:reset` - Reset local database to migration state

## Manual Migration

If you need to run migrations manually (e.g., during hotfix):

### Option 1: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not already installed
# macOS: brew install supabase/tap/supabase
# Linux: curl -fsSL https://deb.supabase.com/supabase-cli.sh | bash
# Windows: scoop install supabase

# Link to project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Option 2: Using SQL Editor

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Open the migration file from `supabase/migrations/`
4. Copy and paste the SQL
5. Execute the query

### Option 3: Using the Migration Script

```bash
# Set environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run the migration script
pnpm run migrate
```

## Deployment Flow

The complete deployment process now follows this sequence:

1. **Code Checkout** - GitHub Actions checks out the latest code
2. **Setup Supabase CLI** - Installs the Supabase CLI tools
3. **Run Migrations** - Applies any pending database migrations
4. **Build Docker Image** - Builds the application container
5. **Push to Registry** - Pushes image to Azure Container Registry
6. **Deploy to Azure** - Deploys the new container to Azure Web App

This ensures that the database schema is always updated **before** the new application code is deployed, preventing compatibility issues.

## Troubleshooting

### Migration Failed in CI/CD

If a migration fails during deployment:

1. Check the GitHub Actions logs for error details
2. Review the failing migration SQL
3. Test the migration locally first
4. Fix the issue and push a new commit

### Migration Already Applied

The Supabase CLI automatically tracks applied migrations. If you see "already applied" messages, this is normal and not an error.

### Connection Issues

If you see connection errors:

1. Verify your GitHub secrets are correctly set
2. Check that your Supabase project is accessible
3. Ensure your database password hasn't been reset
4. Verify your project reference ID is correct

### Rollback a Migration

If you need to rollback a migration:

```bash
# Create a rollback migration
supabase migration new rollback_feature_name

# Edit the file to add the rollback SQL
# Then push it
supabase db push
```

## Best Practices

1. **Test Locally First** - Always test migrations on your local Supabase instance before pushing to production
2. **Keep Migrations Small** - Create focused migrations that do one thing well
3. **Never Edit Applied Migrations** - Once a migration is applied, create a new migration to make changes
4. **Use Transactions** - Wrap your migrations in transactions when possible for atomic changes
5. **Add Rollback Scripts** - Consider creating rollback migrations for complex changes
6. **Document Changes** - Add comments in your migration SQL to explain what and why

## Security Notes

- **Never commit** your Supabase access tokens or passwords to the repository
- Always use GitHub Secrets for sensitive credentials
- Use the service role key only in secure server environments
- The Supabase CLI uses secure authentication methods
- Migration files are part of your codebase and should be reviewed like code

## Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Migration Files Directory](supabase/migrations/README.md)

## Support

If you encounter issues with migrations:

1. Check the [TESTING_GUIDE.md](TESTING_GUIDE.md) for common scenarios
2. Review the Supabase documentation
3. Check GitHub Actions logs for deployment errors
4. Contact the development team for assistance
