-- Add chosen_theme column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS chosen_theme text DEFAULT 'system'::text;

-- Update existing profiles to have the default theme
UPDATE public.profiles SET chosen_theme = 'system' WHERE chosen_theme IS NULL;