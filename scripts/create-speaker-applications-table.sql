-- Create speaker_applications table
CREATE TABLE IF NOT EXISTS public.speaker_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  linkedin TEXT,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  bio TEXT NOT NULL,
  session_type TEXT NOT NULL,
  topic_title TEXT NOT NULL,
  topic_description TEXT NOT NULL,
  speaking_experience TEXT,
  availability TEXT,
  additional_notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.speaker_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit speaker applications
CREATE POLICY "Anyone can submit speaker applications"
  ON public.speaker_applications
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users to view all applications
CREATE POLICY "Authenticated users can view all applications"
  ON public.speaker_applications
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update applications
CREATE POLICY "Authenticated users can update applications"
  ON public.speaker_applications
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_speaker_applications_status ON public.speaker_applications(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_speaker_applications_created_at ON public.speaker_applications(created_at DESC);
