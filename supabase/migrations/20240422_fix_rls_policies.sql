-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can view their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can delete their own chats" ON public.chats;
DROP POLICY IF EXISTS "Anonymous users can insert chats" ON public.chats;
DROP POLICY IF EXISTS "Anonymous users can view chats" ON public.chats;

-- Enable RLS on the chats table
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert their own chats
CREATE POLICY "Users can insert their own chats"
ON public.chats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to view their own chats
CREATE POLICY "Users can view their own chats"
ON public.chats
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow users to update their own chats
CREATE POLICY "Users can update their own chats"
ON public.chats
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own chats
CREATE POLICY "Users can delete their own chats"
ON public.chats
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow anonymous users to insert chats (for guest mode)
CREATE POLICY "Anonymous users can insert chats"
ON public.chats
FOR INSERT
TO anon
WITH CHECK (true);

-- Create policy to allow anonymous users to view chats (for guest mode)
CREATE POLICY "Anonymous users can view chats"
ON public.chats
FOR SELECT
TO anon
USING (true); 