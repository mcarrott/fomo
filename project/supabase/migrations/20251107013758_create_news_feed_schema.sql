/*
  # Create News Feed Schema

  1. New Tables
    - `news_feed_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `keywords` (text array) - User's custom filter keywords
      - `enabled` (boolean) - Whether news feed is enabled
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `cached_articles`
      - `id` (uuid, primary key)
      - `title` (text) - Article title
      - `description` (text) - Article description
      - `url` (text) - Article URL
      - `image_url` (text) - Article image
      - `source` (text) - News source name
      - `published_at` (timestamptz) - When article was published
      - `keywords` (text array) - Keywords this article matches
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Users can only read/write their own preferences
    - All authenticated users can read cached articles
    - Only service role can write cached articles
*/

CREATE TABLE IF NOT EXISTS news_feed_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  keywords text[] DEFAULT ARRAY['technology', 'animation']::text[] NOT NULL,
  enabled boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS cached_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  url text NOT NULL UNIQUE,
  image_url text,
  source text NOT NULL,
  published_at timestamptz NOT NULL,
  keywords text[] NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE news_feed_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON news_feed_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON news_feed_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON news_feed_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON news_feed_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view cached articles"
  ON cached_articles FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_cached_articles_published_at ON cached_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_cached_articles_keywords ON cached_articles USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_news_feed_preferences_user_id ON news_feed_preferences(user_id);
