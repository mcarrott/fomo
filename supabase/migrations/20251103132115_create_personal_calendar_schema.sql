/*
  # Create Personal Calendar Schema

  1. New Tables
    - `personal_clients`
      - `id` (uuid, primary key) - Unique identifier for each personal client/category
      - `user_id` (uuid, foreign key) - References auth.users table
      - `name` (text) - Personal category name (e.g., "Family", "Health", "Hobbies")
      - `color` (text) - Hex color code for visual distinction
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `personal_events`
      - `id` (uuid, primary key) - Unique identifier for each personal event
      - `user_id` (uuid, foreign key) - References auth.users table
      - `personal_client_id` (uuid, foreign key) - References personal_clients table
      - `title` (text) - Event title/description
      - `start_date` (date) - Event start date
      - `end_date` (date) - Event end date
      - `event_type` (text) - Type: 'hold', 'book', or 'paid' (keeping same types for consistency)
      - `duration_hours` (decimal) - Hours per day for this event
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on all tables
    - User-specific policies ensuring users can only access their own data
    - SELECT, INSERT, UPDATE, DELETE policies restricted by user_id

  3. Purpose
    - Separate personal calendar from work calendar
    - Same functionality as work calendar but for personal use
    - User can toggle between work and personal views
*/

-- Create personal_clients table
CREATE TABLE IF NOT EXISTS personal_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Create personal_events table
CREATE TABLE IF NOT EXISTS personal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  personal_client_id uuid NOT NULL REFERENCES personal_clients(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  start_date date NOT NULL,
  end_date date NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('hold', 'book', 'paid')),
  duration_hours decimal(5,2) DEFAULT 8.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS personal_clients_user_id_idx ON personal_clients(user_id);
CREATE INDEX IF NOT EXISTS personal_events_user_id_idx ON personal_events(user_id);
CREATE INDEX IF NOT EXISTS personal_events_date_range_idx ON personal_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS personal_events_personal_client_id_idx ON personal_events(personal_client_id);

-- Enable Row Level Security
ALTER TABLE personal_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_events ENABLE ROW LEVEL SECURITY;

-- Create policies for personal_clients table
CREATE POLICY "Users can view own personal clients"
  ON personal_clients FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own personal clients"
  ON personal_clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal clients"
  ON personal_clients FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own personal clients"
  ON personal_clients FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for personal_events table
CREATE POLICY "Users can view own personal events"
  ON personal_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own personal events"
  ON personal_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal events"
  ON personal_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own personal events"
  ON personal_events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default personal categories for demonstration
-- Note: These will only be visible to the user who creates them
-- Users should create their own categories through the app
