/*
  # Create Documents Schema

  ## Overview
  Creates a document management system for storing templates and files.
  Supports various document types like invoices, proposals, storyboards, and resumes.

  ## New Tables
  
  ### `documents`
  - `id` (uuid, primary key) - Unique identifier for each document
  - `name` (text) - Document name/title
  - `description` (text) - Optional description of the document
  - `file_url` (text) - URL to the stored file
  - `file_name` (text) - Original filename
  - `file_size` (bigint) - File size in bytes
  - `file_type` (text) - MIME type of the file
  - `category` (text) - Document category (invoice, proposal, storyboard, resume, other)
  - `created_at` (timestamptz) - Upload timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on documents table
  - Public access policies for read/write operations
  
  ## Notes
  1. Files will be stored in Supabase Storage
  2. Category field allows organizing documents by type
  3. File metadata stored for display and management
*/

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS documents_category_idx ON documents(category);
CREATE INDEX IF NOT EXISTS documents_created_at_idx ON documents(created_at DESC);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies for documents table
CREATE POLICY "Allow public read access to documents"
  ON documents FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to documents"
  ON documents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to documents"
  ON documents FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to documents"
  ON documents FOR DELETE
  USING (true);