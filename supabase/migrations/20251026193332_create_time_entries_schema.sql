/*
  # Create Time Entries Schema for Time Tracking

  ## Overview
  Creates a time tracking system with stopwatch functionality.
  Time entries are linked to clients for color coding and grouping.

  ## New Tables
  
  ### `time_entries`
  - `id` (uuid, primary key) - Unique identifier for each time entry
  - `client_id` (uuid, foreign key) - References clients table (nullable)
  - `task_name` (text) - Description of the task/work performed
  - `start_time` (timestamptz) - When the timer started
  - `end_time` (timestamptz) - When the timer stopped (nullable for active timers)
  - `duration_minutes` (integer) - Total duration in minutes
  - `is_running` (boolean) - Whether this timer is currently active
  - `date` (date) - Date of the time entry (for grouping/filtering)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on time_entries table
  - Public access policies for read/write operations
  
  ## Notes
  1. Only one timer can be running at a time per user
  2. Duration is stored in minutes for simplicity
  3. Date field enables easy grouping by day
  4. Client association enables color coding and filtering
*/

-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  task_name text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration_minutes integer DEFAULT 0,
  is_running boolean DEFAULT false,
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS time_entries_client_id_idx ON time_entries(client_id);
CREATE INDEX IF NOT EXISTS time_entries_date_idx ON time_entries(date);
CREATE INDEX IF NOT EXISTS time_entries_is_running_idx ON time_entries(is_running);

-- Enable Row Level Security
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for time_entries table
CREATE POLICY "Allow public read access to time_entries"
  ON time_entries FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to time_entries"
  ON time_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to time_entries"
  ON time_entries FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to time_entries"
  ON time_entries FOR DELETE
  USING (true);