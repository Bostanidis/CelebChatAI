-- Enable RLS on the chats table
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own chats
CREATE POLICY "Users can read their own chats"
ON chats FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create policy to allow users to insert their own chats
CREATE POLICY "Users can insert their own chats"
ON chats FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Create policy to allow users to update their own chats
CREATE POLICY "Users can update their own chats"
ON chats FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create policy to allow users to delete their own chats
CREATE POLICY "Users can delete their own chats"
ON chats FOR DELETE
TO authenticated
USING (user_id = auth.uid()); 