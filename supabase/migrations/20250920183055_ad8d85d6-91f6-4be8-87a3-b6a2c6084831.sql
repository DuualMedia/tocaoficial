-- Add Deezer integration fields to songs table
ALTER TABLE public.songs 
ADD COLUMN IF NOT EXISTS deezer_id TEXT,
ADD COLUMN IF NOT EXISTS preview_url TEXT,
ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Create index for better Deezer ID lookup performance
CREATE INDEX IF NOT EXISTS idx_songs_deezer_id ON public.songs(deezer_id);

-- Add constraint to prevent duplicate Deezer tracks per artist
CREATE UNIQUE INDEX IF NOT EXISTS idx_songs_artist_deezer_unique 
ON public.songs(artist_id, deezer_id) 
WHERE deezer_id IS NOT NULL;