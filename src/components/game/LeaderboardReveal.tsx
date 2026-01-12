import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Crown } from "lucide-react";
import { ActivePlayer } from "@/types/game";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";
import { PlayerAvatar } from "./AvatarSelector";

interface LeaderboardRevealProps {
  players: ActivePlayer[];
  currentPlayerId?: string;
  onComplete: () => void;
}

export const LeaderboardReveal = ({ players, currentPlayerId, onComplete }: LeaderboardRevealProps) => {
  const [stage, setStage] = useState<"countdown" | "timesup" | "third" | "second" | "first" | "full">("countdown");
  const [countdown, setCountdown] = useState(3);
  const { playSound } = useAudioFeedback();
  const soundsPlayed = useRef<Set<string>>(new Set());

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const top3 = sortedPlayers.slice(0, 3);

  // Play sounds based on stage
  useEffect(() => {
    if (soundsPlayed.current.has(stage)) return;
    
    switch (stage) {
      case "countdown":
        playSound("countdown");
        break;
      case "timesup":
        playSound("timesup");
        break;
      case "third":
      case "second":
        playSound("reveal");
        break;
      case "first":
        playSound("winner");
        setTimeout(() => playSound("applause"), 500);
        break;
    }
    soundsPlayed.current.add(stage);
  }, [stage, playSound]);

  useEffect(() => {
    // Initial countdown
    if (stage === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    
    if (stage === "countdown" && countdown === 0) {
      setStage("timesup");
    }
  }, [stage, countdown]);

  useEffect(() => {
    const timings = {
      timesup: 2000,
      third: 2500,
      second: 2500,
      first: 3000,
    };

    if (stage === "timesup") {
      const timer = setTimeout(() => setStage(top3.length >= 3 ? "third" : top3.length >= 2 ? "second" : "first"), timings.timesup);
      return () => clearTimeout(timer);
    }
    if (stage === "third") {
      const timer = setTimeout(() => setStage(top3.length >= 2 ? "second" : "first"), timings.third);
      return () => clearTimeout(timer);
    }
    if (stage === "second") {
      const timer = setTimeout(() => setStage("first"), timings.second);
      return () => clearTimeout(timer);
    }
    if (stage === "first") {
      const timer = setTimeout(() => setStage("full"), timings.first);
      return () => clearTimeout(timer);
    }
  }, [stage, top3.length]);

  const podiumColors = {
    first: "from-yellow-400 to-yellow-600",
    second: "from-gray-300 to-gray-500",
    third: "from-amber-600 to-amber-800",
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-sky-900 to-sky-950 flex items-center justify-center overflow-hidden">
      {/* Confetti particles */}
      <AnimatePresence>
        {(stage === "first" || stage === "full") && (
          <>
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: Math.random() * window.innerWidth, opacity: 1 }}
                animate={{ 
                  y: window.innerHeight + 20,
                  rotate: Math.random() * 720 - 360,
                }}
                transition={{ duration: 3 + Math.random() * 2, ease: "linear", delay: Math.random() * 0.5 }}
                className="absolute w-3 h-3 rounded-sm"
                style={{ 
                  backgroundColor: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"][Math.floor(Math.random() * 6)],
                  left: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Countdown */}
      <AnimatePresence mode="wait">
        {stage === "countdown" && countdown > 0 && (
          <motion.div
            key="countdown"
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-9xl font-display font-bold text-white"
          >
            {countdown}
          </motion.div>
        )}

        {/* Time's Up */}
        {stage === "timesup" && (
          <motion.div
            key="timesup"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-6xl md:text-8xl font-display font-bold text-white mb-4"
            >
              ⏰ Time's Up!
            </motion.div>
            <p className="text-2xl text-sky-200">Let's see who won...</p>
          </motion.div>
        )}

        {/* Podium reveals */}
        {(stage === "third" || stage === "second" || stage === "first" || stage === "full") && (
          <motion.div
            key="podium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-4xl px-4"
          >
            <motion.h2
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl md:text-5xl font-display font-bold text-white text-center mb-12"
            >
              <Trophy className="inline w-12 h-12 text-yellow-400 mr-3" />
              Leaderboard
            </motion.h2>

            {/* Podium */}
            <div className="flex items-end justify-center gap-4 md:gap-8 mb-12">
              {/* 2nd Place */}
              <AnimatePresence>
                {(stage === "second" || stage === "first" || stage === "full") && top3[1] && (
                  <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    className="text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className={`mx-auto mb-2 ${top3[1].id === currentPlayerId ? 'ring-4 ring-white rounded-full' : ''}`}
                    >
                      <PlayerAvatar
                        type={(top3[1].avatar_type as "initial" | "preset" | "custom") || "initial"}
                        value={top3[1].avatar_value || null}
                        playerName={top3[1].player_name}
                        size="lg"
                        className="shadow-xl"
                      />
                    </motion.div>
                    <p className="text-white font-bold text-lg truncate max-w-[100px]">{top3[1].player_name}</p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-2xl md:text-3xl font-display font-bold text-yellow-400"
                    >
                      {top3[1].score}
                    </motion.p>
                    <div className={`h-32 md:h-40 w-24 md:w-32 bg-gradient-to-b ${podiumColors.second} rounded-t-lg mt-2 flex items-center justify-center`}>
                      <span className="text-5xl md:text-6xl">🥈</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 1st Place */}
              <AnimatePresence>
                {(stage === "first" || stage === "full") && top3[0] && (
                  <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.5 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      <Crown className="w-10 h-10 text-yellow-400 mx-auto mb-1" />
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
                      transition={{ delay: 0.3, rotate: { repeat: 2, duration: 0.3 } }}
                      className={`mx-auto mb-2 ${top3[0].id === currentPlayerId ? 'ring-4 ring-white rounded-full' : ''}`}
                    >
                      <PlayerAvatar
                        type={(top3[0].avatar_type as "initial" | "preset" | "custom") || "initial"}
                        value={top3[0].avatar_value || null}
                        playerName={top3[0].player_name}
                        size="xl"
                        className="shadow-2xl"
                      />
                    </motion.div>
                    <p className="text-white font-bold text-xl truncate max-w-[120px]">{top3[0].player_name}</p>
                    <motion.p
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: [1, 1.2, 1] }}
                      transition={{ delay: 0.5 }}
                      className="text-3xl md:text-4xl font-display font-bold text-yellow-400"
                    >
                      {top3[0].score}
                    </motion.p>
                    <div className={`h-40 md:h-52 w-28 md:w-36 bg-gradient-to-b ${podiumColors.first} rounded-t-lg mt-2 flex items-center justify-center`}>
                      <span className="text-6xl md:text-7xl">🥇</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 3rd Place */}
              <AnimatePresence>
                {(stage === "third" || stage === "second" || stage === "first" || stage === "full") && top3[2] && (
                  <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    className="text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className={`mx-auto mb-2 ${top3[2].id === currentPlayerId ? 'ring-4 ring-white rounded-full' : ''}`}
                    >
                      <PlayerAvatar
                        type={(top3[2].avatar_type as "initial" | "preset" | "custom") || "initial"}
                        value={top3[2].avatar_value || null}
                        playerName={top3[2].player_name}
                        size="md"
                        className="shadow-xl"
                      />
                    </motion.div>
                    <p className="text-white font-bold truncate max-w-[90px]">{top3[2].player_name}</p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-xl md:text-2xl font-display font-bold text-yellow-400"
                    >
                      {top3[2].score}
                    </motion.p>
                    <div className={`h-24 md:h-28 w-20 md:w-28 bg-gradient-to-b ${podiumColors.third} rounded-t-lg mt-2 flex items-center justify-center`}>
                      <span className="text-4xl md:text-5xl">🥉</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Full leaderboard */}
            <AnimatePresence>
              {stage === "full" && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 max-h-48 overflow-y-auto"
                >
                  {sortedPlayers.slice(3).map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className={`flex items-center gap-3 p-2 rounded-lg mb-1 ${
                        player.id === currentPlayerId ? "bg-white/20" : ""
                      }`}
                    >
                      <span className="text-white font-bold w-8">{index + 4}.</span>
                      <span className="text-white flex-1 truncate">{player.player_name}</span>
                      <span className="text-yellow-400 font-bold">{player.score}</span>
                    </motion.div>
                  ))}
                  
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    onClick={onComplete}
                    className="w-full mt-4 py-3 bg-white text-sky-900 font-bold rounded-xl hover:bg-sky-100 transition-colors"
                  >
                    Continue
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
