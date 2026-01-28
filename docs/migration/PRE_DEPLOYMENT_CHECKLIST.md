# Pre-Deployment Checklist

Use this checklist before deploying to production.

## Database Migrations

- [ ] All migration files are in `supabase/migrations/` directory
- [ ] Migration files follow naming convention: `{timestamp}_{description}.sql`
- [ ] Migrations tested locally with `pnpm run db:push`
- [ ] No syntax errors in migration SQL
- [ ] Migrations are idempotent (safe to run multiple times if needed)
- [ ] Rollback plan documented for complex migrations

## GitHub Secrets

- [ ] `SUPABASE_ACCESS_TOKEN` is configured
- [ ] `SUPABASE_PROJECT_REF` is configured
- [ ] `SUPABASE_DB_PASSWORD` is configured
- [ ] `ACR_USERNAME` is configured
- [ ] `ACR_PASSWORD` is configured
- [ ] `AZURE_WEBAPP_PUBLISH_PROFILE` is configured

## Code Review

- [ ] All code changes reviewed
- [ ] No hardcoded secrets or credentials
- [ ] Environment variables properly configured
- [ ] Tests passing locally
- [ ] Build succeeds with `pnpm run build`

## Documentation

- [ ] Migration changes documented
- [ ] Breaking changes noted
- [ ] Environment variable changes documented
- [ ] Deployment notes updated

## Deployment Process

1. **Test Locally**
   ```bash
   pnpm install
   pnpm run build
   pnpm run db:push  # Test migrations
   ```

2. **Commit and Push**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

3. **Monitor Deployment**
   - Watch GitHub Actions workflow
   - Check migration step completes successfully
   - Verify Docker build succeeds
   - Confirm Azure deployment

4. **Post-Deployment Verification**
   - [ ] Application loads correctly
   - [ ] Database schema updated
   - [ ] All features working
   - [ ] No errors in logs

## Rollback Plan

If deployment fails:

1. **Check GitHub Actions logs** for error details
2. **Revert if needed**:
   ```bash
   git revert HEAD
   git push origin main
   ```
3. **Database rollback** (if migration caused issues):
   - Create rollback migration
   - Or restore from backup if available

## Emergency Contacts

- Database Admin: [Contact Info]
- DevOps Lead: [Contact Info]
- Supabase Support: support@supabase.io

## Notes

Add any deployment-specific notes here:

---

**Date**: _________________

**Deployer**: _________________

**Deployment Ticket**: _________________
