/*
  # Make Reminder Date Optional and Add Post-it Note Titles

  ## Overview
  Updates the home dashboard schema to make reminder dates optional and adds
  title field to post-it notes for categorization.

  ## Changes

  ### Modified Tables
  
  #### `reminders`
  - Make `date` column nullable (previously required)
  - Allows reminders without specific dates
  
  #### `post_it_notes`
  - Add `title` column (text, nullable) - For categorization/labeling
  - Title displays at the top of each post-it note

  ## Notes
  - Existing data is preserved
  - Reminders can now be created without dates
  - Post-it notes gain optional title/category feature
*/

-- Make reminder date optional
ALTER TABLE reminders 
ALTER COLUMN date DROP NOT NULL;

-- Add title column to post_it_notes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'post_it_notes' AND column_name = 'title'
  ) THEN
    ALTER TABLE post_it_notes ADD COLUMN title text;
  END IF;
END $$;