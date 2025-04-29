-- Add username and email_notifications columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username text,
ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS sound_enabled boolean DEFAULT true;

-- Remove bio column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'bio'
    ) THEN
        ALTER TABLE public.profiles DROP COLUMN bio;
    END IF;
END
$$;

-- Update the handle_new_user function to include the new columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, email_notifications, sound_enabled)
  VALUES (NEW.id, NEW.email, '', true, true);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;