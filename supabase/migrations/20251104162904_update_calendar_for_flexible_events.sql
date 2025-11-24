/*
  # Update Calendar for Flexible Events

  1. Changes to Personal Events
    - Make personal_client_id optional (allow NULL) for events without categories
    - Add details field for event descriptions (addresses, notes, etc.)
    - Add start_time and end_time fields for specific time ranges
    - Make event_type more flexible (remove CHECK constraint)
  
  2. New Tables
    - `custom_event_types` - User-defined event type presets
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text) - Custom event type name
      - `color` (text) - Color for the event type
      - `is_work` (boolean) - Whether this is for work or personal calendar
      - `created_at` (timestamptz)
  
  3. Changes to Events Tables
    - Add details field to both events and personal_events
    - Add start_time and end_time to both tables
    - Remove restrictive CHECK constraint on event_type

  4. Security
    - Enable RLS on custom_event_types
    - Add policies for authenticated users to manage their own event types
*/

-- Make personal_client_id optional in personal_events
ALTER TABLE personal_events ALTER COLUMN personal_client_id DROP NOT NULL;

-- Add details field to events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'details'
  ) THEN
    ALTER TABLE events ADD COLUMN details text;
  END IF;
END $$;

-- Add details field to personal_events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'personal_events' AND column_name = 'details'
  ) THEN
    ALTER TABLE personal_events ADD COLUMN details text;
  END IF;
END $$;

-- Add start_time and end_time to events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE events ADD COLUMN start_time time;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE events ADD COLUMN end_time time;
  END IF;
END $$;

-- Add start_time and end_time to personal_events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'personal_events' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE personal_events ADD COLUMN start_time time;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'personal_events' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE personal_events ADD COLUMN end_time time;
  END IF;
END $$;

-- Drop the CHECK constraint on personal_events event_type to allow custom types
ALTER TABLE personal_events DROP CONSTRAINT IF EXISTS personal_events_event_type_check;

-- Create custom_event_types table
CREATE TABLE IF NOT EXISTS custom_event_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3B82F6',
  is_work boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS custom_event_types_user_id_idx ON custom_event_types(user_id);

-- Enable Row Level Security
ALTER TABLE custom_event_types ENABLE ROW LEVEL SECURITY;

-- Create policies for custom_event_types table
CREATE POLICY "Users can view own custom event types"
  ON custom_event_types FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own custom event types"
  ON custom_event_types FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom event types"
  ON custom_event_types FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom event types"
  ON custom_event_types FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
