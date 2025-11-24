/*
  # Add event duration and default hours setting

  1. Changes to events table
    - Add `duration_hours` column (decimal) to track event duration in hours
    - Defaults to 8 hours for new events
  
  2. Changes to user_settings table
    - Add `default_event_hours` column (decimal) to set user's preferred default duration
    - Defaults to 8 hours
  
  3. Purpose
    - Allow users to track hours per event
    - Display hours on calendar events
    - Include hours in statistics
    - Users can customize default hours in settings
*/

-- Add duration_hours to events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'duration_hours'
  ) THEN
    ALTER TABLE events ADD COLUMN duration_hours decimal(5,2) DEFAULT 8.00;
  END IF;
END $$;

-- Add default_event_hours to user_settings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'default_event_hours'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN default_event_hours decimal(5,2) DEFAULT 8.00;
  END IF;
END $$;

-- Create index for faster statistics queries
CREATE INDEX IF NOT EXISTS events_duration_idx ON events(duration_hours) WHERE duration_hours IS NOT NULL;
