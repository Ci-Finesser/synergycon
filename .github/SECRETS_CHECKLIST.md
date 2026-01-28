# GitHub Secrets Configuration Checklist

This file lists all the GitHub Secrets required for the deployment pipeline to work correctly.

## Required Secrets for Deployment

Go to: **Settings → Secrets and variables → Actions** in your GitHub repository

### 1. Azure Container Registry Secrets

- ✅ `ACR_USERNAME` - Azure Container Registry username
- ✅ `ACR_PASSWORD` - Azure Container Registry password

### 2. Azure Web App Secrets

- ✅ `AZURE_WEBAPP_PUBLISH_PROFILE` - Azure Web App publish profile

### 3. Supabase Migration Secrets (NEW - Required)

- ⚠️ `SUPABASE_ACCESS_TOKEN` - Personal access token from website
- ⚠️ `SUPABASE_PROJECT_REF` - Project reference ID (found in Settings → General)
- ⚠️ `SUPABASE_DB_PASSWORD` - Database password (found in Settings → Database)

## How to Add Secrets

1. Navigate to your GitHub repository
2. Click **Settings**
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Enter the name and value
6. Click **Add secret**

## Verifying Secrets

After adding the secrets, you can verify they're set correctly by:

1. Going to Settings → Secrets and variables → Actions
2. You should see all secret names listed (values are hidden)
3. Run a deployment to test

## Getting Supabase Credentials

### SUPABASE_ACCESS_TOKEN

1. Go to https://supabase.com/dashboard/account/tokens
2. Click "Generate new token"
3. Name it "GitHub Actions Deploy"
4. Copy the token immediately (it won't be shown again)
5. Add it as a GitHub secret

### SUPABASE_PROJECT_REF

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT
2. Click Settings → General
3. Find "Reference ID" (format: `abcdefghijklmnop`)
4. Copy and add as GitHub secret

### SUPABASE_DB_PASSWORD

1. Go to your Supabase project dashboard
2. Click Settings → Database
3. Copy the database password
4. If you forgot it, you can reset it (will require updating env vars)
5. Add it as a GitHub secret

## Security Best Practices

- ✅ Never commit secrets to the repository
- ✅ Rotate secrets regularly (every 90 days recommended)
- ✅ Use secrets with minimum required permissions
- ✅ Document when secrets are rotated
- ✅ Audit secret usage in GitHub Actions logs

## Testing

After adding all secrets, test the deployment:

```bash
# Trigger a deployment by pushing to main
git add .
git commit -m "Add migration secrets"
git push origin main
```

Watch the GitHub Actions workflow to ensure migrations run successfully.

## Secret Rotation Schedule

Document when secrets were last updated:

| Secret | Last Updated | Next Rotation |
|--------|--------------|---------------|
| ACR_USERNAME | TBD | TBD |
| ACR_PASSWORD | TBD | TBD |
| AZURE_WEBAPP_PUBLISH_PROFILE | TBD | TBD |
| SUPABASE_ACCESS_TOKEN | TBD | TBD |
| SUPABASE_PROJECT_REF | N/A | N/A |
| SUPABASE_DB_PASSWORD | TBD | TBD |
