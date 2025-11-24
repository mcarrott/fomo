/*
  # Make task due_date optional

  1. Changes
    - Remove default value from tasks.due_date
    - Allow NULL values for due_date
  
  2. Purpose
    - Allow tasks to be created without a due date
    - Users can optionally add due dates when needed
*/

ALTER TABLE tasks ALTER COLUMN due_date DROP DEFAULT;
ALTER TABLE tasks ALTER COLUMN due_date DROP NOT NULL;
