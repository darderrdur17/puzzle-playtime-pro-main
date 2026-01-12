import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GameSession, ActivePlayer, Quote, Phase, GameState, PHASE_TITLES, DIFFICULTY_CONFIG } from "@/types/game";
import { toast } from "sonner";

const POINTS_CORRECT = 10;
const POINTS_WRONG_PENALTY = 2;
const STREAK_BONUS = 5;
const TIME_BONUS_MULTIPLIER = 0.1; // 10% of remaining time as bonus

export const usePlayerGame = () => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [player, setPlayer] = useState<ActivePlayer | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [leaderboard, setLeaderboard] = useState<ActivePlayer[]>([]);
  const [showLeaderboardReveal, setShowLeaderboardReveal] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    isStarted: false,
    isCompleted: false,
    startTime: null,
    endTime: null,
    placements: {},
    titlePlacements: {},
    score: 0,
    baseScore: 0,
    timeBonus: 0,
    streak: 0,
    wrongAttempts: 0,
    elapsedTime: 0,
  });
  const [loading, setLoading] = useState(true);

  const audioRef = useRef<{ correct: HTMLAudioElement; wrong: HTMLAudioElement; combo: HTMLAudioElement } | null>(null);
  const gameEndedAtRef = useRef<string | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = {
      correct: new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3"),
      wrong: new Audio("https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3"),
      combo: new Audio("https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3"),
    };
  }, []);

  const playSound = useCallback((type: "correct" | "wrong" | "combo") => {
    if (audioRef.current) {
      audioRef.current[type].currentTime = 0;
      audioRef.current[type].play().catch(() => {});
    }
  }, []);

  // Fetch session
  const fetchSession = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("game_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setSession(data[0] as GameSession);
        return data[0] as GameSession;
      }
      return null;
    } catch (error) {
      console.error("Error fetching session:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch quotes (always use "classic" theme)
  const fetchQuotes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("custom_quotes")
        .select("*")
        .eq("theme", "classic")
        .eq("is_active", true);

      if (error) throw error;

      const formattedQuotes: Quote[] = (data || []).map((q) => ({
        id: q.id,
        text: q.text,
        author: q.author,
        phase: q.phase as Phase,
        theme: q.theme,
      }));

      setQuotes(formattedQuotes.sort(() => Math.random() - 0.5));
    } catch (error) {
      console.error("Error fetching quotes:", error);
    }
  }, []);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("active_players")
        .select("*")
        .eq("session_id", sessionId)
        .order("score", { ascending: false })
        .limit(10);

      if (error) throw error;
      setLeaderboard((data || []) as ActivePlayer[]);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  }, []);

  // Join game
  const joinGame = useCallback(async (
    playerName: string, 
    avatarType: "initial" | "preset" | "custom" = "initial", 
    avatarValue: string | null = null
  ) => {
    if (!session) {
      toast.error("No active game session");
      return false;
    }

    try {
      const { data: existing, error: checkError } = await supabase
        .from("active_players")
        .select("*")
        .eq("session_id", session.id)
        .eq("player_name", playerName)
        .limit(1);

      if (checkError) throw checkError;

      if (existing && existing.length > 0) {
        // Update avatar if rejoining
        await supabase
          .from("active_players")
          .update({ avatar_type: avatarType, avatar_value: avatarValue })
          .eq("id", existing[0].id);
        
        setPlayer({ ...existing[0], avatar_type: avatarType, avatar_value: avatarValue } as ActivePlayer);
        setGameState((prev) => ({
          ...prev,
          isStarted: true,
          startTime: Date.now(),
          placements: (existing[0] as ActivePlayer).placements || {},
          score: existing[0].score,
          streak: existing[0].streak,
          wrongAttempts: existing[0].wrong_attempts,
        }));
        return true;
      }

      const { data: newPlayer, error: createError } = await supabase
        .from("active_players")
        .insert({
          session_id: session.id,
          player_name: playerName,
          avatar_type: avatarType,
          avatar_value: avatarValue,
          score: 0,
          streak: 0,
          wrong_attempts: 0,
          placements: {},
          is_completed: false,
        })
        .select()
        .single();

      if (createError) throw createError;

      setPlayer(newPlayer as ActivePlayer);
      setGameState((prev) => ({
        ...prev,
        isStarted: true,
        startTime: Date.now(),
      }));

      toast.success(`Welcome, ${playerName}!`);
      return true;
    } catch (error) {
      console.error("Error joining game:", error);
      toast.error("Failed to join game");
      return false;
    }
  }, [session]);

  // Place quote in zone
  const placeQuote = useCallback(async (quoteId: string, targetPhase: Phase, correctPhase: Phase) => {
    if (!player || !session) return;

    const isCorrect = targetPhase === correctPhase;
    const multiplier = session.double_points_active ? 2 : 1;

    let newScore = gameState.score;
    let newStreak = gameState.streak;
    let newWrongAttempts = gameState.wrongAttempts;

    if (isCorrect) {
      newStreak += 1;
      const streakBonus = newStreak >= 3 ? STREAK_BONUS * Math.floor(newStreak / 3) : 0;
      newScore += (POINTS_CORRECT + streakBonus) * multiplier;

      if (newStreak >= 3 && newStreak % 3 === 0) {
        playSound("combo");
        toast.success(`🔥 ${newStreak} Streak! +${streakBonus} bonus!`);
      } else {
        playSound("correct");
      }
    } else {
      newStreak = 0;
      newWrongAttempts += 1;
      newScore = Math.max(0, newScore - POINTS_WRONG_PENALTY);
      playSound("wrong");
      toast.error("Wrong phase! Try again.");
    }

    const newPlacements = {
      ...gameState.placements,
      [quoteId]: targetPhase,
    };

    setGameState((prev) => ({
      ...prev,
      placements: newPlacements,
      score: newScore,
      streak: newStreak,
      wrongAttempts: newWrongAttempts,
    }));

    try {
      await supabase
        .from("active_players")
        .update({
          score: newScore,
          streak: newStreak,
          wrong_attempts: newWrongAttempts,
          placements: newPlacements,
        })
        .eq("id", player.id);
    } catch (error) {
      console.error("Error updating player:", error);
    }

    return isCorrect;
  }, [player, session, gameState, playSound]);

  // Place title
  const placeTitle = useCallback(async (titleId: string, targetPhase: Phase) => {
    const title = PHASE_TITLES.find((t) => t.id === titleId);
    if (!title || !player) return;

    const isCorrect = targetPhase === title.phase;
    const multiplier = session?.double_points_active ? 2 : 1;

    let newScore = gameState.score;
    let newStreak = gameState.streak;
    let newWrongAttempts = gameState.wrongAttempts;

    if (isCorrect) {
      newStreak += 1;
      newScore += POINTS_CORRECT * multiplier;
      playSound("correct");
    } else {
      newStreak = 0;
      newWrongAttempts += 1;
      newScore = Math.max(0, newScore - POINTS_WRONG_PENALTY);
      playSound("wrong");
      toast.error("Wrong phase! Try again.");
    }

    const newTitlePlacements = {
      ...gameState.titlePlacements,
      [titleId]: targetPhase,
    };

    setGameState((prev) => ({
      ...prev,
      titlePlacements: newTitlePlacements,
      score: newScore,
      streak: newStreak,
      wrongAttempts: newWrongAttempts,
    }));

    try {
      await supabase
        .from("active_players")
        .update({
          score: newScore,
          streak: newStreak,
          wrong_attempts: newWrongAttempts,
        })
        .eq("id", player.id);
    } catch (error) {
      console.error("Error updating player:", error);
    }

    return isCorrect;
  }, [player, session, gameState, playSound]);

  // Complete game with time bonus calculation
  const completeGame = useCallback(async (remainingSeconds?: number) => {
    if (!player || !session || gameState.isCompleted) return;

    const endTime = Date.now();
    const timeMs = endTime - (gameState.startTime || endTime);
    
    // Calculate time bonus based on remaining time
    let timeBonus = 0;
    if (remainingSeconds && remainingSeconds > 0) {
      timeBonus = Math.floor(remainingSeconds * TIME_BONUS_MULTIPLIER);
    }
    
    const baseScore = gameState.score;
    const finalScore = baseScore + timeBonus;

    setGameState((prev) => ({
      ...prev,
      isCompleted: true,
      endTime,
      baseScore: baseScore,
      timeBonus: timeBonus,
      score: finalScore,
      elapsedTime: Math.floor(timeMs / 1000),
    }));

    try {
      await supabase
        .from("active_players")
        .update({ 
          is_completed: true,
          score: finalScore,
        })
        .eq("id", player.id);

      await supabase.from("leaderboard").insert({
        session_id: session.id,
        player_name: player.player_name,
        score: finalScore,
        time_ms: timeMs,
        theme: "classic",
      });

      if (timeBonus > 0) {
        toast.success(`🎉 Puzzle complete! +${timeBonus} time bonus!`);
      } else {
        toast.success("🎉 Puzzle complete!");
      }
    } catch (error) {
      console.error("Error completing game:", error);
    }
  }, [player, session, gameState]);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (!gameState.isCompleted && player) {
      setShowLeaderboardReveal(true);
      completeGame();
    }
  }, [gameState.isCompleted, player, completeGame]);

  // Subscribe to realtime updates
  useEffect(() => {
    const sessionChannel = supabase
      .channel("player-session-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_sessions",
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const newSession = payload.new as GameSession;
            const oldGameEndedAt = gameEndedAtRef.current;
            
            setSession(newSession);

            // Check if game just ended (game_ended_at was set)
            if (newSession.game_ended_at && !oldGameEndedAt && player) {
              setShowLeaderboardReveal(true);
              if (!gameState.isCompleted) {
                completeGame();
              }
            }
            
            gameEndedAtRef.current = newSession.game_ended_at;

            // Show hint if sent
            if (newSession.current_hint && newSession.current_hint !== session?.current_hint) {
              toast.info(`💡 Hint: ${newSession.current_hint}`, { duration: 10000 });
            }

            // Show double points notification
            if (newSession.double_points_active && !session?.double_points_active) {
              toast.success("🔥 Double Points Activated!", { duration: 5000 });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
    };
  }, [session, player, gameState.isCompleted, completeGame]);

  // Subscribe to leaderboard updates
  useEffect(() => {
    if (!session?.id) return;

    const leaderboardChannel = supabase
      .channel("leaderboard-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "active_players",
          filter: `session_id=eq.${session.id}`,
        },
        () => {
          fetchLeaderboard(session.id);
        }
      )
      .subscribe();

    fetchLeaderboard(session.id);

    return () => {
      supabase.removeChannel(leaderboardChannel);
    };
  }, [session?.id, fetchLeaderboard]);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      const sess = await fetchSession();
      if (sess) {
        gameEndedAtRef.current = sess.game_ended_at;
        await fetchQuotes();
      }
    };
    init();
  }, [fetchSession, fetchQuotes]);

  return {
    session,
    player,
    quotes,
    leaderboard,
    gameState,
    loading,
    showLeaderboardReveal,
    setShowLeaderboardReveal,
    joinGame,
    placeQuote,
    placeTitle,
    completeGame,
    playSound,
    handleTimeUp,
  };
};
