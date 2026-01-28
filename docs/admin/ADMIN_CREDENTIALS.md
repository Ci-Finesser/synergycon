# Admin Access Instructions

## Creating an Admin Account

To access the admin dashboard, you need to create an admin user account in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Add User" and create a new user with:
   - Email: `admin@synergycon.live` (or your preferred admin email)
   - Password: Create a secure password
   - Confirm the email verification if required

## Admin Login & Two-Factor Authentication

### First-Time Login

Once your admin account is created:

1. Visit `/admin/login` on your website
2. Enter your admin email and password
3. **2FA Setup Required**: You'll be automatically redirected to set up two-factor authentication
4. Click "Enable 2FA" to receive a 6-digit code via email
5. Enter the code to complete setup
6. You'll be redirected to the admin dashboard

### Subsequent Logins

After 2FA is enabled:

1. Visit `/admin/login`
2. Enter your email and password
3. **Verification Required**: A 6-digit code will be automatically sent to your email
4. Enter the code on the same page
5. You'll be redirected to the admin dashboard

**Note**: Verification codes expire after 10 minutes. You can request a new code if needed.

## Admin Features

The admin dashboard allows you to manage:

- **Speakers**: Add, edit, and remove speakers with bios, images, and social links
- **Sponsors**: Manage principal and ecosystem partners with logos and details
- **Gallery**: Upload and organize photos, videos, and text content
- **Schedule**: View and manage event schedule
- **Registrations**: View attendee registrations
- **Newsletters**: View newsletter subscriptions
- **Email Campaigns**: Send emails and manage mailing lists
- **Applications**: Review speaker and partner applications
- **Settings**: Manage account security and test 2FA

## Security Features

### Two-Factor Authentication (2FA)

All admin accounts **must** have 2FA enabled. This provides an additional layer of security by requiring:

- ✅ Your password (something you know)
- ✅ A code sent to your email (something you have)

**Benefits:**
- Protects against password theft
- Prevents unauthorized access
- Mandatory for all admins
- Easy email-based verification

**Managing 2FA:**
- Access settings at `/admin/settings`
- View your 2FA status
- Send test verification codes
- Review security information

### Additional Security

- All admin tables have Row Level Security (RLS) enabled
- Only authenticated users can modify content
- Public users can only view published content
- Session cookies are HTTP-only and secure
- Sessions expire after 7 days
- Middleware enforces 2FA verification on all admin routes

## Security Notes

- Keep your admin credentials secure and don't share them
- Store your password in a secure password manager
- Ensure you have access to your admin email for 2FA codes
- Log out when not using the admin panel
- Report any suspicious activity immediately

## Troubleshooting

### Can't Receive 2FA Codes?
- Check your spam/junk folder
- Verify the email address in your admin account
- Try resending the code
- Contact support if issues persist

### Locked Out?
- Ensure you have access to your registered email
- Clear browser cookies and try again
- Contact the system administrator for assistance

For detailed 2FA documentation, see `ADMIN_2FA_SETUP.md`.
