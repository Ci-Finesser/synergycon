#!/bin/bash

# Migration script using Supabase CLI
# This is the recommended approach for production deployments

set -e

echo "🚀 Starting Supabase migrations..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    
    # Detect OS and install accordingly
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -fsSL https://deb.supabase.com/supabase-cli.sh | bash
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install supabase/tap/supabase
    else
        echo "⚠️  Please install Supabase CLI manually:"
        echo "   https://supabase.com/docs/guides/cli"
        exit 1
    fi
fi

# Validate required environment variables
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ SUPABASE_ACCESS_TOKEN is required"
    exit 1
fi

if [ -z "$SUPABASE_PROJECT_REF" ]; then
    echo "❌ SUPABASE_PROJECT_REF is required"
    exit 1
fi

if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo "❌ SUPABASE_DB_PASSWORD is required"
    exit 1
fi

# Link to Supabase project
echo "🔗 Linking to Supabase project..."
supabase link --project-ref "$SUPABASE_PROJECT_REF" --password "$SUPABASE_DB_PASSWORD"

# Push migrations
echo "📤 Pushing migrations to Supabase..."
supabase db push --password "$SUPABASE_DB_PASSWORD"

echo "✅ Migrations completed successfully!"
