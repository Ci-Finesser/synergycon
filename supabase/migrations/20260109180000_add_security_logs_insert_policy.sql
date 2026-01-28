-- This migration adds a Row Level Security (RLS) policy to the 'security_logs' table.
-- This policy allows the service_role to insert new logs, which is required for the
-- application's security logger to function correctly from backend API routes.

CREATE POLICY "Allow service_role to insert security logs"
ON public.security_logs
FOR INSERT
TO service_role
WITH CHECK (true);
