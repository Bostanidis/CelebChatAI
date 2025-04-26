-- Create message_counts table
CREATE TABLE IF NOT EXISTS public.message_counts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.message_counts ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own message counts
CREATE POLICY "Users can read their own message counts" 
  ON public.message_counts 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own message counts
CREATE POLICY "Users can insert their own message counts" 
  ON public.message_counts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own message counts
CREATE POLICY "Users can update their own message counts" 
  ON public.message_counts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create function to create message_counts table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_message_counts_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'message_counts') THEN
    -- Create the table
    CREATE TABLE public.message_counts (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
      count INTEGER DEFAULT 0 NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    -- Add RLS policies
    ALTER TABLE public.message_counts ENABLE ROW LEVEL SECURITY;

    -- Policy to allow users to read their own message counts
    CREATE POLICY "Users can read their own message counts" 
      ON public.message_counts 
      FOR SELECT 
      USING (auth.uid() = user_id);

    -- Policy to allow users to insert their own message counts
    CREATE POLICY "Users can insert their own message counts" 
      ON public.message_counts 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);

    -- Policy to allow users to update their own message counts
    CREATE POLICY "Users can update their own message counts" 
      ON public.message_counts 
      FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;
END;
$$; 