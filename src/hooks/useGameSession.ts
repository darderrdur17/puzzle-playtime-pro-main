import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GameSession, ActivePlayer, CustomQuote, Quote, Phase, Difficulty, DIFFICULTY_CONFIG } from "@/types/game";
import { toast } from "sonner";

export const useGameSession = () => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<ActivePlayer[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  // Fetch or create session
  const initSession = useCallback(async () => {
    try {
      const { data: existingSessions, error: fetchError } = await supabase
        .from("game_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingSessions && existingSessions.length > 0) {
        setSession(existingSessions[0] as GameSession);
      } else {
        const { data: newSession, error: createError } = await supabase
          .from("game_sessions")
          .insert({ is_active: false, theme: "classic" })
          .select()
          .single();

        if (createError) throw createError;
        setSession(newSession as GameSession);
      }
    } catch (error) {
      console.error("Error initializing session:", error);
      toast.error("Failed to connect to game server");
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

      const formattedQuotes: Quote[] = (data || []).map((q: CustomQuote) => ({
        id: q.id,
        text: q.text,
        author: q.author,
        phase: q.phase as Phase,
        theme: q.theme,
      }));

      setQuotes(formattedQuotes);
    } catch (error) {
      console.error("Error fetching quotes:", error);
    }
  }, []);

  // Fetch active players
  const fetchPlayers = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("active_players")
        .select("*")
        .eq("session_id", sessionId)
        .order("score", { ascending: false });

      if (error) throw error;
      setPlayers((data || []) as ActivePlayer[]);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  }, []);

  // Start game
  const startGame = useCallback(async () => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from("game_sessions")
        .update({
          is_active: true,
          timer_started_at: new Date().toISOString(),
          game_ended_at: null,
        })
        .eq("id", session.id);

      if (error) throw error;
      toast.success("Game started!");
    } catch (error) {
      console.error("Error starting game:", error);
      toast.error("Failed to start game");
    }
  }, [session]);

  // Pause game (stop without ending)
  const stopGame = useCallback(async () => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from("game_sessions")
        .update({
          is_active: false,
          timer_started_at: null,
        })
        .eq("id", session.id);

      if (error) throw error;
      toast.success("Game paused");
    } catch (error) {
      console.error("Error stopping game:", error);
      toast.error("Failed to pause game");
    }
  }, [session]);

  // End game (triggers leaderboard reveal)
  const endGame = useCallback(async () => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from("game_sessions")
        .update({
          is_active: false,
          timer_started_at: null,
          game_ended_at: new Date().toISOString(),
        })
        .eq("id", session.id);

      if (error) throw error;
      toast.success("Game ended! Showing leaderboard to players...");
    } catch (error) {
      console.error("Error ending game:", error);
      toast.error("Failed to end game");
    }
  }, [session]);

  // Set timer duration
  const setTimer = useCallback(async (seconds: number) => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from("game_sessions")
        .update({ timer_seconds: seconds })
        .eq("id", session.id);

      if (error) throw error;
      toast.success(`Timer set to ${Math.floor(seconds / 60)} minutes`);
    } catch (error) {
      console.error("Error setting timer:", error);
      toast.error("Failed to set timer");
    }
  }, [session]);

  // Set difficulty
  const setDifficulty = useCallback(async (difficulty: Difficulty) => {
    if (!session) return;

    const config = DIFFICULTY_CONFIG[difficulty];
    
    try {
      const { error } = await supabase
        .from("game_sessions")
        .update({ 
          difficulty,
          timer_seconds: config.timerSeconds 
        })
        .eq("id", session.id);

      if (error) throw error;
      toast.success(`Difficulty set to ${config.label}`);
    } catch (error) {
      console.error("Error setting difficulty:", error);
      toast.error("Failed to set difficulty");
    }
  }, [session]);

  // Set custom game settings
  const setCustomSettings = useCallback(async (quotesCount: number, timerMinutes: number) => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from("game_sessions")
        .update({ 
          difficulty: 'medium', // Keep as medium for custom
          timer_seconds: timerMinutes * 60 
        })
        .eq("id", session.id);

      if (error) throw error;
      toast.success(`Custom settings: ${quotesCount} quotes, ${timerMinutes} min timer`);
    } catch (error) {
      console.error("Error setting custom settings:", error);
      toast.error("Failed to set custom settings");
    }
  }, [session]);

  // Toggle double points
  const toggleDoublePoints = useCallback(async () => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from("game_sessions")
        .update({ double_points_active: !session.double_points_active })
        .eq("id", session.id);

      if (error) throw error;
      toast.success(session.double_points_active ? "Double points deactivated" : "Double points activated!");
    } catch (error) {
      console.error("Error toggling double points:", error);
    }
  }, [session]);

  // Send hint
  const sendHint = useCallback(async (hint: string) => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from("game_sessions")
        .update({ current_hint: hint })
        .eq("id", session.id);

      if (error) throw error;
      toast.success("Hint sent to all players!");

      setTimeout(async () => {
        await supabase
          .from("game_sessions")
          .update({ current_hint: null })
          .eq("id", session.id);
      }, 10000);
    } catch (error) {
      console.error("Error sending hint:", error);
    }
  }, [session]);

  // Clear all players
  const clearPlayers = useCallback(async () => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from("active_players")
        .delete()
        .eq("session_id", session.id);

      if (error) throw error;
      toast.success("All players cleared");
    } catch (error) {
      console.error("Error clearing players:", error);
    }
  }, [session]);

  // Reset leaderboard for new game
  const resetLeaderboard = useCallback(async () => {
    if (!session) return;

    try {
      // Clear players and reset session
      await supabase
        .from("active_players")
        .delete()
        .eq("session_id", session.id);

      await supabase
        .from("game_sessions")
        .update({
          is_active: false,
          timer_started_at: null,
          game_ended_at: null,
        })
        .eq("id", session.id);

      toast.success("Leaderboard reset - ready for new game!");
    } catch (error) {
      console.error("Error resetting leaderboard:", error);
      toast.error("Failed to reset leaderboard");
    }
  }, [session]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!session?.id) return;

    const sessionChannel = supabase
      .channel("session-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_sessions",
          filter: `id=eq.${session.id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setSession(payload.new as GameSession);
          }
        }
      )
      .subscribe();

    const playersChannel = supabase
      .channel("players-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "active_players",
          filter: `session_id=eq.${session.id}`,
        },
        () => {
          fetchPlayers(session.id);
        }
      )
      .subscribe();

    fetchPlayers(session.id);
    fetchQuotes();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [session?.id, fetchPlayers, fetchQuotes]);

  // Initialize on mount
  useEffect(() => {
    initSession();
  }, [initSession]);

  return {
    session,
    players,
    quotes,
    loading,
    startGame,
    stopGame,
    endGame,
    setTimer,
    setDifficulty,
    setCustomSettings,
    toggleDoublePoints,
    sendHint,
    clearPlayers,
    resetLeaderboard,
    refetchPlayers: () => session && fetchPlayers(session.id),
  };
};
