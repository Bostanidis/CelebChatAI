-- Create characters table
CREATE TABLE IF NOT EXISTS public.characters (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  avatar_url text,
  personality text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default characters if they don't exist
INSERT INTO public.characters (id, name, description, avatar_url, personality, created_at)
VALUES 
  (
    'elon-musk',
    'Elon Musk',
    'Tech entrepreneur and CEO of Tesla and SpaceX',
    '/characters/elon-musk.jpg',
    'Innovative, ambitious, and forward-thinking',
    NOW()
  ),
  (
    'sherlock-holmes',
    'Sherlock Holmes',
    'Famous detective known for his deductive reasoning',
    '/characters/sherlock-holmes.jpg',
    'Analytical, observant, and brilliant',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Grant access to authenticated users
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to characters"
  ON public.characters
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert characters"
  ON public.characters
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their characters"
  ON public.characters
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true); 