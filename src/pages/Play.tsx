import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { usePlayerGame } from "@/hooks/usePlayerGame";
import { ElephantPuzzle } from "@/components/game/ElephantPuzzle";
import { DraggableItem } from "@/components/game/DraggableItem";
import { Timer } from "@/components/game/Timer";
import { ElapsedTimer } from "@/components/game/ElapsedTimer";
import { Leaderboard } from "@/components/game/Leaderboard";
import { LeaderboardReveal } from "@/components/game/LeaderboardReveal";
import { PostGameReflection } from "@/components/game/PostGameReflection";
import { AvatarSelector, PlayerAvatar } from "@/components/game/AvatarSelector";
import { TutorialOverlay } from "@/components/game/TutorialOverlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phase, PHASE_TITLES, Quote, PhaseTitle } from "@/types/game";
import { Sparkles, UserCircle, HelpCircle } from "lucide-react";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";
import { useConfetti } from "@/hooks/useConfetti";

const WRONG_ATTEMPTS_FOR_HINT = 2;

const Play = () => {
  const {
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
    handleTimeUp,
  } = usePlayerGame();

  const [playerName, setPlayerName] = useState("");
  const [avatarType, setAvatarType] = useState<"initial" | "preset" | "custom">("initial");
  const [avatarValue, setAvatarValue] = useState<string | null>(null);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [draggedQuote, setDraggedQuote] = useState<Quote | null>(null);
  const [draggedTitle, setDraggedTitle] = useState<PhaseTitle | null>(null);
  const [highlightedZone, setHighlightedZone] = useState<Phase | null>(null);
  const [hintZone, setHintZone] = useState<Phase | null>(null);
  const [availableQuotes, setAvailableQuotes] = useState<Quote[]>([]);
  const [availableTitles, setAvailableTitles] = useState<PhaseTitle[]>([]);
  const [placedQuotes, setPlacedQuotes] = useState<Record<Phase, Quote[]>>({
    preparation: [], incubation: [], illumination: [], verification: [],
  });
  const [placedTitles, setPlacedTitles] = useState<Record<Phase, PhaseTitle | null>>({
    preparation: null, incubation: null, illumination: null, verification: null,
  });
  const [showReflection, setShowReflection] = useState(true);
  const [itemWrongAttempts, setItemWrongAttempts] = useState<Record<string, number>>({});
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    return localStorage.getItem("elephant-puzzle-tutorial-seen") === "true";
  });
  const [elapsedTime, setElapsedTime] = useState(0);
  const remainingTimeRef = useRef<number>(0);

  const { playSound } = useAudioFeedback();
  const { fireCompletion, fireSuccess } = useConfetti();

  // Initialize quotes
  useEffect(() => {
    if (quotes.length > 0 && availableQuotes.length === 0) {
      setAvailableQuotes([...quotes]);
    }
  }, [quotes, availableQuotes.length]);

  // Initialize titles
  useEffect(() => {
    if (availableTitles.length === 0) {
      setAvailableTitles([...PHASE_TITLES]);
    }
  }, [availableTitles.length]);

  // Show tutorial for first-time players after joining
  useEffect(() => {
    if (player && !hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, [player, hasSeenTutorial]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
    localStorage.setItem("elephant-puzzle-tutorial-seen", "true");
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      const success = await joinGame(playerName.trim(), avatarType, avatarValue);
      if (success) {
        setAvailableQuotes([...quotes]);
      }
    }
  };

  const handleAvatarSelect = (type: "initial" | "preset" | "custom", value: string | null) => {
    setAvatarType(type);
    setAvatarValue(value);
  };

  // Remove quote from a phase and return to available pool
  const handleRemoveQuote = useCallback((quote: Quote, fromPhase: Phase) => {
    setPlacedQuotes((prev) => ({
      ...prev,
      [fromPhase]: prev[fromPhase].filter((q) => q.id !== quote.id),
    }));
    setAvailableQuotes((prev) => [...prev, quote]);
  }, []);

  // Remove title from a phase and return to available pool
  const handleRemoveTitle = useCallback((title: PhaseTitle, fromPhase: Phase) => {
    setPlacedTitles((prev) => ({ ...prev, [fromPhase]: null }));
    setAvailableTitles((prev) => [...prev, title]);
  }, []);

  const handleDrop = useCallback(async (phase: Phase) => {
    setHintZone(null);
    playSound("drop");
    
    if (draggedTitle) {
      const isCorrect = phase === draggedTitle.phase;
      
      if (isCorrect) {
        playSound("snap");
        fireSuccess();
        placeTitle(draggedTitle.id, phase);
        setAvailableTitles((prev) => prev.filter((t) => t.id !== draggedTitle.id));
        setPlacedTitles((prev) => ({ ...prev, [phase]: draggedTitle }));
        setItemWrongAttempts((prev) => ({ ...prev, [draggedTitle.id]: 0 }));
        setDraggedTitle(null);
      } else {
        const currentAttempts = (itemWrongAttempts[draggedTitle.id] || 0) + 1;
        setItemWrongAttempts((prev) => ({ ...prev, [draggedTitle.id]: currentAttempts }));
        
        placeTitle(draggedTitle.id, phase);
        
        if (currentAttempts >= WRONG_ATTEMPTS_FOR_HINT) {
          setHintZone(draggedTitle.phase);
          setTimeout(() => setHintZone(null), 3000);
        }
      }
    } else if (draggedQuote) {
      const isCorrect = phase === draggedQuote.phase;
      
      if (isCorrect) {
        playSound("snap");
        fireSuccess();
        placeQuote(draggedQuote.id, phase, draggedQuote.phase);
        setAvailableQuotes((prev) => prev.filter((q) => q.id !== draggedQuote.id));
        setPlacedQuotes((prev) => ({
          ...prev,
          [phase]: [...prev[phase], draggedQuote],
        }));
        setItemWrongAttempts((prev) => ({ ...prev, [draggedQuote.id]: 0 }));
        setDraggedQuote(null);
      } else {
        const currentAttempts = (itemWrongAttempts[draggedQuote.id] || 0) + 1;
        setItemWrongAttempts((prev) => ({ ...prev, [draggedQuote.id]: currentAttempts }));
        
        placeQuote(draggedQuote.id, phase, draggedQuote.phase);
        
        if (currentAttempts >= WRONG_ATTEMPTS_FOR_HINT) {
          setHintZone(draggedQuote.phase);
          setTimeout(() => setHintZone(null), 3000);
        }
      }
    }
    setHighlightedZone(null);

    // Check completion
    const totalPlaced = Object.values(placedQuotes).flat().length + 
      Object.values(placedTitles).filter(Boolean).length + 1;
    if (totalPlaced >= quotes.length + PHASE_TITLES.length) {
      fireCompletion();
      playSound("complete");
      completeGame(remainingTimeRef.current);
    }
  }, [draggedQuote, draggedTitle, placeQuote, placeTitle, placedQuotes, placedTitles, quotes.length, completeGame, itemWrongAttempts, playSound, fireSuccess, fireCompletion]);

  // Update remaining time from Timer
  const handleRemainingTimeChange = useCallback((remaining: number) => {
    remainingTimeRef.current = remaining;
  }, []);

  const handleTouchDrop = useCallback((phase: Phase) => {
    handleDrop(phase);
  }, [handleDrop]);

  // Show leaderboard reveal animation
  if (showLeaderboardReveal) {
    return (
      <LeaderboardReveal
        players={leaderboard}
        currentPlayerId={player?.id}
        onComplete={() => setShowLeaderboardReveal(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 to-sky-200">
        <div className="animate-pulse text-xl font-display text-sky-800">Loading...</div>
      </div>
    );
  }

  // Waiting for game to start
  if (!session?.is_active && !player) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-sky-100 to-sky-200">
        <Helmet>
          <title>Elephant Puzzle | Waiting for Game</title>
        </Helmet>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center shadow-xl"
        >
          <div className="text-6xl mb-4 animate-bounce">🐘</div>
          <h1 className="text-2xl font-display font-bold mb-2 text-sky-800">Elephant Puzzle</h1>
          <p className="text-sky-600 mb-6">Waiting for the Game Master to start...</p>
          <div className="animate-pulse text-primary">Please wait...</div>
        </motion.div>
      </div>
    );
  }

  // Join screen
  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-sky-100 to-sky-200">
        <Helmet>
          <title>Join Game | Elephant Puzzle</title>
        </Helmet>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-xl"
        >
          <div className="text-center mb-6">
            <button 
              onClick={() => setShowAvatarSelector(true)}
              className="relative group"
            >
              <PlayerAvatar
                type={avatarType}
                value={avatarValue}
                playerName={playerName || "?"}
                size="xl"
                className="mx-auto transition-transform group-hover:scale-105"
              />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-sky-600" />
              </div>
            </button>
            <p className="text-xs text-sky-500 mt-2">Click to customize avatar</p>
            <h1 className="text-2xl font-display font-bold text-sky-800 mt-3">Join the Game!</h1>
            <p className="text-sky-600">Enter your name to start playing</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your name"
              className="text-center text-lg"
              autoFocus
            />
            <Button type="submit" className="w-full" size="lg">
              Start Playing!
            </Button>
          </form>
        </motion.div>

        <AnimatePresence>
          {showAvatarSelector && (
            <AvatarSelector
              selectedType={avatarType}
              selectedValue={avatarValue}
              playerName={playerName || "Player"}
              onSelect={handleAvatarSelect}
              onClose={() => setShowAvatarSelector(false)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Completed screen with reflection
  if (gameState.isCompleted && !showLeaderboardReveal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-sky-100 to-sky-200">
        <Helmet>
          <title>Complete! | Elephant Puzzle</title>
        </Helmet>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-xl"
        >
          {showReflection ? (
            <PostGameReflection
              playerName={player.player_name}
              gameState={gameState}
              onContinue={() => setShowReflection(false)}
            />
          ) : (
            <div className="text-center">
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-display font-bold mb-2">🎉 Puzzle Complete!</h1>
              
              {/* Score Breakdown */}
              <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl p-4 my-6 border border-sky-200">
                <div className="text-5xl font-display font-bold text-primary mb-3">
                  {gameState.score} pts
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between items-center px-4 py-1.5 bg-white/60 rounded-lg">
                    <span className="text-muted-foreground">🎯 Base Score</span>
                    <span className="font-semibold">{gameState.baseScore} pts</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-1.5 bg-white/60 rounded-lg">
                    <span className="text-muted-foreground">⏱️ Time Bonus</span>
                    <span className={`font-semibold ${gameState.timeBonus > 0 ? 'text-green-600' : ''}`}>
                      +{gameState.timeBonus} pts
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-muted-foreground mb-6">
                <p>🔥 Best streak: {gameState.streak}</p>
                <p>❌ Wrong attempts: {gameState.wrongAttempts}</p>
                <p>⏱️ Time: {Math.floor(gameState.elapsedTime / 60)}:{(gameState.elapsedTime % 60).toString().padStart(2, '0')}</p>
              </div>
              <Leaderboard players={leaderboard} currentPlayerId={player.id} />
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Main game screen
  return (
    <>
      <Helmet>
        <title>Playing | Elephant Puzzle</title>
      </Helmet>

      <div className="min-h-screen p-2 md:p-4 bg-gradient-to-b from-sky-100 to-sky-200">
        <div className="max-w-7xl mx-auto space-y-3 md:space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-xl p-2 md:p-3 shadow-md">
            <div>
              <h1 className="text-lg md:text-xl font-display font-bold text-sky-800">
                Creativity is... 🐘
              </h1>
              <p className="text-xs md:text-sm text-sky-600">
                Hi {player.player_name}! Drag quotes to phases. Click to remove.
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setShowTutorial(true)}
                className="p-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-600 transition-colors"
                title="How to play"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <div className="bg-white rounded-lg px-2 md:px-3 py-1 shadow">
                <span className="font-display font-bold text-primary">{gameState.score}</span>
                <span className="text-xs text-muted-foreground ml-1">pts</span>
              </div>
              {gameState.streak >= 3 && (
                <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                  🔥 {gameState.streak}
                </div>
              )}
              {session && (
                <Timer 
                  timerSeconds={session.timer_seconds} 
                  timerStartedAt={session.timer_started_at}
                  isCompleted={gameState.isCompleted}
                  onTimeUp={handleTimeUp}
                  onRemainingChange={handleRemainingTimeChange}
                />
              )}
              {gameState.isStarted && (
                <ElapsedTimer 
                  startTime={gameState.startTime}
                  isCompleted={gameState.isCompleted}
                  onElapsedChange={setElapsedTime}
                />
              )}
            </div>
          </div>

          {/* Hint display */}
          {session?.current_hint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-center"
            >
              <span className="text-yellow-800">💡 Hint: {session.current_hint}</span>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-4 gap-3 md:gap-4">
            {/* Puzzle - Full width on mobile */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <ElephantPuzzle
                placedQuotes={placedQuotes}
                placedTitles={placedTitles}
                onDrop={handleDrop}
                onDragOver={(e, phase) => {
                  if ('preventDefault' in e) e.preventDefault();
                  setHighlightedZone(phase);
                }}
                onTouchDrop={handleTouchDrop}
                highlightedZone={highlightedZone}
                hintZone={hintZone}
                onRemoveQuote={handleRemoveQuote}
                onRemoveTitle={handleRemoveTitle}
                totalQuotes={quotes.length}
                onPieceSnap={(phase) => playSound("snap")}
              />
            </div>

            {/* Sidebar - Draggable items */}
            <div className="order-1 lg:order-2 lg:space-y-4 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 lg:max-h-[70vh] lg:overflow-y-auto">
              {/* Titles */}
              {availableTitles.length > 0 && (
                <div className="bg-gradient-to-br from-orange-50/90 to-amber-50/90 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-md flex-shrink-0 min-w-[160px] lg:min-w-0 border-2 border-dashed border-orange-300">
                  <h3 className="font-display font-bold text-sm mb-2 text-sky-800 flex items-center gap-2">
                    📝 Phase Titles ({availableTitles.length})
                  </h3>
                  <div className="flex flex-wrap lg:flex-col gap-2">
                    {availableTitles.map((title) => (
                      <DraggableItem
                        key={title.id}
                        id={title.id}
                        onDragStart={() => { playSound("pickup"); setDraggedTitle(title); }}
                        onDragEnd={() => { setDraggedTitle(null); setHighlightedZone(null); }}
                        className="bg-white rounded-lg px-3 py-2 shadow-sm border-2 border-orange-200 hover:border-orange-400 transition-colors"
                      >
                        <span className="font-display font-bold text-sm text-gray-700">
                          {title.title}
                        </span>
                      </DraggableItem>
                    ))}
                  </div>
                </div>
              )}

              {/* Quotes */}
              <div className="bg-gradient-to-br from-sky-50/90 to-blue-50/90 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-md flex-1 min-w-[220px] lg:min-w-0 border-2 border-dashed border-sky-300">
                <h3 className="font-display font-bold text-sm mb-2 text-sky-800 flex items-center gap-2">
                  💬 Quotes ({availableQuotes.length})
                </h3>
                <div className="flex flex-wrap lg:grid lg:grid-cols-1 gap-2 lg:max-h-[50vh] lg:overflow-y-auto pr-1">
                  {availableQuotes.map((quote) => (
                    <DraggableItem
                      key={quote.id}
                      id={quote.id}
                      onDragStart={() => { playSound("pickup"); setDraggedQuote(quote); }}
                      onDragEnd={() => { setDraggedQuote(null); setHighlightedZone(null); }}
                      className="bg-white rounded-lg p-3 shadow-sm border-2 border-sky-200 hover:border-sky-400 transition-colors min-w-[180px] lg:min-w-0"
                    >
                      <p className="text-xs text-gray-700 line-clamp-2 italic">
                        "{quote.text.substring(0, 60)}..."
                      </p>
                      <p className="text-[10px] text-sky-600 mt-1 font-medium truncate">
                        — {quote.author}
                      </p>
                    </DraggableItem>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorial Overlay */}
      <AnimatePresence>
        {showTutorial && (
          <TutorialOverlay
            onComplete={handleTutorialComplete}
            playerName={player.player_name}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Play;
