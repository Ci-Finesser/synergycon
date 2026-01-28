# Mailing List & Email Campaign Management

This document describes the new mailing list management and email campaign features added to the SynergyCon admin dashboard.

## Overview

The system provides a complete solution for managing email campaigns with the following capabilities:

- **Mailing Lists**: Create and manage named mailing lists
- **Subscriber Management**: Add subscribers via CSV upload, spreadsheet import, or manual entry
- **Email Campaigns**: Create rich HTML email campaigns with images
- **Personalization**: Use merge fields to personalize emails
- **Campaign Tracking**: Monitor campaign status and delivery

## Database Schema

### Tables Created

1. **mailing_lists** - Stores mailing list information
   - `id` (UUID, primary key)
   - `name` (TEXT) - Name of the mailing list
   - `description` (TEXT) - Optional description
   - `total_subscribers` (INTEGER) - Auto-updated count
   - `created_at`, `updated_at` (TIMESTAMPTZ)
   - `created_by` (UUID) - Reference to admin user

2. **mailing_list_subscribers** - Stores subscriber information
   - `id` (UUID, primary key)
   - `mailing_list_id` (UUID) - Foreign key to mailing_lists
   - `email` (TEXT) - Subscriber email
   - `first_name`, `last_name`, `full_name` (TEXT)
   - `custom_fields` (JSONB) - Additional custom data
   - `status` (TEXT) - active, unsubscribed, bounced
   - `subscribed_at`, `unsubscribed_at` (TIMESTAMPTZ)

3. **email_campaigns** - Stores campaign information
   - `id` (UUID, primary key)
   - `name` (TEXT) - Campaign name
   - `subject` (TEXT) - Email subject line
   - `body` (TEXT) - HTML email content
   - `mailing_list_id` (UUID) - Foreign key to mailing_lists
   - `tags` (TEXT[]) - Array of tags
   - `status` (TEXT) - draft, scheduled, sending, sent, failed
   - `scheduled_at`, `sent_at` (TIMESTAMPTZ)
   - `total_recipients`, `total_sent`, `total_failed` (INTEGER)
   - `created_at`, `updated_at` (TIMESTAMPTZ)
   - `created_by` (UUID) - Reference to admin user

4. **campaign_recipients** - Tracks individual email sends
   - `id` (UUID, primary key)
   - `campaign_id` (UUID) - Foreign key to email_campaigns
   - `email` (TEXT) - Recipient email
   - `personalized_subject`, `personalized_body` (TEXT)
   - `status` (TEXT) - pending, sent, failed, bounced
   - `sent_at` (TIMESTAMPTZ)
   - `error_message` (TEXT)

### Setup Instructions

1. Run the SQL migration script:
   ```bash
   # Connect to your Supabase database and run:
   psql -h <host> -U <user> -d <database> -f scripts/017_create_mailing_lists_and_campaigns.sql
   ```

## API Endpoints

### Mailing Lists

- `GET /api/admin/mailing-lists` - Get all mailing lists
- `POST /api/admin/mailing-lists` - Create a new mailing list
  ```json
  {
    "name": "Newsletter Subscribers",
    "description": "Monthly newsletter recipients"
  }
  ```

### Subscribers

- `GET /api/admin/mailing-lists/[id]/subscribers` - Get subscribers for a list
- `POST /api/admin/mailing-lists/[id]/subscribers` - Add a subscriber
  ```json
  {
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
  ```
- `DELETE /api/admin/mailing-lists/[id]/subscribers?subscriberId=<id>` - Remove a subscriber

### CSV Import

- `POST /api/admin/mailing-lists/[id]/import` - Import subscribers from CSV
  - Content-Type: `multipart/form-data`
  - Field: `file` (CSV file)
  - CSV Format:
    ```csv
    email,first_name,last_name
    john@example.com,John,Doe
    jane@example.com,Jane,Smith
    ```

### Campaigns

- `GET /api/admin/campaigns` - Get all campaigns
- `POST /api/admin/campaigns` - Create a new campaign
  ```json
  {
    "name": "January Newsletter",
    "subject": "Hello {{first_name}}!",
    "body": "<p>Welcome to our newsletter, {{first_name}}!</p>",
    "mailing_list_id": "uuid",
    "tags": ["newsletter", "monthly"],
    "status": "draft"
  }
  ```

### Send Campaign

- `POST /api/admin/campaigns/[id]/send` - Send a campaign
  - Automatically personalizes content for each recipient
  - Updates campaign status to "sending" then "sent"

## Frontend Routes

### Admin Pages

- `/admin/mailing-lists` - View and manage mailing lists
- `/admin/mailing-lists/[id]` - View and manage subscribers in a list
- `/admin/campaigns` - View all campaigns
- `/admin/campaigns/create` - Create a new campaign
- `/admin/campaigns/[id]` - View campaign details

## Features

### 1. Mailing List Management

Create named mailing lists to organize your subscribers:

- Create lists with name and description
- View subscriber count
- Manage multiple lists

### 2. Subscriber Management

Add subscribers through multiple methods:

**Manual Entry:**
- Add individual subscribers with email, first name, and last name
- Validation ensures email format is correct

**CSV Upload:**
- Upload CSV files with bulk subscriber data
- Required column: `email`
- Optional columns: `first_name`, `last_name`
- Additional columns stored as custom fields
- Duplicate emails are handled gracefully

**Spreadsheet Support:**
- CSV format supported
- Excel support can be added with `xlsx` library

### 3. Rich Email Campaign Editor

Create professional HTML emails with:

**Text Formatting:**
- Headers (H1, H2, H3)
- Bold, italic, underline, strikethrough
- Text colors and background colors
- Text alignment (left, center, right)
- Ordered and unordered lists

**Media:**
- Image upload with drag-and-drop
- Images embedded as base64 (no external hosting needed)
- Click-and-position image placement

**Links:**
- Add hyperlinks to text or images

**Editor Features:**
- Live preview mode
- Clean formatting tool
- Undo/redo support

### 4. Personalization

Use merge fields to personalize emails:

- `{{first_name}}` - Recipient's first name
- `{{last_name}}` - Recipient's last name
- `{{full_name}}` - Recipient's full name
- `{{email}}` - Recipient's email address
- Custom fields from CSV imports

**Example:**
```html
<p>Hello {{first_name}},</p>
<p>Thanks for registering with {{email}}!</p>
```

Becomes:
```html
<p>Hello John,</p>
<p>Thanks for registering with john@example.com!</p>
```

### 5. Campaign Management

**Campaign Workflow:**

1. **Create** - Design your email with rich editor
2. **Add Details** - Set name, subject, and select mailing list
3. **Tag** - Add tags for organization
4. **Preview** - See how the email will look
5. **Save Draft** - Save for later editing
6. **Send** - Send to all subscribers in the list

**Campaign Status:**
- `draft` - Being edited
- `sending` - Currently sending
- `sent` - Successfully sent
- `failed` - Send failed

**Tracking:**
- Total recipients
- Total sent
- Total failed
- Sent timestamp

### 6. Email Template Structure

Emails use a consistent template:

```
┌─────────────────────────┐
│ SYNERGYCON 2.0 Header   │
├─────────────────────────┤
│ Email Subject           │
│ (Your content here)     │
│ (With images & links)   │
├─────────────────────────┤
│ Footer with event info  │
│ © Copyright notice      │
└─────────────────────────┘
```

## Technical Implementation

### Dependencies Added

- `react-quill` (v2.0.0) - Rich text editor
- `quill` (v2.0.3) - Core editor library

### Key Components

1. **Rich Text Editor** (`app/admin/campaigns/create/page.tsx`)
   - React Quill integration
   - Custom image upload handler
   - Base64 image embedding
   - Personalization field support

2. **Mailing List Manager** (`app/admin/mailing-lists/page.tsx`)
   - List creation dialog
   - List overview with stats

3. **Subscriber Manager** (`app/admin/mailing-lists/[id]/page.tsx`)
   - Manual entry form
   - CSV upload interface
   - Subscriber list with delete

4. **Campaign Manager** (`app/admin/campaigns/page.tsx`)
   - Campaign list with status badges
   - Tag display
   - Quick actions

### Personalization Engine

The personalization engine (`/api/admin/campaigns/[id]/send/route.ts`) processes merge fields:

1. Extracts subscriber data (name, email, custom fields)
2. Replaces `{{field_name}}` placeholders
3. Stores personalized content per recipient
4. Tracks send status per recipient

## Usage Examples

### Example 1: Create Newsletter List

1. Navigate to `/admin/mailing-lists`
2. Click "Create Mailing List"
3. Enter name: "Monthly Newsletter"
4. Add description: "Subscribers for monthly updates"
5. Click "Create Mailing List"

### Example 2: Import Subscribers from CSV

1. Prepare CSV file:
   ```csv
   email,first_name,last_name,company
   john@example.com,John,Doe,TechCorp
   jane@example.com,Jane,Smith,DesignHub
   ```
2. Go to mailing list detail page
3. Click "Import" tab
4. Upload CSV file
5. See confirmation: "Successfully imported 2 subscriber(s)"

### Example 3: Create and Send Campaign

1. Navigate to `/admin/campaigns`
2. Click "Create Campaign"
3. Fill in campaign details:
   - Name: "January 2026 Newsletter"
   - Subject: "Happy New Year, {{first_name}}!"
   - Select mailing list
   - Add tags: "newsletter", "january"
4. Use rich editor to compose email:
   - Add headers, format text
   - Upload images
   - Add personalization fields
5. Click "Preview" to review
6. Click "Send Campaign"
7. Confirm sending
8. Campaign status updates to "sending" then "sent"

## Best Practices

1. **CSV Format**: Always include a header row with column names
2. **Email Validation**: System validates email format automatically
3. **Image Size**: Keep images reasonably sized (< 1MB) for email compatibility
4. **Personalization**: Always provide fallback values (system uses empty string if field missing)
5. **Testing**: Send to a test list before sending to all subscribers
6. **Duplicates**: System handles duplicate emails in CSV imports gracefully

## Troubleshooting

### CSV Import Fails

- Ensure CSV has an `email` column (or `email address`)
- Check file encoding (UTF-8 recommended)
- Verify no empty rows in CSV

### Images Not Showing

- Images are base64 encoded in emails
- Some email clients may block images by default
- Keep image sizes reasonable (< 500KB recommended)

### Personalization Not Working

- Use exact field names: `{{first_name}}` not `{{firstname}}`
- Field names are case-sensitive
- Ensure subscribers have the field populated

## Future Enhancements

Potential additions:

- [ ] Excel (.xlsx) file support
- [ ] Email scheduling (send at specific time)
- [ ] A/B testing for subjects
- [ ] Click tracking
- [ ] Open rate tracking
- [ ] Unsubscribe link management
- [ ] Email templates library
- [ ] Drag-and-drop email builder
- [ ] Integration with Resend API for actual sending
- [ ] Bounce handling
- [ ] List segmentation
- [ ] Advanced personalization with conditional content

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API endpoint responses for error messages
3. Check browser console for frontend errors
4. Verify database tables were created correctly
