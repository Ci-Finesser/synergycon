-- Update registrations table to capture all comprehensive registration data

-- Add missing columns to registrations table
ALTER TABLE public.registrations 
  ADD COLUMN IF NOT EXISTS order_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS how_did_you_hear TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS attendance_reason TEXT,
  ADD COLUMN IF NOT EXISTS expectations TEXT,
  ADD COLUMN IF NOT EXISTS dietary_requirements TEXT,
  ADD COLUMN IF NOT EXISTS tickets JSONB,
  ADD COLUMN IF NOT EXISTS total_amount INTEGER DEFAULT 0;

-- Create index on order_id for faster lookups
CREATE INDEX IF NOT EXISTS registrations_order_id_idx ON public.registrations(order_id);

-- Update admin policy to allow full management
DROP POLICY IF EXISTS "Allow admin users to manage registrations" ON public.registrations;

CREATE POLICY "Allow admin users to manage registrations"
ON public.registrations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);

SELECT 'Registrations table updated successfully' as status;
