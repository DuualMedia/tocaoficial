-- Create enum types
CREATE TYPE public.user_role AS ENUM ('artist', 'audience');
CREATE TYPE public.show_status AS ENUM ('draft', 'live', 'paused', 'ended');
CREATE TYPE public.request_status AS ENUM ('pending', 'accepted', 'playing', 'played', 'skipped');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'audience',
    bio TEXT,
    pix_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Create shows table
CREATE TABLE public.shows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status show_status NOT NULL DEFAULT 'draft',
    qr_code_url TEXT,
    share_url TEXT,
    location TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create songs table
CREATE TABLE public.songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    key TEXT,
    genre TEXT,
    lyrics TEXT,
    chords TEXT,
    duration_seconds INTEGER,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create song requests table
CREATE TABLE public.song_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_id UUID NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
    requester_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    requester_name TEXT NOT NULL,
    song_id UUID REFERENCES public.songs(id) ON DELETE SET NULL,
    custom_song_title TEXT,
    custom_song_artist TEXT,
    message TEXT,
    status request_status NOT NULL DEFAULT 'pending',
    tip_amount DECIMAL(10,2) DEFAULT 0,
    position_in_queue INTEGER,
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    played_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.song_requests(id) ON DELETE CASCADE,
    payer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BRL',
    payment_method TEXT,
    payment_id TEXT,
    status payment_status NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for shows
CREATE POLICY "Anyone can view live shows" ON public.shows FOR SELECT USING (status = 'live' OR auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = artist_id));
CREATE POLICY "Artists can manage their shows" ON public.shows FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = artist_id));
CREATE POLICY "Artists can create shows" ON public.shows FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = artist_id));

-- Create RLS policies for songs
CREATE POLICY "Anyone can view available songs" ON public.songs FOR SELECT USING (is_available = true OR auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = artist_id));
CREATE POLICY "Artists can manage their songs" ON public.songs FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = artist_id));
CREATE POLICY "Artists can create songs" ON public.songs FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = artist_id));

-- Create RLS policies for song requests
CREATE POLICY "Show participants can view requests" ON public.song_requests FOR SELECT USING (
    auth.uid() IN (
        SELECT user_id FROM public.profiles p 
        JOIN public.shows s ON p.id = s.artist_id 
        WHERE s.id = show_id
    ) OR 
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = requester_id)
);
CREATE POLICY "Artists can manage requests for their shows" ON public.song_requests FOR UPDATE USING (
    auth.uid() IN (
        SELECT user_id FROM public.profiles p 
        JOIN public.shows s ON p.id = s.artist_id 
        WHERE s.id = show_id
    )
);
CREATE POLICY "Anyone can create requests for live shows" ON public.song_requests FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.shows WHERE id = show_id AND status = 'live')
);

-- Create RLS policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = payer_id) OR
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = artist_id)
);
CREATE POLICY "System can manage payments" ON public.payments FOR ALL USING (true);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = user_id));
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = user_id));
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shows_updated_at BEFORE UPDATE ON public.shows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON public.songs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_song_requests_updated_at BEFORE UPDATE ON public.song_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name, username)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
        LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data ->> 'display_name', SPLIT_PART(NEW.email, '@', 1)), ' ', '_'))
    );
    RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update request queue positions
CREATE OR REPLACE FUNCTION public.update_queue_positions(show_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    UPDATE public.song_requests 
    SET position_in_queue = subquery.new_position
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                ORDER BY 
                    CASE WHEN tip_amount > 0 THEN 1 ELSE 2 END,
                    tip_amount DESC,
                    requested_at ASC
            ) as new_position
        FROM public.song_requests 
        WHERE show_id = show_uuid 
        AND status = 'pending'
    ) as subquery
    WHERE song_requests.id = subquery.id;
END;
$$;

-- Enable realtime for tables
ALTER TABLE public.song_requests REPLICA IDENTITY FULL;
ALTER TABLE public.shows REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.song_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;