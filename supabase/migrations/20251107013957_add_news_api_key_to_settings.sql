/*
  # Add NewsAPI Key to User Settings

  1. Modified Tables
    - `user_settings`
      - Add `news_api_key` (text) - User's NewsAPI key for fetching news articles

  2. Notes
    - Users can get a free API key from https://newsapi.org/register
    - Key is stored encrypted at rest by Supabase
    - Optional field - defaults to null
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'news_api_key'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN news_api_key text DEFAULT NULL;
  END IF;
END $$;
