/*
  # Add Gradient Background Color Settings

  1. Modified Tables
    - `user_settings`
      - Add `gradient_color_1` (text) - First color of background gradient (hex format)
      - Add `gradient_color_2` (text) - Second color of background gradient (hex format)
      - Add `gradient_angle` (integer) - Angle of gradient in degrees (0-360)

  2. Default Values
    - gradient_color_1: '#f5f5f4' (stone-100)
    - gradient_color_2: '#fafaf9' (stone-50)
    - gradient_angle: 135 (diagonal from top-left to bottom-right)

  3. Notes
    - Colors stored in hex format for easy CSS usage
    - Angle allows users to customize gradient direction
    - Defaults provide a subtle warm gradient
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'gradient_color_1'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN gradient_color_1 text DEFAULT '#f5f5f4';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'gradient_color_2'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN gradient_color_2 text DEFAULT '#fafaf9';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'gradient_angle'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN gradient_angle integer DEFAULT 135;
  END IF;
END $$;
