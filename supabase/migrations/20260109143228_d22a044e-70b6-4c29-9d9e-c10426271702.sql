-- Add game_ended_at column to track when the game master ends the game
ALTER TABLE game_sessions 
ADD COLUMN game_ended_at TIMESTAMPTZ DEFAULT NULL;