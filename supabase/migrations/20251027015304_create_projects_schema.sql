/*
  # Create Projects Schema

  ## Overview
  Creates comprehensive project management system with support for project details,
  documents, time tracking, deadlines, tasks, billing, and client notes.

  ## New Tables
  
  ### `projects`
  - `id` (uuid, primary key)
  - `name` (text) - Project name
  - `client_id` (uuid, foreign key) - Optional client assignment
  - `description` (text) - Brief project description
  - `photo_url` (text) - URL to project photo
  - `estimated_billing` (numeric) - Estimated project cost
  - `status` (text) - Project status (active, completed, on-hold)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `project_documents`
  - `id` (uuid, primary key)
  - `project_id` (uuid, foreign key)
  - `file_name` (text)
  - `file_url` (text)
  - `file_type` (text) - document, image, reference
  - `file_size` (integer)
  - `uploaded_at` (timestamptz)

  ### `project_deadlines`
  - `id` (uuid, primary key)
  - `project_id` (uuid, foreign key)
  - `title` (text)
  - `due_date` (date)
  - `is_completed` (boolean)
  - `notes` (text)
  - `created_at` (timestamptz)

  ### `project_tasks`
  - `id` (uuid, primary key)
  - `project_id` (uuid, foreign key)
  - `title` (text)
  - `description` (text)
  - `status` (text) - todo, in-progress, done
  - `order_index` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `project_notes`
  - `id` (uuid, primary key)
  - `project_id` (uuid, foreign key)
  - `content` (text)
  - `note_type` (text) - client, internal
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their projects
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  description text DEFAULT '',
  photo_url text,
  estimated_billing numeric(10, 2) DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on-hold')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (true);

-- Create project_documents table
CREATE TABLE IF NOT EXISTS project_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text DEFAULT 'document' CHECK (file_type IN ('document', 'image', 'reference')),
  file_size integer DEFAULT 0,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project documents"
  ON project_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create project documents"
  ON project_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete project documents"
  ON project_documents FOR DELETE
  TO authenticated
  USING (true);

-- Create project_deadlines table
CREATE TABLE IF NOT EXISTS project_deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  due_date date NOT NULL,
  is_completed boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_deadlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project deadlines"
  ON project_deadlines FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create project deadlines"
  ON project_deadlines FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update project deadlines"
  ON project_deadlines FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete project deadlines"
  ON project_deadlines FOR DELETE
  TO authenticated
  USING (true);

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project tasks"
  ON project_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create project tasks"
  ON project_tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update project tasks"
  ON project_tasks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete project tasks"
  ON project_tasks FOR DELETE
  TO authenticated
  USING (true);

-- Create project_notes table
CREATE TABLE IF NOT EXISTS project_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content text NOT NULL,
  note_type text DEFAULT 'internal' CHECK (note_type IN ('client', 'internal')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project notes"
  ON project_notes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create project notes"
  ON project_notes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update project notes"
  ON project_notes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete project notes"
  ON project_notes FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_deadlines_project_id ON project_deadlines(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id);