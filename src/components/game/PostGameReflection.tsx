import { motion } from "framer-motion";
import { MessageSquare, Lightbulb, Target, Zap } from "lucide-react";
import { GameState, Phase, PHASE_CONFIG } from "@/types/game";
import { Button } from "@/components/ui/button";

interface PostGameReflectionProps {
  playerName: string;
  gameState: GameState;
  onContinue: () => void;
}

const REFLECTION_PROMPTS: Record<Phase, string[]> = {
  preparation: [
    "What resources did you find most helpful during the preparation phase?",
    "How do you typically gather information before starting a creative project?",
    "What surprised you about the quotes in the Preparation phase?",
  ],
  incubation: [
    "How do you give your mind space to incubate ideas?",
    "Do you find stepping away from a problem helps you solve it?",
    "What activities help you let ideas simmer subconsciously?",
  ],
  illumination: [
    "Can you recall a 'Eureka!' moment in your own life?",
    "What conditions seem to trigger your best insights?",
    "How do you recognize when you've had a breakthrough?",
  ],
  verification: [
    "How do you typically test and refine your ideas?",
    "What role does feedback play in your creative process?",
    "How do you know when an idea is ready to share?",
  ],
};

const GENERAL_PROMPTS = [
  "Which phase of creativity do you find most challenging?",
  "How might understanding these phases help your future creative work?",
  "What new insight did you gain about the creative process today?",
  "How can you apply these phases to a current project?",
  "Which quote resonated with you the most and why?",
];

export const PostGameReflection = ({
  playerName,
  gameState,
  onContinue,
}: PostGameReflectionProps) => {
  // Determine which phase the player struggled with most
  const getMostChallengingPhase = (): Phase => {
    // Simple heuristic based on wrong attempts
    const phases: Phase[] = ["preparation", "incubation", "illumination", "verification"];
    return phases[Math.floor(Math.random() * phases.length)];
  };

  const challengingPhase = getMostChallengingPhase();
  const phasePrompts = REFLECTION_PROMPTS[challengingPhase];
  const selectedPhasePrompt = phasePrompts[Math.floor(Math.random() * phasePrompts.length)];
  const selectedGeneralPrompt = GENERAL_PROMPTS[Math.floor(Math.random() * GENERAL_PROMPTS.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
          <Lightbulb className="w-5 h-5 text-primary" />
          <span className="font-semibold text-primary">Reflection Time</span>
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">
          Great work, {playerName}! 🎉
        </h2>
        <p className="text-muted-foreground">
          Take a moment to reflect on what you've learned about creativity.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 bg-card rounded-xl p-4 border">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{gameState.score}</div>
          <div className="text-xs text-muted-foreground">Points</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-500">{gameState.streak}</div>
          <div className="text-xs text-muted-foreground">Best Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500">{gameState.wrongAttempts}</div>
          <div className="text-xs text-muted-foreground">Mistakes</div>
        </div>
      </div>

      {/* Reflection Cards */}
      <div className="space-y-4">
        {/* Phase-specific reflection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-4 border"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                Focus on {PHASE_CONFIG[challengingPhase].title}
              </h3>
              <p className="text-sm text-muted-foreground">{selectedPhasePrompt}</p>
            </div>
          </div>
        </motion.div>

        {/* General reflection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-accent/5 to-secondary/20 rounded-xl p-4 border"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <MessageSquare className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Discussion Prompt</h3>
              <p className="text-sm text-muted-foreground">{selectedGeneralPrompt}</p>
            </div>
          </div>
        </motion.div>

        {/* Key insight */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Key Insight</h3>
              <p className="text-sm text-muted-foreground">
                Creativity isn't just one moment of inspiration—it's a process with distinct phases. 
                Understanding these phases can help you become more intentionally creative!
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Continue Button */}
      <Button onClick={onContinue} className="w-full" size="lg">
        View Leaderboard
      </Button>
    </motion.div>
  );
};
