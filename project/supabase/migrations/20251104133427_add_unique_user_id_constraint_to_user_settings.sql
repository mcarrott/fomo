/*
  # Add Unique Constraint to user_settings
  
  1. Changes
    - Add unique constraint on user_id column to prevent duplicate settings per user
    - This ensures each user can only have one settings record
  
  2. Security
    - Maintains existing RLS policies
*/

ALTER TABLE user_settings ADD CONSTRAINT user_settings_user_id_unique UNIQUE (user_id);
