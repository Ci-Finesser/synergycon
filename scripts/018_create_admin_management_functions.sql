-- Admin User Management Functions
-- This script creates database functions for managing admin users

-- Function to get all admins (excluding sensitive data)
CREATE OR REPLACE FUNCTION get_all_admins()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.email,
    a.full_name,
    a.role,
    a.created_at
  FROM admins a
  ORDER BY a.created_at DESC;
END;
$$;

-- Function to create a new admin user
CREATE OR REPLACE FUNCTION create_admin_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_role TEXT DEFAULT 'admin'
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
  v_password_hash TEXT;
BEGIN
  -- Check if admin with this email already exists
  IF EXISTS (SELECT 1 FROM admins WHERE admins.email = p_email) THEN
    RAISE EXCEPTION 'Admin with email % already exists', p_email;
  END IF;

  -- Hash the password using pgcrypto
  v_password_hash := crypt(p_password, gen_salt('bf', 10));

  -- Insert new admin
  INSERT INTO admins (email, password_hash, full_name, role)
  VALUES (p_email, v_password_hash, p_full_name, p_role)
  RETURNING admins.id INTO v_admin_id;

  -- Return the created admin info
  RETURN QUERY
  SELECT 
    v_admin_id as id,
    p_email as email,
    p_full_name as full_name,
    p_role as role;
END;
$$;

-- Function to delete an admin user
CREATE OR REPLACE FUNCTION delete_admin_user(p_admin_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the admin (CASCADE will handle related records)
  DELETE FROM admins WHERE id = p_admin_id;
  
  -- Return true if deletion was successful
  RETURN FOUND;
END;
$$;

-- Function to update admin details
CREATE OR REPLACE FUNCTION update_admin_user(
  p_admin_id UUID,
  p_full_name TEXT DEFAULT NULL,
  p_role TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the admin
  UPDATE admins
  SET 
    full_name = COALESCE(p_full_name, full_name),
    role = COALESCE(p_role, role),
    updated_at = NOW()
  WHERE admins.id = p_admin_id;

  -- Return updated admin info
  RETURN QUERY
  SELECT 
    a.id,
    a.email,
    a.full_name,
    a.role
  FROM admins a
  WHERE a.id = p_admin_id;
END;
$$;

-- Function to reset admin password
CREATE OR REPLACE FUNCTION reset_admin_password(
  p_admin_id UUID,
  p_new_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_password_hash TEXT;
BEGIN
  -- Hash the new password
  v_password_hash := crypt(p_new_password, gen_salt('bf', 10));

  -- Update password
  UPDATE admins
  SET 
    password_hash = v_password_hash,
    updated_at = NOW()
  WHERE id = p_admin_id;

  RETURN FOUND;
END;
$$;

-- Add comments for documentation
COMMENT ON FUNCTION get_all_admins() IS 'Returns list of all admin users (excluding sensitive data)';
COMMENT ON FUNCTION create_admin_user(TEXT, TEXT, TEXT, TEXT) IS 'Creates a new admin user with hashed password';
COMMENT ON FUNCTION delete_admin_user(UUID) IS 'Deletes an admin user by ID';
COMMENT ON FUNCTION update_admin_user(UUID, TEXT, TEXT) IS 'Updates admin user details (name and role)';
COMMENT ON FUNCTION reset_admin_password(UUID, TEXT) IS 'Resets admin password with new hashed password';
