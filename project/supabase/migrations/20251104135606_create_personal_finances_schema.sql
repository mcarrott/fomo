/*
  # Create Personal Finances Schema

  1. New Tables
    - `personal_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `purpose` (text, nullable)
      - `login_email` (text, nullable)
      - `login_password` (text, nullable)
      - `cost` (numeric, nullable)
      - `billing_cycle` (text, default 'monthly')
      - `is_active` (boolean, default true)
      - `notes` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `personal_financial_documents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `document_type` (text)
      - `year` (integer, nullable)
      - `amount` (numeric, nullable)
      - `file_url` (text)
      - `file_name` (text)
      - `file_size` (bigint)
      - `file_type` (text)
      - `notes` (text, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own personal financial data
*/

CREATE TABLE IF NOT EXISTS personal_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

CREATE TABLE IF NOT EXISTS personal_financial_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  document_type text NOT NULL,
  year integer,
  amount numeric(10, 2),
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE personal_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_financial_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own personal subscriptions"
  ON personal_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personal subscriptions"
  ON personal_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal subscriptions"
  ON personal_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own personal subscriptions"
  ON personal_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own personal financial documents"
  ON personal_financial_documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personal financial documents"
  ON personal_financial_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal financial documents"
  ON personal_financial_documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own personal financial documents"
  ON personal_financial_documents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
