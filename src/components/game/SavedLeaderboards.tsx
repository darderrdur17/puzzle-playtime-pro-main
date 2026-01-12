import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Calendar, X, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { ActivePlayer } from "@/types/game";
import { format } from "date-fns";

interface SavedLeaderboard {
  id: string;
  game_name: string;
  saved_at: string;
  players: ActivePlayer[];
  winner_name: string | null;
  winner_score: number | null;
}

interface SavedLeaderboardsProps {
  currentPlayers: ActivePlayer[];
  sessionId: string | null;
  onClose: () => void;
  onLeaderboardSaved?: () => void;
}

export const SavedLeaderboards = ({
  currentPlayers,
  sessionId,
  onClose,
  onLeaderboardSaved,
}: SavedLeaderboardsProps) => {
  const [savedBoards, setSavedBoards] = useState<SavedLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gameName, setGameName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  useEffect(() => {
    fetchSavedLeaderboards();
  }, []);

  const fetchSavedLeaderboards = async () => {
    try {
      const { data, error } = await supabase
        .from("saved_leaderboards")
        .select("*")
        .order("saved_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Parse the players JSONB field
      const parsedData = (data || []).map((board: {
        id: string;
        game_name: string;
        saved_at: string;
        players: unknown;
        winner_name: string | null;
        winner_score: number | null;
      }) => ({
        id: board.id,
        game_name: board.game_name,
        saved_at: board.saved_at,
        players: Array.isArray(board.players) ? board.players as ActivePlayer[] : [],
        winner_name: board.winner_name,
        winner_score: board.winner_score,
      }));
      
      setSavedBoards(parsedData);
    } catch (error) {
      console.error("Error fetching saved leaderboards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCurrentLeaderboard = async () => {
    if (!gameName.trim() || currentPlayers.length === 0) return;

    setSaving(true);
    try {
      const sortedPlayers = [...currentPlayers].sort((a, b) => b.score - a.score);
      const winner = sortedPlayers[0];

      const { error } = await supabase.from("saved_leaderboards").insert([{
        session_id: sessionId,
        game_name: gameName.trim(),
        players: currentPlayers as unknown as import("@/integrations/supabase/types").Json,
        winner_name: winner?.player_name || null,
        winner_score: winner?.score || null,
      }]);

      if (error) throw error;

      setGameName("");
      setShowSaveForm(false);
      fetchSavedLeaderboards();
      
      // Reset leaderboard after saving
      onLeaderboardSaved?.();
    } catch (error) {
      console.error("Error saving leaderboard:", error);
      alert("Failed to save leaderboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            <h2 className="font-display font-bold text-lg sm:text-xl">Saved Results</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Save Current Button */}
        {currentPlayers.length > 0 && (
          <div className="p-3 sm:p-4 bg-amber-50 border-b">
            {showSaveForm ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder="Game name (e.g., Class 5A)"
                  className="flex-1"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveCurrentLeaderboard}
                    disabled={saving || !gameName.trim()}
                    className="flex-1 sm:flex-none"
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowSaveForm(false)} className="flex-1 sm:flex-none">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowSaveForm(true)}
                className="w-full gap-2 bg-amber-500 hover:bg-amber-600"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save Current Leaderboard</span>
                <span className="sm:hidden">Save</span>
                <span>({currentPlayers.length} players)</span>
              </Button>
            )}
          </div>
        )}

        {/* Saved Leaderboards List */}
        <div className="overflow-y-auto max-h-[50vh] sm:max-h-[60vh] p-3 sm:p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : savedBoards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No saved results yet</p>
              <p className="text-sm mt-1">Save your first game above!</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {savedBoards.map((board, index) => (
                <motion.div
                  key={board.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-bold text-base sm:text-lg truncate">
                        {board.game_name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{format(new Date(board.saved_at), "PP")}</span>
                      </div>
                    </div>
                    {board.winner_name && (
                      <div className="text-right flex-shrink-0">
                        <span className="text-xl sm:text-2xl">🏆</span>
                        <p className="text-xs sm:text-sm font-bold truncate max-w-[80px] sm:max-w-none">{board.winner_name}</p>
                        <p className="text-xs text-amber-600">{board.winner_score} pts</p>
                      </div>
                    )}
                  </div>

                  {/* Top 5 Players */}
                  <div className="space-y-1">
                    {board.players
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 5)
                      .map((player, idx) => (
                        <div
                          key={player.id}
                          className="flex items-center gap-2 text-xs sm:text-sm"
                        >
                          <span className="w-5 text-center flex-shrink-0">
                            {idx === 0
                              ? "🥇"
                              : idx === 1
                              ? "🥈"
                              : idx === 2
                              ? "🥉"
                              : `${idx + 1}.`}
                          </span>
                          <span className="flex-1 truncate">{player.player_name}</span>
                          <span className="font-bold text-amber-600 flex-shrink-0">{player.score}</span>
                        </div>
                      ))}
                    {board.players.length > 5 && (
                      <p className="text-xs text-gray-400 pl-7">
                        +{board.players.length - 5} more
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
