/*
  # Add user_id to user_settings table

  ## Overview
  Adds user_id column and updates RLS policies for user_settings table
  to ensure proper user data isolation. Each user gets their own settings.

  ## Changes
  
  ### Tables Modified
  - `user_settings` - Add user_id column, theme column, and index

  ## Security Changes
  - Drop existing public access policies
  - Add user-specific policies that check auth.uid() = user_id
  - Users can only access their own settings
  
  ## Notes
  1. Each authenticated user will have their own settings row
  2. Users cannot see or modify other users' settings
  3. Settings are automatically created when a user first accesses them
*/

-- Add user_id column to user_settings table
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS user_settings_user_id_idx ON user_settings(user_id);

-- Add theme column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'theme'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN theme text DEFAULT 'light';
  END IF;
END $$;

-- Drop existing policies for user_settings
DROP POLICY IF EXISTS "Allow public read access to user_settings" ON user_settings;
DROP POLICY IF EXISTS "Allow public insert access to user_settings" ON user_settings;
DROP POLICY IF EXISTS "Allow public update access to user_settings" ON user_settings;
DROP POLICY IF EXISTS "Allow public delete access to user_settings" ON user_settings;

-- Create user-specific policies for user_settings table
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON user_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);