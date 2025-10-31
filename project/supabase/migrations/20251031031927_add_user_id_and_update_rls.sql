/*
  # Add User Authentication and User-Specific Data

  ## Overview
  Adds user_id columns to all tables and updates RLS policies to ensure data isolation per user.
  This migration secures the application by ensuring users can only access their own data.

  ## Changes
  
  ### Tables Modified
  - `clients` - Add user_id column
  - `events` - Add user_id column
  - `tasks` - Add user_id column
  - `time_entries` - Add user_id column
  - `task_presets` - Add user_id column
  - `documents` - Add user_id column
  - `invoices` - Add user_id column
  - `expenses` - Add user_id column
  - `subscriptions` - Add user_id column
  - `home_widgets` - Add user_id column
  - `projects` - Add user_id column

  ## Security Changes
  - Remove all public access policies (USING true)
  - Add user-specific policies that check auth.uid() = user_id
  - Users can only access their own data

  ## Important Notes
  1. All existing data will be deleted to ensure clean migration
  2. Sample data will be recreated with proper user_id references
  3. All new records must have a user_id
  4. Authentication is now required for all operations
*/

-- Add user_id column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON clients(user_id);

-- Add user_id column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS events_user_id_idx ON events(user_id);

-- Add user_id column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);

-- Add user_id column to time_entries table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'time_entries') THEN
    ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS time_entries_user_id_idx ON time_entries(user_id);
  END IF;
END $$;

-- Add user_id column to task_presets table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'task_presets') THEN
    ALTER TABLE task_presets ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS task_presets_user_id_idx ON task_presets(user_id);
  END IF;
END $$;

-- Add user_id column to documents table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
    ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents(user_id);
  END IF;
END $$;

-- Add user_id column to invoices table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN
    ALTER TABLE invoices ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON invoices(user_id);
  END IF;
END $$;

-- Add user_id column to expenses table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expenses') THEN
    ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
  END IF;
END $$;

-- Add user_id column to subscriptions table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
    ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
  END IF;
END $$;

-- Add user_id column to home_widgets table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'home_widgets') THEN
    ALTER TABLE home_widgets ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS home_widgets_user_id_idx ON home_widgets(user_id);
  END IF;
END $$;

-- Add user_id column to projects table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
  END IF;
END $$;

-- Drop all existing public access policies
DROP POLICY IF EXISTS "Allow public read access to clients" ON clients;
DROP POLICY IF EXISTS "Allow public insert access to clients" ON clients;
DROP POLICY IF EXISTS "Allow public update access to clients" ON clients;
DROP POLICY IF EXISTS "Allow public delete access to clients" ON clients;

DROP POLICY IF EXISTS "Allow public read access to events" ON events;
DROP POLICY IF EXISTS "Allow public insert access to events" ON events;
DROP POLICY IF EXISTS "Allow public update access to events" ON events;
DROP POLICY IF EXISTS "Allow public delete access to events" ON events;

DROP POLICY IF EXISTS "Allow public read access to tasks" ON tasks;
DROP POLICY IF EXISTS "Allow public insert access to tasks" ON tasks;
DROP POLICY IF EXISTS "Allow public update access to tasks" ON tasks;
DROP POLICY IF EXISTS "Allow public delete access to tasks" ON tasks;

-- Create user-specific policies for clients table
CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create user-specific policies for events table
CREATE POLICY "Users can view own events"
  ON events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create user-specific policies for tasks table
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create user-specific policies for time_entries table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'time_entries') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to time_entries" ON time_entries';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public insert access to time_entries" ON time_entries';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public update access to time_entries" ON time_entries';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public delete access to time_entries" ON time_entries';
    
    EXECUTE 'CREATE POLICY "Users can view own time_entries" ON time_entries FOR SELECT TO authenticated USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can create own time_entries" ON time_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can update own time_entries" ON time_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can delete own time_entries" ON time_entries FOR DELETE TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Create user-specific policies for task_presets table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'task_presets') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to task_presets" ON task_presets';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public insert access to task_presets" ON task_presets';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public update access to task_presets" ON task_presets';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public delete access to task_presets" ON task_presets';
    
    EXECUTE 'CREATE POLICY "Users can view own task_presets" ON task_presets FOR SELECT TO authenticated USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can create own task_presets" ON task_presets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can update own task_presets" ON task_presets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can delete own task_presets" ON task_presets FOR DELETE TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Create user-specific policies for documents table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to documents" ON documents';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public insert access to documents" ON documents';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public update access to documents" ON documents';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public delete access to documents" ON documents';
    
    EXECUTE 'CREATE POLICY "Users can view own documents" ON documents FOR SELECT TO authenticated USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can create own documents" ON documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can update own documents" ON documents FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can delete own documents" ON documents FOR DELETE TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Create user-specific policies for invoices table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to invoices" ON invoices';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public insert access to invoices" ON invoices';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public update access to invoices" ON invoices';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public delete access to invoices" ON invoices';
    
    EXECUTE 'CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT TO authenticated USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can create own invoices" ON invoices FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can update own invoices" ON invoices FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can delete own invoices" ON invoices FOR DELETE TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Create user-specific policies for expenses table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expenses') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to expenses" ON expenses';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public insert access to expenses" ON expenses';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public update access to expenses" ON expenses';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public delete access to expenses" ON expenses';
    
    EXECUTE 'CREATE POLICY "Users can view own expenses" ON expenses FOR SELECT TO authenticated USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can create own expenses" ON expenses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can update own expenses" ON expenses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can delete own expenses" ON expenses FOR DELETE TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Create user-specific policies for subscriptions table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to subscriptions" ON subscriptions';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public insert access to subscriptions" ON subscriptions';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public update access to subscriptions" ON subscriptions';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public delete access to subscriptions" ON subscriptions';
    
    EXECUTE 'CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can create own subscriptions" ON subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can delete own subscriptions" ON subscriptions FOR DELETE TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Create user-specific policies for home_widgets table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'home_widgets') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to home_widgets" ON home_widgets';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public insert access to home_widgets" ON home_widgets';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public update access to home_widgets" ON home_widgets';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public delete access to home_widgets" ON home_widgets';
    
    EXECUTE 'CREATE POLICY "Users can view own home_widgets" ON home_widgets FOR SELECT TO authenticated USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can create own home_widgets" ON home_widgets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can update own home_widgets" ON home_widgets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can delete own home_widgets" ON home_widgets FOR DELETE TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Create user-specific policies for projects table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to projects" ON projects';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public insert access to projects" ON projects';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public update access to projects" ON projects';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public delete access to projects" ON projects';
    
    EXECUTE 'CREATE POLICY "Users can view own projects" ON projects FOR SELECT TO authenticated USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can create own projects" ON projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can update own projects" ON projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can delete own projects" ON projects FOR DELETE TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;