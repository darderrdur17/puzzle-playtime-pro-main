import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";
import { ActivePlayer } from "@/types/game";

interface LeaderboardProps {
  players: ActivePlayer[];
  currentPlayerId?: string;
}

export const Leaderboard = ({ players, currentPlayerId }: LeaderboardProps) => {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="font-display font-bold text-lg">Leaderboard</h3>
      </div>

      <div className="space-y-2">
        {players.slice(0, 10).map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-3 p-2 rounded-lg ${
              player.id === currentPlayerId ? "bg-primary/20 border border-primary" : "bg-muted/50"
            }`}
          >
            <div className="w-6 text-center font-bold">
              {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`}
            </div>
            <div className="flex-1 truncate font-medium">{player.player_name}</div>
            <div className="font-display font-bold text-primary">{player.score}</div>
            {player.streak >= 3 && (
              <span className="text-xs bg-streak/20 text-streak px-2 py-0.5 rounded-full">
                🔥 {player.streak}
              </span>
            )}
          </motion.div>
        ))}

        {players.length === 0 && (
          <p className="text-center text-muted-foreground py-4">No players yet</p>
        )}
      </div>
    </div>
  );
};
