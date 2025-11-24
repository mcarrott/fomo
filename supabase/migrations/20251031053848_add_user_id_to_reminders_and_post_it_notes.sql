/*
  # Add user_id to reminders and post_it_notes tables

  ## Overview
  Adds user_id columns and updates RLS policies for reminders and post_it_notes tables
  to ensure proper user data isolation on the home dashboard.

  ## Changes
  
  ### Tables Modified
  - `reminders` - Add user_id column and index
  - `post_it_notes` - Add user_id column and index

  ## Security Changes
  - Drop any existing public access policies
  - Add user-specific policies that check auth.uid() = user_id
  - Users can only access their own reminders and notes
*/

-- Add user_id column to reminders table
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS reminders_user_id_idx ON reminders(user_id);

-- Add user_id column to post_it_notes table
ALTER TABLE post_it_notes ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS post_it_notes_user_id_idx ON post_it_notes(user_id);

-- Drop existing policies for reminders
DROP POLICY IF EXISTS "Allow public read access to reminders" ON reminders;
DROP POLICY IF EXISTS "Allow public insert access to reminders" ON reminders;
DROP POLICY IF EXISTS "Allow public update access to reminders" ON reminders;
DROP POLICY IF EXISTS "Allow public delete access to reminders" ON reminders;

-- Create user-specific policies for reminders table
CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reminders"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Drop existing policies for post_it_notes
DROP POLICY IF EXISTS "Allow public read access to post_it_notes" ON post_it_notes;
DROP POLICY IF EXISTS "Allow public insert access to post_it_notes" ON post_it_notes;
DROP POLICY IF EXISTS "Allow public update access to post_it_notes" ON post_it_notes;
DROP POLICY IF EXISTS "Allow public delete access to post_it_notes" ON post_it_notes;

-- Create user-specific policies for post_it_notes table
CREATE POLICY "Users can view own post_it_notes"
  ON post_it_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own post_it_notes"
  ON post_it_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own post_it_notes"
  ON post_it_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own post_it_notes"
  ON post_it_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);