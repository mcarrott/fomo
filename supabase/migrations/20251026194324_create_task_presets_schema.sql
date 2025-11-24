/*
  # Create Task Presets Schema

  ## Overview
  Creates a system for saving frequently used task names as presets.
  Users can quickly select from saved presets when starting a timer.

  ## New Tables
  
  ### `task_presets`
  - `id` (uuid, primary key) - Unique identifier for each preset
  - `name` (text) - Task name/description
  - `client_id` (uuid, foreign key) - Default client for this task (nullable)
  - `usage_count` (integer) - Number of times this preset has been used
  - `last_used` (timestamptz) - Last time this preset was used
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on task_presets table
  - Public access policies for read/write operations
  
  ## Notes
  1. Presets can have a default client assigned
  2. Usage count helps sort by popularity
  3. Last used timestamp enables sorting by recency
*/

-- Create task_presets table
CREATE TABLE IF NOT EXISTS task_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  usage_count integer DEFAULT 0,
  last_used timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS task_presets_client_id_idx ON task_presets(client_id);
CREATE INDEX IF NOT EXISTS task_presets_usage_count_idx ON task_presets(usage_count DESC);
CREATE INDEX IF NOT EXISTS task_presets_last_used_idx ON task_presets(last_used DESC);

-- Enable Row Level Security
ALTER TABLE task_presets ENABLE ROW LEVEL SECURITY;

-- Create policies for task_presets table
CREATE POLICY "Allow public read access to task_presets"
  ON task_presets FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to task_presets"
  ON task_presets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to task_presets"
  ON task_presets FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to task_presets"
  ON task_presets FOR DELETE
  USING (true);