import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Users, Zap, MessageSquare, Trash2, Settings, Clock, StopCircle, Trophy, RefreshCw, QrCode, Copy, Check, Gauge, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGameSession } from "@/hooks/useGameSession";
import { Leaderboard } from "@/components/game/Leaderboard";
import { Timer } from "@/components/game/Timer";
import { SavedLeaderboards } from "@/components/game/SavedLeaderboards";
import { Helmet } from "react-helmet-async";
import { QRCodeSVG } from "qrcode.react";
import { Difficulty, DIFFICULTY_CONFIG } from "@/types/game";

const TIMER_PRESETS = [
  { label: "2 min", seconds: 120 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "15 min", seconds: 900 },
];

const GameMaster = () => {
  const {
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
  } = useGameSession();

  const [hintText, setHintText] = useState("");
  const [customMinutes, setCustomMinutes] = useState("");
  const [showSavedLeaderboards, setShowSavedLeaderboards] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [useCustomSettings, setUseCustomSettings] = useState(false);
  const [customQuotesCount, setCustomQuotesCount] = useState("12");
  const [customTimerMinutes, setCustomTimerMinutes] = useState("10");

  const playUrl = `${window.location.origin}/play`;

  const copyLink = () => {
    navigator.clipboard.writeText(playUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl font-display">Loading...</div>
      </div>
    );
  }

  const handleSendHint = () => {
    if (hintText.trim()) {
      sendHint(hintText);
      setHintText("");
    }
  };

  const handleSetTimer = (seconds: number) => {
    setTimer(seconds);
  };

  const handleCustomTimer = () => {
    const minutes = parseInt(customMinutes);
    if (minutes > 0 && minutes <= 60) {
      setTimer(minutes * 60);
      setCustomMinutes("");
    }
  };

  return (
    <>
      <Helmet>
        <title>Game Master | Elephant Puzzle</title>
        <meta name="description" content="Control the Elephant Puzzle game for your classroom" />
      </Helmet>

      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                🎮 Game Master
              </h1>
              <p className="text-muted-foreground mt-1">Control the Elephant Puzzle game</p>
            </div>

            <div className="flex items-center gap-3">
              {session?.is_active && session?.timer_started_at && (
                <Timer 
                  timerSeconds={session.timer_seconds} 
                  timerStartedAt={session.timer_started_at}
                />
              )}
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                session?.is_active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {session?.is_active ? "🟢 Game Active" : "⚪ Game Stopped"}
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{players.length}</span>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Controls */}
            <div className="md:col-span-2 space-y-4">
              {/* Difficulty Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-lg flex items-center gap-2">
                    <Gauge className="w-5 h-5" /> Difficulty Level
                  </h2>
                  <Button
                    variant={useCustomSettings ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseCustomSettings(!useCustomSettings)}
                    disabled={session?.is_active}
                    className="gap-2"
                  >
                    <Sliders className="w-4 h-4" />
                    {useCustomSettings ? "Using Custom" : "Custom"}
                  </Button>
                </div>

                {!useCustomSettings ? (
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((diff) => {
                      const config = DIFFICULTY_CONFIG[diff];
                      const isSelected = (session?.difficulty || 'medium') === diff;
                      
                      return (
                        <motion.button
                          key={diff}
                          onClick={() => setDifficulty(diff)}
                          disabled={session?.is_active}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected 
                              ? "border-primary bg-primary/10 shadow-lg" 
                              : "border-border bg-card hover:border-primary/50"
                          } ${session?.is_active ? "opacity-50 cursor-not-allowed" : ""}`}
                          whileHover={!session?.is_active ? { scale: 1.02 } : {}}
                          whileTap={!session?.is_active ? { scale: 0.98 } : {}}
                        >
                          <div className="text-2xl mb-2">{config.icon}</div>
                          <div className="font-bold">{config.label}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {config.description}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4 bg-muted/50 rounded-xl p-4 border-2 border-dashed border-primary/30">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Sliders className="w-4 h-4" />
                      <span>Custom Game Settings</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Number of Quotes</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={customQuotesCount}
                            onChange={(e) => setCustomQuotesCount(e.target.value)}
                            min={4}
                            max={quotes.length || 100}
                            disabled={session?.is_active}
                            className="w-24"
                          />
                          <span className="text-xs text-muted-foreground">
                            (max {quotes.length})
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Timer (minutes)</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={customTimerMinutes}
                            onChange={(e) => setCustomTimerMinutes(e.target.value)}
                            min={1}
                            max={60}
                            disabled={session?.is_active}
                            className="w-24"
                          />
                          <span className="text-xs text-muted-foreground">min</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => {
                        const qCount = parseInt(customQuotesCount) || 12;
                        const tMin = parseInt(customTimerMinutes) || 10;
                        setCustomSettings(qCount, tMin);
                      }}
                      disabled={session?.is_active}
                      className="w-full"
                    >
                      Apply Custom Settings
                    </Button>
                  </div>
                )}
                
                <div className="mt-3 text-xs text-muted-foreground text-center">
                  Available quotes: {quotes.length} | Current timer: {Math.floor((session?.timer_seconds || 600) / 60)} min
                </div>
              </motion.div>

              {/* Timer Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" /> Game Timer
                </h2>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {TIMER_PRESETS.map((preset) => (
                      <Button
                        key={preset.seconds}
                        variant={session?.timer_seconds === preset.seconds ? "default" : "outline"}
                        onClick={() => handleSetTimer(preset.seconds)}
                        disabled={session?.is_active}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>

                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Custom (minutes)"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      className="w-40"
                      min={1}
                      max={60}
                      disabled={session?.is_active}
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleCustomTimer}
                      disabled={session?.is_active || !customMinutes}
                    >
                      Set
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Current: {Math.floor((session?.timer_seconds || 600) / 60)} min
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Main Controls */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" /> Game Controls
                </h2>

                <div className="flex flex-wrap gap-3">
                  {session?.is_active ? (
                    <>
                      <Button onClick={stopGame} variant="outline" size="lg">
                        <Square className="w-4 h-4 mr-2" /> Pause Game
                      </Button>
                      <Button onClick={endGame} variant="destructive" size="lg">
                        <StopCircle className="w-4 h-4 mr-2" /> End Game
                      </Button>
                    </>
                  ) : (
                    <Button onClick={startGame} size="lg" className="bg-accent hover:bg-accent/90">
                      <Play className="w-4 h-4 mr-2" /> Start Game
                    </Button>
                  )}

                  <Button
                    onClick={toggleDoublePoints}
                    variant={session?.double_points_active ? "default" : "outline"}
                    size="lg"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {session?.double_points_active ? "🔥 Double Points ON" : "Double Points"}
                  </Button>

                  <Button onClick={clearPlayers} variant="outline" size="lg">
                    <Trash2 className="w-4 h-4 mr-2" /> Clear Players
                  </Button>

                  <Button onClick={resetLeaderboard} variant="outline" size="lg">
                    <RefreshCw className="w-4 h-4 mr-2" /> New Game
                  </Button>
                </div>
              </motion.div>

              {/* Hint Sender */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" /> Send Hint
                </h2>
                <div className="flex gap-3">
                  <Input
                    value={hintText}
                    onChange={(e) => setHintText(e.target.value)}
                    placeholder="Type a hint for all players..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleSendHint()}
                  />
                  <Button onClick={handleSendHint}>Send</Button>
                </div>
              </motion.div>
            </div>

            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <Leaderboard players={players} />
              
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => setShowSavedLeaderboards(true)}
              >
                <Trophy className="w-4 h-4" />
                View Saved Leaderboards
              </Button>
            </motion.div>
          </div>

          {/* QR Code & Share Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="gap-2"
                >
                  <QrCode className="w-5 h-5" />
                  {showQRCode ? "Hide QR Code" : "Show QR Code"}
                </Button>
                
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Join link:</span>
                  <code className="font-mono bg-muted px-3 py-1.5 rounded text-sm">
                    {playUrl}
                  </code>
                  <Button variant="ghost" size="icon" onClick={copyLink}>
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showQRCode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 flex flex-col items-center"
                >
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    <QRCodeSVG 
                      value={playUrl} 
                      size={200}
                      level="H"
                      includeMargin
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Scan with phone camera to join the game!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Saved Leaderboards Modal */}
      <AnimatePresence>
        {showSavedLeaderboards && (
          <SavedLeaderboards
            currentPlayers={players}
            sessionId={session?.id || null}
            onClose={() => setShowSavedLeaderboards(false)}
            onLeaderboardSaved={() => {
              resetLeaderboard();
              setShowSavedLeaderboards(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default GameMaster;
