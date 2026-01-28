-- Add event_day and topic columns to speakers table
ALTER TABLE speakers ADD COLUMN IF NOT EXISTS event_day INTEGER;
ALTER TABLE speakers ADD COLUMN IF NOT EXISTS topic TEXT;

-- Add index for event_day for better query performance
CREATE INDEX IF NOT EXISTS idx_speakers_event_day ON speakers(event_day);
