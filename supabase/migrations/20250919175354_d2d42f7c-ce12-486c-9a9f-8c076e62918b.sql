-- Add unique username field to profiles table
ALTER TABLE public.profiles ADD COLUMN username text UNIQUE;

-- Create index for faster username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Add constraint to ensure username is lowercase and alphanumeric with underscores/hyphens
ALTER TABLE public.profiles ADD CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_-]+$');

-- Update shows table to use username as share code instead of UUID
ALTER TABLE public.shows ADD COLUMN username_code text UNIQUE;

-- Create index for faster code lookups
CREATE INDEX idx_shows_username_code ON public.shows(username_code);

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