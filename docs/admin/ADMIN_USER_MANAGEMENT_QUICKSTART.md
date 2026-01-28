# Admin User Management - Quick Start

## 🚀 Get Started in 3 Steps

### Step 1: Run Database Migration

Open Supabase SQL Editor and run:

```sql
-- File: scripts/018_create_admin_management_functions.sql
```

Or using Supabase CLI:
```bash
supabase db push
```

### Step 2: Access Admin Management

**Option A:** Click "Admins" button in navigation bar

**Option B:** Visit directly: `/admin/users`

**Option C:** Click "Admin Users" card on dashboard

### Step 3: Create Your First Admin

1. Click **"Create Admin"** button
2. Fill in:
   - **Full Name**: Admin's display name
   - **Email**: Valid email (will be unique)
   - **Password**: Minimum 8 characters
   - **Role**: Admin or Super Admin
3. Click **"Create Admin"** → Done! ✅

---

## 🎯 Quick Actions

### View All Admins
- Navigate to `/admin/users`
- See all admins in card layout
- View email, role, and join date

### Create New Admin
```
1. Click "Create Admin"
2. Fill form (name, email, password, role)
3. Submit
```

### Delete Admin
```
1. Find admin card
2. Click "Delete Admin"
3. Confirm deletion
Note: You cannot delete yourself
```

---

## 🔐 Security Notes

✅ **All actions require authentication**  
✅ **CSRF protection enabled**  
✅ **Passwords are hashed (bcrypt)**  
✅ **Rate limiting active**  
✅ **Self-deletion blocked**

---

## 📋 What You See

### Admin Card Information
- 👤 **Name** - Full name of admin
- ✉️ **Email** - Contact email
- 🏷️ **Role Badge** - Admin or Super Admin
- 📅 **Join Date** - When account was created
- ✅ **"You" Badge** - For your own account

### Role Types
- **Admin** (Blue badge) - Standard admin access
- **Super Admin** (Purple badge) - Full system access

---

## ⚡ Pro Tips

💡 **Create strong passwords** - At least 8 characters with mixed case, numbers, symbols

💡 **Use descriptive names** - Makes it easier to identify admins

💡 **Assign appropriate roles** - Give super_admin only to trusted users

💡 **Regular cleanup** - Delete inactive admin accounts

💡 **Track your team** - Review admin list regularly

---

## 🆘 Troubleshooting

### "Failed to fetch admins"
→ Run database migration first

### "Email already exists"
→ Use a different email address

### "Unauthorized"
→ Log in again (session expired)

### "Cannot delete yourself"
→ This is intentional (safety feature)

---

## 📚 Need More Help?

See full documentation: [`ADMIN_USER_MANAGEMENT.md`](./ADMIN_USER_MANAGEMENT.md)

---

**That's it!** You're ready to manage admin users. 🎉
