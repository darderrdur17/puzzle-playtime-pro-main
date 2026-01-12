-- Add difficulty column to game_sessions
ALTER TABLE public.game_sessions
ADD COLUMN difficulty TEXT NOT NULL DEFAULT 'medium';

-- Add comment for clarity
COMMENT ON COLUMN public.game_sessions.difficulty IS 'Game difficulty level: easy, medium, or hard';