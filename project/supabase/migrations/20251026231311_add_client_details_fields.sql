/*
  # Add Client Details Fields

  ## Overview
  Extends the clients table with additional contact and business information.
  Allows comprehensive client management with contact details and billing rates.

  ## Changes to `clients` Table
  
  ### New Columns Added
  - `contact_person` (text) - Name of primary contact person at the client
  - `email` (text) - Client email address
  - `phone` (text) - Client phone number
  - `hourly_rate` (numeric) - Billing rate per hour for this client
  - `updated_at` (timestamptz) - Last update timestamp

  ## Notes
  1. All new fields are optional (nullable)
  2. Only the name field remains mandatory
  3. Hourly rate stored as numeric for precision
  4. Email format not validated at database level
*/

-- Add new columns to clients table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'contact_person'
  ) THEN
    ALTER TABLE clients ADD COLUMN contact_person text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'email'
  ) THEN
    ALTER TABLE clients ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'phone'
  ) THEN
    ALTER TABLE clients ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'hourly_rate'
  ) THEN
    ALTER TABLE clients ADD COLUMN hourly_rate numeric(10, 2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE clients ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;