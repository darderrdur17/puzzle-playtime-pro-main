-- Add avatar fields to active_players
ALTER TABLE active_players 
ADD COLUMN avatar_type TEXT DEFAULT 'initial',
ADD COLUMN avatar_value TEXT DEFAULT NULL;

-- Create saved_leaderboards table to store historical game results
CREATE TABLE public.saved_leaderboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES game_sessions(id) ON DELETE SET NULL,
  game_name TEXT NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  players JSONB NOT NULL,
  winner_name TEXT,
  winner_score INTEGER
);

-- Enable RLS (public access for this game)
ALTER TABLE public.saved_leaderboards ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read saved leaderboards
CREATE POLICY "Anyone can view saved leaderboards" 
ON public.saved_leaderboards 
FOR SELECT 
USING (true);

-- Allow anyone to insert saved leaderboards (game master action)
CREATE POLICY "Anyone can save leaderboards" 
ON public.saved_leaderboards 
FOR INSERT 
WITH CHECK (true);

-- Create storage bucket for player avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Allow anyone to view avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

-- Allow anyone to upload avatars (player action)
CREATE POLICY "Anyone can upload avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars');

-- Allow anyone to update their avatars
CREATE POLICY "Anyone can update avatars" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars');