/*
  # Create Notepad Schema

  ## Overview
  Creates a notepad system where users can create pages with rich text content.
  Pages can be assigned to clients and automatically grouped into folders when multiple pages share the same client.

  ## New Tables
  
  ### `notepad_pages`
  Stores notepad pages with their content and metadata
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, references auth.users) - Page owner
  - `client_id` (uuid, references clients, nullable) - Associated client for grouping
  - `title` (text) - Page title
  - `content` (text) - Page content (rich text/markdown)
  - `color` (text) - Visual color for the page card
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last modification timestamp

  ## Security
  - Enable RLS on `notepad_pages` table
  - Users can only view their own pages
  - Users can only create pages for themselves
  - Users can only update their own pages
  - Users can only delete their own pages

  ## Notes
  - Pages without a client_id are treated as standalone pages
  - Pages with the same client_id are automatically grouped together in the UI
  - Content field supports plain text (can be extended for markdown/rich text)
*/

-- Create notepad_pages table
CREATE TABLE IF NOT EXISTS notepad_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT 'Untitled Page',
  content text DEFAULT '',
  color text NOT NULL DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notepad_pages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own notepad pages"
  ON notepad_pages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notepad pages"
  ON notepad_pages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notepad pages"
  ON notepad_pages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notepad pages"
  ON notepad_pages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notepad_pages_user_id ON notepad_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_notepad_pages_client_id ON notepad_pages(client_id);
CREATE INDEX IF NOT EXISTS idx_notepad_pages_updated_at ON notepad_pages(updated_at DESC);