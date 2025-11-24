/*
  # Create Home Dashboard Schema

  ## Overview
  Creates tables for managing the home dashboard including user settings,
  reminders, and post-it notes for quick notes.

  ## New Tables
  
  ### `user_settings`
  - `id` (uuid, primary key) - Unique identifier
  - `user_name` (text) - What the user wants to be called
  - `welcome_message` (text) - Custom welcome message
  - `news_category` (text) - Type of news to show (tech, business, general, etc.)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `reminders`
  - `id` (uuid, primary key) - Unique identifier for each reminder
  - `title` (text) - Reminder title/description
  - `date` (date) - Date of the event/reminder
  - `notes` (text) - Additional notes
  - `is_completed` (boolean) - Whether the reminder is completed
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `post_it_notes`
  - `id` (uuid, primary key) - Unique identifier for each note
  - `content` (text) - Note content
  - `color` (text) - Pastel color of the note
  - `position` (integer) - Order position (1, 2, or 3)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Public access policies for read/write operations
  
  ## Notes
  1. Single row in user_settings for personal use
  2. Reminders can be marked complete without deletion
  3. Post-it notes are limited to 3 with fixed positions
  4. News category determines feed content
*/

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text DEFAULT 'there',
  welcome_message text DEFAULT 'Welcome back!',
  news_category text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL,
  notes text,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create post_it_notes table
CREATE TABLE IF NOT EXISTS post_it_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text DEFAULT '',
  color text NOT NULL,
  position integer NOT NULL CHECK (position >= 1 AND position <= 3),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (position)
);

-- Insert default user settings
INSERT INTO user_settings (user_name, welcome_message, news_category)
VALUES ('there', 'Welcome back!', 'general')
ON CONFLICT DO NOTHING;

-- Insert default post-it notes
INSERT INTO post_it_notes (content, color, position)
VALUES 
  ('', '#FFE5E5', 1),
  ('', '#E5F3FF', 2),
  ('', '#FFFDE5', 3)
ON CONFLICT (position) DO NOTHING;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS reminders_date_idx ON reminders(date);
CREATE INDEX IF NOT EXISTS reminders_completed_idx ON reminders(is_completed);
CREATE INDEX IF NOT EXISTS post_it_notes_position_idx ON post_it_notes(position);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_it_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for user_settings table
CREATE POLICY "Allow public read access to user_settings"
  ON user_settings FOR SELECT
  USING (true);

CREATE POLICY "Allow public update access to user_settings"
  ON user_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create policies for reminders table
CREATE POLICY "Allow public read access to reminders"
  ON reminders FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to reminders"
  ON reminders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to reminders"
  ON reminders FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to reminders"
  ON reminders FOR DELETE
  USING (true);

-- Create policies for post_it_notes table
CREATE POLICY "Allow public read access to post_it_notes"
  ON post_it_notes FOR SELECT
  USING (true);

CREATE POLICY "Allow public update access to post_it_notes"
  ON post_it_notes FOR UPDATE
  USING (true)
  WITH CHECK (true);