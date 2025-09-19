-- Add constraint to ensure username is lowercase and alphanumeric with underscores/hyphens (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'username_format' 
        AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_-]+$');
    END IF;
END $$;

-- Add unique username_code field to shows table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shows' AND column_name = 'username_code'
    ) THEN
        ALTER TABLE public.shows ADD COLUMN username_code text UNIQUE;
    END IF;
END $$;

-- Create index for faster code lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_shows_username_code ON public.shows(username_code);

-- Function to generate unique show code from username
CREATE OR REPLACE FUNCTION generate_show_code(artist_username text, show_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    base_code text;
    final_code text;
    counter integer := 1;
BEGIN
    -- Create base code from username and show name (first word)
    base_code := artist_username || '_' || lower(regexp_replace(split_part(show_name, ' ', 1), '[^a-zA-Z0-9]', '', 'g'));
    final_code := base_code;
    
    -- Check if code exists, if so add counter
    WHILE EXISTS (SELECT 1 FROM shows WHERE username_code = final_code) LOOP
        final_code := base_code || '_' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_code;
END;
$$;