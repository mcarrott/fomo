/*
  # Create Finances Schema

  ## Overview
  Creates tables for managing financial information including subscriptions and financial documents.
  Supports tracking recurring expenses and storing important tax documents.

  ## New Tables
  
  ### `subscriptions`
  - `id` (uuid, primary key) - Unique identifier for each subscription
  - `name` (text) - Service name (e.g., Netflix, Adobe Creative Cloud)
  - `purpose` (text) - What the service is used for
  - `login_email` (text) - Login email/username
  - `login_password` (text) - Password (stored as plain text for user convenience)
  - `cost` (numeric) - Monthly/recurring cost
  - `billing_cycle` (text) - Billing frequency (monthly, yearly, etc.)
  - `is_active` (boolean) - Whether currently subscribed/paying
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `financial_documents`
  - `id` (uuid, primary key) - Unique identifier for each document
  - `name` (text) - Document name/title
  - `document_type` (text) - Type of document (w2, receipt, tax_form, other)
  - `year` (integer) - Tax year or document year
  - `amount` (numeric) - Dollar amount if applicable
  - `file_url` (text) - URL to the stored file
  - `file_name` (text) - Original filename
  - `file_size` (bigint) - File size in bytes
  - `file_type` (text) - MIME type
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Upload timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on both tables
  - Public access policies for read/write operations
  
  ## Notes
  1. Passwords stored in plain text for user convenience (this is a personal tool)
  2. Financial documents separate from general documents
  3. Year field helps organize tax documents
  4. Cost and amount fields use numeric for precision
*/

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  purpose text,
  login_email text,
  login_password text,
  cost numeric(10, 2),
  billing_cycle text DEFAULT 'monthly',
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create financial_documents table
CREATE TABLE IF NOT EXISTS financial_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  document_type text NOT NULL DEFAULT 'other',
  year integer,
  amount numeric(10, 2),
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS subscriptions_is_active_idx ON subscriptions(is_active);
CREATE INDEX IF NOT EXISTS subscriptions_name_idx ON subscriptions(name);
CREATE INDEX IF NOT EXISTS financial_documents_type_idx ON financial_documents(document_type);
CREATE INDEX IF NOT EXISTS financial_documents_year_idx ON financial_documents(year DESC);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions table
CREATE POLICY "Allow public read access to subscriptions"
  ON subscriptions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to subscriptions"
  ON subscriptions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to subscriptions"
  ON subscriptions FOR DELETE
  USING (true);

-- Create policies for financial_documents table
CREATE POLICY "Allow public read access to financial_documents"
  ON financial_documents FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to financial_documents"
  ON financial_documents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to financial_documents"
  ON financial_documents FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to financial_documents"
  ON financial_documents FOR DELETE
  USING (true);