-- Enable realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
SELECT cron.schedule('add-notifications-to-publication', '0 0 * * *', 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;');

-- Enable realtime for song_requests table  
ALTER TABLE public.song_requests REPLICA IDENTITY FULL;
SELECT cron.schedule('add-song-requests-to-publication', '0 0 * * *', 'ALTER PUBLICATION supabase_realtime ADD TABLE public.song_requests;');

-- Create trigger function to notify artist when song request is created
CREATE OR REPLACE FUNCTION notify_artist_on_song_request()
RETURNS TRIGGER AS $$
DECLARE
    artist_user_id UUID;
    show_name TEXT;
    song_title TEXT;
BEGIN
    -- Get artist user_id and show name
    SELECT s.name, p.user_id INTO show_name, artist_user_id
    FROM shows s
    JOIN profiles p ON s.artist_id = p.id
    WHERE s.id = NEW.show_id;
    
    -- Determine song title
    song_title := COALESCE(NEW.custom_song_title, (
        SELECT title FROM songs WHERE id = NEW.song_id
    ));
    
    -- Create notification for the artist
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        data
    ) VALUES (
        artist_user_id,
        'Novo pedido musical',
        NEW.requester_name || ' pediu: ' || song_title || 
        CASE 
            WHEN NEW.message IS NOT NULL AND NEW.message != '' 
            THEN ' - "' || NEW.message || '"'
            ELSE ''
        END ||
        CASE 
            WHEN NEW.tip_amount > 0 
            THEN ' (PIX: R$ ' || NEW.tip_amount || ')'
            ELSE ''
        END,
        'song_request',
        jsonb_build_object(
            'request_id', NEW.id,
            'show_id', NEW.show_id,
            'show_name', show_name,
            'song_title', song_title,
            'requester_name', NEW.requester_name,
            'message', NEW.message,
            'tip_amount', NEW.tip_amount
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;