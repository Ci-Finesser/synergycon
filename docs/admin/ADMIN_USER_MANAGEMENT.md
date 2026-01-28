# Admin User Management - Implementation Guide

## Overview

The admin user management system allows existing administrators to create, view, and delete admin accounts through a secure web interface. This feature is essential for managing access to the SynergyCon admin dashboard.

## Features

### ✅ Implemented Features

1. **View All Admins** - List all admin users with their details
2. **Create New Admin** - Add new admin users with email, password, and role
3. **Delete Admin** - Remove admin accounts (with self-deletion protection)
4. **Role Management** - Assign roles (admin or super_admin)
5. **Security Features**:
   - CSRF protection
   - Honeypot fields
   - Rate limiting
   - Password strength validation
   - Email format validation
   - Session-based authentication

## File Structure

### API Routes
- **`app/api/admin/users/route.ts`** - REST API for admin management
  - GET: Fetch all admins
  - POST: Create new admin
  - DELETE: Remove admin

### Database Functions
- **`scripts/018_create_admin_management_functions.sql`** - Database functions
  - `get_all_admins()` - Retrieve admin list
  - `create_admin_user()` - Create new admin with hashed password
  - `delete_admin_user()` - Delete admin by ID
  - `update_admin_user()` - Update admin details
  - `reset_admin_password()` - Reset admin password

### UI Components
- **`app/admin/users/page.tsx`** - Admin management page
- **`components/admin/admin-users-manager.tsx`** - Main management component
- **`components/admin-navigation.tsx`** - Updated with "Admins" link

## Database Schema

### Admins Table (Existing)

The system assumes an existing `admins` table with the following structure:

```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Installation Steps

### 1. Run Database Migration

Execute the SQL script to create the necessary database functions:

```bash
# Via Supabase CLI
supabase db push

# Or via SQL Editor in Supabase Dashboard
# Copy and run: scripts/018_create_admin_management_functions.sql
```

### 2. Verify Permissions

Ensure the database user has the necessary permissions to execute the functions:

```sql
-- Grant execute permissions (if needed)
GRANT EXECUTE ON FUNCTION get_all_admins() TO authenticated;
GRANT EXECUTE ON FUNCTION create_admin_user(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_admin_user(UUID) TO authenticated;
```

### 3. Access the Feature

Navigate to `/admin/users` in your browser or click the "Admins" button in the admin navigation.

## Usage

### Creating a New Admin

1. Click the **"Create Admin"** button
2. Fill in the form:
   - **Full Name**: Admin's display name
   - **Email**: Valid email address (must be unique)
   - **Password**: At least 8 characters
   - **Role**: Choose "Admin" or "Super Admin"
3. Click **"Create Admin"**

### Deleting an Admin

1. Find the admin card you want to delete
2. Click the **"Delete Admin"** button
3. Confirm the deletion in the dialog
4. **Note**: You cannot delete your own account

### Viewing Admin Details

Each admin card displays:
- Full name
- Email address
- Role badge (Admin or Super Admin)
- Date joined
- "You" indicator for current user

## Security Considerations

### Authentication
- All endpoints require valid admin session
- Session validation via cookies
- Unauthorized requests return 401 status

### Authorization
- Self-deletion is prevented
- Role-based access (can be extended)

### Input Validation
- Email format validation
- Password strength requirements (min 8 characters)
- SQL injection prevention via parameterized queries
- CSRF token verification
- Honeypot field checks
- Rate limiting on create endpoint

### Password Security
- Passwords are hashed using bcrypt (via pgcrypto)
- Salt factor: 10
- Passwords never stored in plain text
- Passwords never returned in API responses

## API Documentation

### GET /api/admin/users

Fetch all admin users.

**Response:**
```json
{
  "admins": [
    {
      "id": "uuid",
      "email": "admin@example.com",
      "full_name": "John Doe",
      "role": "admin",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/admin/users

Create a new admin user.

**Request:**
```json
{
  "email": "newadmin@example.com",
  "password": "SecurePass123",
  "full_name": "Jane Smith",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "admin": {
    "id": "uuid",
    "email": "newadmin@example.com",
    "full_name": "Jane Smith",
    "role": "admin"
  }
}
```

### DELETE /api/admin/users

Delete an admin user.

**Request:**
```json
{
  "admin_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin user deleted successfully"
}
```

## Error Handling

### Common Errors

| Error | Status | Description |
|-------|--------|-------------|
| `Unauthorized` | 401 | No valid admin session |
| `Invalid session` | 401 | Malformed session cookie |
| `Email and password are required` | 400 | Missing required fields |
| `Invalid email format` | 400 | Email doesn't match regex |
| `Password must be at least 8 characters` | 400 | Weak password |
| `An admin with this email already exists` | 409 | Duplicate email |
| `You cannot delete your own admin account` | 400 | Self-deletion attempt |
| `Failed to create admin user` | 500 | Database error |

## UI Screenshots

### Admin Management Page
- Clean card-based layout
- Responsive design (mobile-friendly)
- Color-coded role badges
- Current user indicator

### Create Admin Dialog
- Modal form with validation
- Role selector dropdown
- Password strength hint
- Honeypot fields (hidden)

### Delete Confirmation Dialog
- Shows admin details
- Destructive action warning
- Cancel/Delete buttons

## Future Enhancements

### Potential Features
1. **Edit Admin** - Update name and role
2. **Password Reset** - Reset admin passwords
3. **Role Permissions** - Granular permission system
4. **Activity Logs** - Track admin actions
5. **Bulk Actions** - Batch delete/update
6. **Search/Filter** - Search by name/email
7. **Pagination** - Handle large admin lists
8. **Email Notifications** - Notify on account creation
9. **2FA Management** - Enable/disable 2FA for admins
10. **Last Login** - Show last login timestamp

## Testing Checklist

- [ ] Create admin with valid data
- [ ] Create admin with invalid email
- [ ] Create admin with weak password
- [ ] Create admin with duplicate email
- [ ] Delete admin (not self)
- [ ] Attempt to delete own account
- [ ] View all admins list
- [ ] Verify role badges display correctly
- [ ] Test CSRF protection
- [ ] Test honeypot fields
- [ ] Test rate limiting
- [ ] Verify session validation
- [ ] Check responsive design
- [ ] Test error messages

## Troubleshooting

### "Failed to fetch admins"
- Check database connection
- Verify `get_all_admins()` function exists
- Check Supabase service role key

### "Failed to create admin user"
- Check for duplicate emails
- Verify `create_admin_user()` function exists
- Check pgcrypto extension is enabled
- Review Supabase logs

### "Unauthorized" Error
- Verify admin session cookie
- Check cookie expiration
- Re-login if session expired

### Navigation Link Not Showing
- Clear browser cache
- Verify admin-navigation.tsx was updated
- Check for TypeScript errors

## Related Documentation

- [Admin Session Management](./ADMIN_SESSION_MANAGEMENT.md)
- [Admin 2FA Setup](./ADMIN_2FA_SETUP.md)
- [Security Implementation](./SECURITY_IMPLEMENTATION.md)
- [Admin Setup](./ADMIN_SETUP.md)

## Support

For issues or questions, refer to:
- Project README
- Supabase documentation
- Next.js documentation

---

**Last Updated**: December 29, 2025
**Version**: 1.0
**Status**: ✅ Implementation Complete
