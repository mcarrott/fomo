/*
  # Add Font Preference to User Settings

  ## Overview
  Adds a font preference field to user_settings table to allow users
  to customize the font family used throughout the application.

  ## Changes
  
  ### Modified Tables
  - `user_settings`
    - Add `font_family` (text) - User's preferred font family
    
  ## Notes
  1. Default font is 'inter' for clean, modern look
  2. Users can choose between multiple font options
  3. Font preference applies globally across the app
*/

-- Add font_family column to user_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'font_family'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN font_family text DEFAULT 'inter';
  END IF;
END $$;