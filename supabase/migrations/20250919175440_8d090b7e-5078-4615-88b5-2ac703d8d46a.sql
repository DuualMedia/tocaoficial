-- Fix the search_path security issue in the function
CREATE OR REPLACE FUNCTION generate_show_code(artist_username text, show_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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