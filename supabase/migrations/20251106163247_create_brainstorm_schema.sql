/*
  # Brainstorm & Mind Mapping Schema

  1. New Tables
    - `brainstorm_cards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `client_id` (uuid, foreign key to clients, nullable)
      - `name` (text) - Card/project name
      - `color` (text) - Color code for the card
      - `description` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `idea_nodes`
      - `id` (uuid, primary key)
      - `card_id` (uuid, foreign key to brainstorm_cards)
      - `user_id` (uuid, foreign key to auth.users)
      - `content` (text) - The idea text
      - `position_x` (float) - X coordinate on canvas
      - `position_y` (float) - Y coordinate on canvas
      - `color` (text) - Bubble color
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `node_connections`
      - `id` (uuid, primary key)
      - `card_id` (uuid, foreign key to brainstorm_cards)
      - `user_id` (uuid, foreign key to auth.users)
      - `from_node_id` (uuid, foreign key to idea_nodes)
      - `to_node_id` (uuid, foreign key to idea_nodes)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own brainstorm data
    - Policies for authenticated users to manage their own cards, nodes, and connections
*/

-- Create brainstorm_cards table
CREATE TABLE IF NOT EXISTS brainstorm_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  name text NOT NULL,
  color text DEFAULT '#3B82F6',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE brainstorm_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brainstorm cards"
  ON brainstorm_cards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own brainstorm cards"
  ON brainstorm_cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brainstorm cards"
  ON brainstorm_cards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own brainstorm cards"
  ON brainstorm_cards FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create idea_nodes table
CREATE TABLE IF NOT EXISTS idea_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES brainstorm_cards(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  position_x float NOT NULL DEFAULT 0,
  position_y float NOT NULL DEFAULT 0,
  color text DEFAULT '#60A5FA',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE idea_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own idea nodes"
  ON idea_nodes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own idea nodes"
  ON idea_nodes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own idea nodes"
  ON idea_nodes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own idea nodes"
  ON idea_nodes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create node_connections table
CREATE TABLE IF NOT EXISTS node_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES brainstorm_cards(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_node_id uuid REFERENCES idea_nodes(id) ON DELETE CASCADE NOT NULL,
  to_node_id uuid REFERENCES idea_nodes(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE node_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own node connections"
  ON node_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own node connections"
  ON node_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own node connections"
  ON node_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brainstorm_cards_user_id ON brainstorm_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_idea_nodes_card_id ON idea_nodes(card_id);
CREATE INDEX IF NOT EXISTS idx_idea_nodes_user_id ON idea_nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_node_connections_card_id ON node_connections(card_id);
CREATE INDEX IF NOT EXISTS idx_node_connections_from_node ON node_connections(from_node_id);
CREATE INDEX IF NOT EXISTS idx_node_connections_to_node ON node_connections(to_node_id);