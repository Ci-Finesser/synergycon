# SynergyCon website redesign

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/unmidesigns/v0-synergy-con-website-redesign)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/h2hufyxMAGT)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/unmidesigns/v0-synergy-con-website-redesign](https://vercel.com/unmidesigns/v0-synergy-con-website-redesign)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/h2hufyxMAGT](https://v0.app/chat/h2hufyxMAGT)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Database Setup

This project uses Supabase for the database. Database migrations are managed in the `supabase/migrations/` directory.

### Quick Start

```bash
# Install Supabase CLI
brew install supabase/tap/supabase  # macOS
# or
curl -fsSL https://deb.supabase.com/supabase-cli.sh | bash  # Linux
# or
scoop install supabase  # Windows (⚠️ npm install -g NOT supported)
# or use npx (no install needed):
npx supabase --version

# Link to your project
supabase link --project-ref your-project-ref
# Or with npx: npx supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
# Or with npx: npx supabase db push
```

For detailed instructions, see:
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Complete migration documentation
- **[supabase/migrations/README.md](./supabase/migrations/README.md)** - Migration-specific details
- **[EXECUTE_SCRIPTS.txt](./EXECUTE_SCRIPTS.txt)** - Legacy script execution (deprecated)

## Features

- 🎤 **Speaker Management** - Admin panel for managing conference speakers
- 📅 **Schedule System** - Event scheduling and session management
- 🎫 **Registration** - Attendee registration with Supabase integration
- 🤝 **Partners & Sponsors** - Showcase partners and sponsors
- 📸 **Gallery** - Media gallery for event photos and videos
- 📧 **Email Campaigns** - Complete mailing list and campaign management system
- 🔐 **Admin Dashboard** - Secure admin interface with authentication

### Email Campaign System

The platform includes a comprehensive email marketing system:

- Create and manage multiple mailing lists
- Import subscribers via CSV
- Rich text email editor with image support
- Email personalization with merge fields
- Campaign tracking and analytics
- RLS security policies

See [MAILING_LIST_FEATURES.md](./MAILING_LIST_FEATURES.md) for details.
