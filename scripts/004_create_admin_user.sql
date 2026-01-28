-- Create admin user in Supabase Auth
-- This script creates the admin user with the credentials shown on the login page
-- Email: admin@finesser.co
-- Password: SynergyCon2024Admin!

-- Note: This uses Supabase's admin API to create a user
-- The password hash is for: SynergyCon2024Admin!
-- In production, you would run this via Supabase Dashboard or API

-- Insert the admin user directly into auth.users
-- This approach requires superuser access, typically done via Supabase Dashboard SQL Editor
-- Or you can use the Supabase Management API

-- For now, this is a placeholder that documents the admin credentials
-- Users should create the admin account via:
-- 1. Supabase Dashboard → Authentication → Users → Add User
-- 2. Email: admin@finesser.co
-- 3. Password: SynergyCon2024Admin!
-- 4. Disable "Send email confirmation" since this is an admin account

-- Alternative: Use Supabase CLI or Management API to create user programmatically
-- But for security reasons, v0 cannot execute this directly

SELECT 'Admin user should be created manually in Supabase Dashboard' as instructions;
SELECT 'Email: admin@finesser.co' as email;
SELECT 'Password: SynergyCon2024Admin!' as password;
SELECT 'Make sure to disable email confirmation for this admin account' as important_note;
