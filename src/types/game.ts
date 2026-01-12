export type Phase = "preparation" | "incubation" | "illumination" | "verification";

// Rotation angles for jigsaw pieces (must be 0 to place correctly)
export type Rotation = 0 | 90 | 180 | 270;

export interface Quote {
  id: string;
  text: string;
  author: string;
  phase: Phase;
  theme?: string;
  rotation?: Rotation;
}

export interface PhaseTitle {
  id: string;
  title: string;
  phase: Phase;
  rotation?: Rotation;
}

export type Difficulty = "easy" | "medium" | "hard";

export interface GameSession {
  id: string;
  is_active: boolean;
  theme: string;
  difficulty: Difficulty;
  timer_seconds: number;
  timer_started_at: string | null;
  double_points_active: boolean;
  current_hint: string | null;
  game_ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, { 
  label: string; 
  icon: string; 
  timerSeconds: number; 
  quotesCount: number;
  description: string;
}> = {
  easy: { 
    label: "Easy", 
    icon: "🌱", 
    timerSeconds: 900, 
    quotesCount: 8,
    description: "8 quotes, 15 min timer"
  },
  medium: { 
    label: "Medium", 
    icon: "🌿", 
    timerSeconds: 600, 
    quotesCount: 16,
    description: "16 quotes, 10 min timer"
  },
  hard: { 
    label: "Hard", 
    icon: "🌳", 
    timerSeconds: 300, 
    quotesCount: 24,
    description: "24 quotes, 5 min timer"
  },
};

export interface ActivePlayer {
  id: string;
  session_id: string;
  player_name: string;
  score: number;
  streak: number;
  wrong_attempts: number;
  placements: Record<string, string>;
  is_completed: boolean;
  joined_at: string;
  updated_at: string;
  avatar_type?: string;
  avatar_value?: string | null;
}

export interface LeaderboardEntry {
  id: string;
  session_id: string | null;
  player_name: string;
  score: number;
  time_ms: number;
  theme: string;
  created_at: string;
}

export interface CustomQuote {
  id: string;
  theme: string;
  phase: Phase;
  text: string;
  author: string;
  is_active: boolean;
  created_at: string;
}

export interface RapidFireQuestion {
  id: string;
  theme: string;
  question: string;
  options: string[];
  correct_answer: number;
  points: number;
  created_at: string;
}

export interface GameState {
  isStarted: boolean;
  isCompleted: boolean;
  startTime: number | null;
  endTime: number | null;
  placements: Record<string, string>;
  titlePlacements: Record<string, string>;
  score: number;
  baseScore: number;
  timeBonus: number;
  streak: number;
  wrongAttempts: number;
  elapsedTime: number;
}

export const PHASE_CONFIG: Record<Phase, { title: string; color: string; description: string }> = {
  preparation: {
    title: "Preparation",
    color: "phase-preparation",
    description: "Gathering information and resources",
  },
  incubation: {
    title: "Incubation",
    color: "phase-incubation",
    description: "Letting ideas develop subconsciously",
  },
  illumination: {
    title: "Illumination",
    color: "phase-illumination",
    description: "The 'Eureka!' moment of insight",
  },
  verification: {
    title: "Verification",
    color: "phase-verification",
    description: "Testing and refining ideas",
  },
};

export const PHASE_TITLES: PhaseTitle[] = [
  { id: "title-preparation", title: "Preparation", phase: "preparation" },
  { id: "title-incubation", title: "Incubation", phase: "incubation" },
  { id: "title-illumination", title: "Illumination", phase: "illumination" },
  { id: "title-verification", title: "Verification", phase: "verification" },
];

// Single creativity theme only
export const THEME = { id: "classic", name: "Creativity", icon: "🐘" } as const;

export type ThemeId = "classic";
