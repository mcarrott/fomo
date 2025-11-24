/*
  # Calendar App Database Schema

  ## Overview
  Creates a complete database schema for a calendar application with clients and events.
  Supports color-coded clients and different event types (Hold, Book, Paid) with 
  visual distinctions based on type.

  ## New Tables
  
  ### `clients`
  - `id` (uuid, primary key) - Unique identifier for each client
  - `name` (text) - Client name
  - `color` (text) - Hex color code for client (e.g., #FF0000 for red)
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### `events`
  - `id` (uuid, primary key) - Unique identifier for each event
  - `client_id` (uuid, foreign key) - References clients table
  - `title` (text) - Event title/description
  - `start_date` (date) - Event start date
  - `end_date` (date) - Event end date
  - `event_type` (text) - Type: 'hold', 'book', or 'paid'
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Public access policies for read/write operations (can be restricted later based on auth requirements)
  
  ## Notes
  1. Event types determine color intensity:
     - 'book' = vibrant (full opacity)
     - 'hold' = pastel (medium opacity)
     - 'paid' = faded (low opacity/darker shade)
  2. Color coding is managed at the client level
  3. Events can span multiple days via start_date and end_date
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  start_date date NOT NULL,
  end_date date NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('hold', 'book', 'paid')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS events_date_range_idx ON events(start_date, end_date);
CREATE INDEX IF NOT EXISTS events_client_id_idx ON events(client_id);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies for clients table
CREATE POLICY "Allow public read access to clients"
  ON clients FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to clients"
  ON clients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to clients"
  ON clients FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to clients"
  ON clients FOR DELETE
  USING (true);

-- Create policies for events table
CREATE POLICY "Allow public read access to events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to events"
  ON events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to events"
  ON events FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to events"
  ON events FOR DELETE
  USING (true);

-- Insert sample clients with diverse color palette
INSERT INTO clients (name, color) VALUES
  ('The Studio', '#EF4444'),
  ('Launch', '#10B981'),
  ('Zyro', '#3B82F6')
ON CONFLICT DO NOTHING;