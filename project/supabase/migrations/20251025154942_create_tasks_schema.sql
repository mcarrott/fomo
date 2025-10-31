/*
  # Create Tasks Schema for Kanban Board

  ## Overview
  Creates a task management system with Kanban-style columns and drag-and-drop functionality.
  Tasks are linked to clients for color coding and include priority levels and due dates.

  ## New Tables
  
  ### `tasks`
  - `id` (uuid, primary key) - Unique identifier for each task
  - `client_id` (uuid, foreign key) - References clients table (nullable for unassigned tasks)
  - `title` (text) - Task title/description
  - `description` (text) - Detailed task description (optional)
  - `status` (text) - Column status: 'todo', 'in_progress', 'done'
  - `priority` (text) - Priority level: 'low', 'med', 'high'
  - `due_date` (date) - Task due date (defaults to today)
  - `position` (integer) - Sort position within column
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on tasks table
  - Public access policies for read/write operations
  
  ## Notes
  1. Tasks are organized in three columns: To Do, In Progress, Done
  2. Priority affects visual styling (low, med, high)
  3. Default due date is today if not specified
  4. Position field enables custom ordering within columns
  5. Client association enables color coding
*/

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority text NOT NULL DEFAULT 'med' CHECK (priority IN ('low', 'med', 'high')),
  due_date date DEFAULT CURRENT_DATE,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_client_id_idx ON tasks(client_id);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON tasks(due_date);
CREATE INDEX IF NOT EXISTS tasks_position_idx ON tasks(position);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks table
CREATE POLICY "Allow public read access to tasks"
  ON tasks FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to tasks"
  ON tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to tasks"
  ON tasks FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to tasks"
  ON tasks FOR DELETE
  USING (true);