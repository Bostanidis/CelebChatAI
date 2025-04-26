-- Create message_counts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.message_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT message_counts_user_id_created_at_key UNIQUE (user_id, created_at)
);

-- Enable RLS
ALTER TABLE public.message_counts ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_message_counts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_message_counts_updated_at
    BEFORE UPDATE ON public.message_counts
    FOR EACH ROW
    EXECUTE FUNCTION update_message_counts_updated_at();

-- Create function to initialize message count
CREATE OR REPLACE FUNCTION initialize_message_count()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.message_counts (user_id, count)
    VALUES (NEW.id, 0)
    ON CONFLICT (user_id, created_at) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger to initialize message count for new users
CREATE TRIGGER on_auth_user_created_message_count
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION initialize_message_count(); 