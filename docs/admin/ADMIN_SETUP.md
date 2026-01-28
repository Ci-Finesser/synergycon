# Admin Setup Instructions

## Creating the Admin User

The admin login requires a user to be created in Supabase Auth first. Follow these steps:

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User**
4. Enter the following details:
   - Email: `admin@synergycon.live`
   - Password: `SynergyCon2024Admin!`
   - **Important**: Uncheck "Send email confirmation" since this is an admin account
5. Click **Create User**

### Option 2: Via Sign Up (Development Only)

If you prefer, you can use the sign-up flow programmatically:

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'admin@synergycon.live',
  password: 'SynergyCon2024Admin!',
  options: {
    emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/admin`,
  }
})
```

**Note**: If email confirmation is enabled in your Supabase project, you'll need to confirm the email before you can log in.

## Login Credentials

- **Email**: admin@synergycon.live
- **Password**: SynergyCon2024Admin!

## Security Notes

- Change the admin password in production
- Enable email confirmation for production environments
- Use Row Level Security (RLS) policies to protect admin routes
- Consider implementing role-based access control using user metadata

## Accessing the Admin Dashboard

1. Visit `/admin/login`
2. Enter the admin credentials
3. You'll be redirected to `/admin` dashboard
4. From there you can manage:
   - Speakers
   - Schedule
   - Sponsors & Partners
   - Gallery
   - Registrations
   - Newsletters
