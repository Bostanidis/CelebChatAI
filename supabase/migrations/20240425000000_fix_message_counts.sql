-- Step 1: Create a new message_counts table with proper structure
CREATE TABLE IF NOT EXISTS message_counts_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    character_id TEXT NOT NULL,
    count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    CONSTRAINT message_counts_user_character_date_key UNIQUE (user_id, character_id, date)
);

-- Step 2: Set up RLS policies
ALTER TABLE message_counts_new ENABLE ROW LEVEL SECURITY;

-- Policy for reading own message counts
CREATE POLICY "Users can read their own message counts"
    ON message_counts_new
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for inserting own message counts
CREATE POLICY "Users can insert their own message counts"
    ON message_counts_new
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy for updating own message counts
CREATE POLICY "Users can update their own message counts"
    ON message_counts_new
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Step 3: Copy data from old table if it exists
DO $$
DECLARE
    column_exists boolean;
BEGIN
    -- Check if the old table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'message_counts') THEN
        -- Check if character_id column exists in the old table
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'message_counts'
            AND column_name = 'character_id'
        ) INTO column_exists;

        IF column_exists THEN
            -- If character_id exists, use it
            INSERT INTO message_counts_new (user_id, character_id, count, created_at, updated_at, date)
            SELECT 
                user_id,
                character_id,
                SUM(count) as count,
                MIN(created_at) as created_at,
                MAX(updated_at) as updated_at,
                DATE(created_at) as date
            FROM message_counts
            GROUP BY user_id, character_id, DATE(created_at);
        ELSE
            -- If character_id doesn't exist, use a default value
            INSERT INTO message_counts_new (user_id, character_id, count, created_at, updated_at, date)
            SELECT 
                user_id,
                'legacy-data' as character_id,
                SUM(count) as count,
                MIN(created_at) as created_at,
                MAX(updated_at) as updated_at,
                DATE(created_at) as date
            FROM message_counts
            GROUP BY user_id, DATE(created_at);
        END IF;

        -- Drop the old table
        DROP TABLE message_counts;
    END IF;
END $$;

-- Step 4: Rename the new table to message_counts
ALTER TABLE message_counts_new RENAME TO message_counts;

-- Step 5: Create or replace the function to create message_counts table
-- This function will be used by the application if the table doesn't exist
CREATE OR REPLACE FUNCTION create_message_counts_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'message_counts') THEN
        -- Create the table
        CREATE TABLE public.message_counts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            character_id TEXT NOT NULL,
            count INTEGER DEFAULT 0 NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
            date DATE DEFAULT CURRENT_DATE NOT NULL,
            CONSTRAINT message_counts_user_character_date_key UNIQUE (user_id, character_id, date)
        );

        -- Enable RLS
        ALTER TABLE public.message_counts ENABLE ROW LEVEL SECURITY;

        -- Set up policies
        CREATE POLICY "Users can read their own message counts"
            ON public.message_counts
            FOR SELECT
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own message counts"
            ON public.message_counts
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own message counts"
            ON public.message_counts
            FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;
END;
$$;

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS message_counts_user_character_date_idx 
ON message_counts (user_id, character_id, date);

-- Create an index for date-based queries
CREATE INDEX IF NOT EXISTS message_counts_date_idx 
ON message_counts (date); 