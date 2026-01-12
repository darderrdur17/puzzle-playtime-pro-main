-- Game sessions table for realtime sync
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_active BOOLEAN NOT NULL DEFAULT false,
  theme TEXT NOT NULL DEFAULT 'classic',
  timer_seconds INTEGER NOT NULL DEFAULT 600,
  timer_started_at TIMESTAMP WITH TIME ZONE,
  double_points_active BOOLEAN NOT NULL DEFAULT false,
  current_hint TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Active players table
CREATE TABLE public.active_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  wrong_attempts INTEGER NOT NULL DEFAULT 0,
  placements JSONB NOT NULL DEFAULT '{}',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Leaderboard table for persistent scores
CREATE TABLE public.leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE SET NULL,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  time_ms INTEGER NOT NULL,
  theme TEXT NOT NULL DEFAULT 'classic',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Custom quotes table
CREATE TABLE public.custom_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theme TEXT NOT NULL DEFAULT 'classic',
  phase TEXT NOT NULL CHECK (phase IN ('preparation', 'incubation', 'illumination', 'verification')),
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rapid fire questions for challenges
CREATE TABLE public.rapid_fire_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theme TEXT NOT NULL DEFAULT 'classic',
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (allow public access for game)
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rapid_fire_questions ENABLE ROW LEVEL SECURITY;

-- Public access policies (classroom game - no auth required)
CREATE POLICY "Allow public read on sessions" ON public.game_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on sessions" ON public.game_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on sessions" ON public.game_sessions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on sessions" ON public.game_sessions FOR DELETE USING (true);

CREATE POLICY "Allow public read on players" ON public.active_players FOR SELECT USING (true);
CREATE POLICY "Allow public insert on players" ON public.active_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on players" ON public.active_players FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on players" ON public.active_players FOR DELETE USING (true);

CREATE POLICY "Allow public read on leaderboard" ON public.leaderboard FOR SELECT USING (true);
CREATE POLICY "Allow public insert on leaderboard" ON public.leaderboard FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on quotes" ON public.custom_quotes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on quotes" ON public.custom_quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on quotes" ON public.custom_quotes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on quotes" ON public.custom_quotes FOR DELETE USING (true);

CREATE POLICY "Allow public read on questions" ON public.rapid_fire_questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on questions" ON public.rapid_fire_questions FOR INSERT WITH CHECK (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.active_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_quotes;

-- Create indexes for performance
CREATE INDEX idx_active_players_session ON public.active_players(session_id);
CREATE INDEX idx_active_players_score ON public.active_players(score DESC);
CREATE INDEX idx_leaderboard_score ON public.leaderboard(score DESC, time_ms ASC);
CREATE INDEX idx_custom_quotes_theme ON public.custom_quotes(theme, phase);

-- Seed default quotes for classic theme
INSERT INTO public.custom_quotes (theme, phase, text, author) VALUES
-- Preparation phase
('classic', 'preparation', 'Chance favors only the prepared mind.', 'Louis Pasteur'),
('classic', 'preparation', 'Give me six hours to chop down a tree and I will spend the first four sharpening the axe.', 'Abraham Lincoln'),
('classic', 'preparation', 'Before anything else, preparation is the key to success.', 'Alexander Graham Bell'),
('classic', 'preparation', 'By failing to prepare, you are preparing to fail.', 'Benjamin Franklin'),
('classic', 'preparation', 'Success depends upon previous preparation, and without such preparation there is sure to be failure.', 'Confucius'),

-- Incubation phase
('classic', 'incubation', 'You can''t force creativity; sometimes you just have to let it happen.', 'Maya Angelou'),
('classic', 'incubation', 'My best ideas usually come to me when I am stuck in traffic on my way to work along Clementi Road.', 'Chai Kah Hin'),
('classic', 'incubation', 'The idea came into my mind during a walk... the whole thing was arranged in my mind.', 'James Watt'),
('classic', 'incubation', 'Late-night dreaming space is so fertile for new ideas.', 'Barbara Corcoran'),
('classic', 'incubation', 'Almost all really new ideas have a certain aspect of foolishness when they are first produced.', 'Alfred North Whitehead'),
('classic', 'incubation', 'Creativity is allowing yourself to make mistakes. Art is knowing which ones to keep.', 'Scott Adams'),

-- Illumination phase
('classic', 'illumination', 'Eureka! I have found it.', 'Archimedes'),
('classic', 'illumination', 'The idea came like a flash of lightning, and in an instant the truth was revealed.', 'Nikola Tesla'),
('classic', 'illumination', 'The sudden illumination is only the result of long unconscious work.', 'Henri Poincaré'),
('classic', 'illumination', 'The proof of the pudding is in the eating.', 'English Proverb'),
('classic', 'illumination', 'In the middle of difficulty lies opportunity.', 'Albert Einstein'),
('classic', 'illumination', 'The moment of insight is a gift; be ready to receive it.', 'Unknown'),

-- Verification phase
('classic', 'verification', 'Ideas are easy. Implementation is hard.', 'Guy Kawasaki'),
('classic', 'verification', 'Genius is 1% inspiration and 99% perspiration.', 'Thomas Edison'),
('classic', 'verification', 'Vision without execution is just hallucination.', 'Henry Ford'),
('classic', 'verification', 'An idea is nothing more than a possibility until you take action.', 'Unknown'),
('classic', 'verification', 'The value of an idea lies in the using of it.', 'Thomas Edison'),

-- Science Lab theme
('science', 'preparation', 'Research is what I''m doing when I don''t know what I''m doing.', 'Wernher von Braun'),
('science', 'preparation', 'The important thing is not to stop questioning.', 'Albert Einstein'),
('science', 'incubation', 'Science is organized curiosity.', 'William Clifford'),
('science', 'incubation', 'The good thing about science is that it''s true whether or not you believe in it.', 'Neil deGrasse Tyson'),
('science', 'illumination', 'That''s one small step for man, one giant leap for mankind.', 'Neil Armstrong'),
('science', 'illumination', 'I have not failed. I''ve just found 10,000 ways that won''t work.', 'Thomas Edison'),
('science', 'verification', 'In science, there are no shortcuts to truth.', 'Karl Popper'),
('science', 'verification', 'The scientist is not a person who gives the right answers, he''s one who asks the right questions.', 'Claude Lévi-Strauss'),

-- Art Studio theme
('art', 'preparation', 'Every artist was first an amateur.', 'Ralph Waldo Emerson'),
('art', 'preparation', 'Art is not what you see, but what you make others see.', 'Edgar Degas'),
('art', 'incubation', 'Creativity takes courage.', 'Henri Matisse'),
('art', 'incubation', 'Art enables us to find ourselves and lose ourselves at the same time.', 'Thomas Merton'),
('art', 'illumination', 'I dream my painting and I paint my dream.', 'Vincent van Gogh'),
('art', 'illumination', 'Art is the lie that enables us to realize the truth.', 'Pablo Picasso'),
('art', 'verification', 'Art is never finished, only abandoned.', 'Leonardo da Vinci'),
('art', 'verification', 'The purpose of art is washing the dust of daily life off our souls.', 'Pablo Picasso'),

-- Startup Sprint theme
('startup', 'preparation', 'The best way to predict the future is to create it.', 'Peter Drucker'),
('startup', 'preparation', 'Stay hungry, stay foolish.', 'Steve Jobs'),
('startup', 'incubation', 'Move fast and break things.', 'Mark Zuckerberg'),
('startup', 'incubation', 'Your most unhappy customers are your greatest source of learning.', 'Bill Gates'),
('startup', 'illumination', 'The way to get started is to quit talking and begin doing.', 'Walt Disney'),
('startup', 'illumination', 'Innovation distinguishes between a leader and a follower.', 'Steve Jobs'),
('startup', 'verification', 'Done is better than perfect.', 'Sheryl Sandberg'),
('startup', 'verification', 'If you''re not embarrassed by the first version of your product, you''ve launched too late.', 'Reid Hoffman');

-- Seed rapid fire questions
INSERT INTO public.rapid_fire_questions (theme, question, options, correct_answer, points) VALUES
('classic', 'Which phase involves gathering information and resources?', '["Preparation", "Incubation", "Illumination", "Verification"]', 0, 10),
('classic', 'During which phase does the "Eureka moment" occur?', '["Preparation", "Incubation", "Illumination", "Verification"]', 2, 10),
('classic', 'Which phase involves letting ideas develop subconsciously?', '["Preparation", "Incubation", "Illumination", "Verification"]', 1, 10),
('classic', 'Testing and refining ideas happens in which phase?', '["Preparation", "Incubation", "Illumination", "Verification"]', 3, 10),
('science', 'Who said "Eureka! I have found it"?', '["Newton", "Einstein", "Archimedes", "Galileo"]', 2, 15),
('art', 'Who said "Creativity takes courage"?', '["Picasso", "Matisse", "Van Gogh", "Monet"]', 1, 15);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers
CREATE TRIGGER update_game_sessions_updated_at
  BEFORE UPDATE ON public.game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_active_players_updated_at
  BEFORE UPDATE ON public.active_players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();