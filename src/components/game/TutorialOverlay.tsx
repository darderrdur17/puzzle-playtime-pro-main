import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, X, Puzzle, Target, Trophy, Lightbulb, RotateCw } from "lucide-react";
import elephantBg from "@/assets/elephant-puzzle-bg.png";

interface TutorialOverlayProps {
  onComplete: () => void;
  playerName: string;
}

const TUTORIAL_STEPS = [
  {
    icon: Puzzle,
    title: "Welcome to Elephant Puzzle! 🐘",
    description: "This is a jigsaw-style creativity game where you'll piece together quotes and phase titles to form the complete elephant puzzle.",
    image: true,
  },
  {
    icon: RotateCw,
    title: "Rotate Your Pieces 🔄",
    description: "Each piece starts rotated randomly. Click the 🔄 button on each piece to rotate it upright. A piece must show ✓ (green checkmark) before it can be placed!",
    tips: ["Click 🔄 to rotate 90° at a time", "Green ✓ means ready to place", "Orange 🔄 means needs rotation"],
  },
  {
    icon: Target,
    title: "Drag & Drop Pieces 🧩",
    description: "Once a piece is upright, drag it from the sidebar to the correct zone on the elephant. Each phase (Preparation, Incubation, Illumination, Verification) has its own section.",
    tips: ["Quotes go with their matching creativity phase", "Phase titles label each section"],
  },
  {
    icon: Lightbulb,
    title: "Hints & Help 💡",
    description: "Made a wrong placement? No worries! Click on any placed piece to remove it. After 2 wrong attempts, you'll get a hint showing the correct zone.",
    tips: ["Click pieces to remove them", "Watch for the yellow glow hint"],
  },
  {
    icon: Trophy,
    title: "Score Points & Win! 🏆",
    description: "Earn points for correct placements. Build streaks for bonus points! Complete the puzzle before time runs out to see the full picture reveal!",
    tips: ["Streaks multiply your points", "Faster completion = time bonus!"],
  },
];

export const TutorialOverlay = ({ onComplete, playerName }: TutorialOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = TUTORIAL_STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-400 to-sky-500 p-4 relative">
          <button
            onClick={handleSkip}
            className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <p className="text-sky-100 text-sm">Hey {playerName}! 👋</p>
          <h2 className="text-white font-display font-bold text-xl">How to Play</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Step icon and title */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
                  <StepIcon className="w-6 h-6 text-sky-600" />
                </div>
                <h3 className="text-lg font-display font-bold text-gray-800">{step.title}</h3>
              </div>

              {/* Image preview */}
              {step.image && (
                <div className="relative rounded-xl overflow-hidden shadow-lg border-4 border-sky-200">
                  <img 
                    src={elephantBg} 
                    alt="Elephant Puzzle Preview" 
                    className="w-full h-32 object-contain bg-gradient-to-b from-sky-300 to-sky-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">{step.description}</p>

              {/* Tips */}
              {step.tips && (
                <div className="bg-sky-50 rounded-xl p-3 space-y-2">
                  {step.tips.map((tip, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-sky-700">
                      <span className="w-5 h-5 rounded-full bg-sky-200 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      {tip}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 space-y-3">
          {/* Progress dots */}
          <div className="flex justify-center gap-2">
            {TUTORIAL_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep 
                    ? "bg-sky-500 w-6" 
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrev} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {currentStep === TUTORIAL_STEPS.length - 1 ? (
                <>Let's Play! 🎮</>
              ) : (
                <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </div>

          {currentStep === 0 && (
            <button
              onClick={handleSkip}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip tutorial
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
