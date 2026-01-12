import { motion, AnimatePresence } from "framer-motion";
import { Phase, PHASE_CONFIG, Quote, PhaseTitle, PHASE_TITLES } from "@/types/game";
import elephantBg from "@/assets/elephant-puzzle-bg.png";
import { useEffect, useState, useCallback } from "react";

interface ElephantPuzzleProps {
  placedQuotes: Record<Phase, Quote[]>;
  placedTitles: Record<Phase, PhaseTitle | null>;
  onDrop: (phase: Phase) => void;
  onDragOver: (e: React.DragEvent | React.TouchEvent, phase: Phase) => void;
  onTouchDrop?: (phase: Phase) => void;
  highlightedZone: Phase | null;
  hintZone?: Phase | null;
  onRemoveQuote?: (quote: Quote, fromPhase: Phase) => void;
  onRemoveTitle?: (title: PhaseTitle, fromPhase: Phase) => void;
  totalQuotes?: number;
  onPieceSnap?: (phase: Phase) => void;
  onConnectionMade?: (fromPhase: Phase, toPhase: Phase) => void;
}

// Positions aligned with elephant body sections - elephant faces left (head on right)
// Preparation: rear/tail area (left), Incubation: back body, Illumination: front body, Verification: head/trunk
const PHASE_ZONES: Record<Phase, { 
  label: { top: string; left: string };
  zone: { top: string; left: string; width: string; height: string };
}> = {
  preparation: { 
    label: { top: "18%", left: "5%" },
    zone: { top: "28%", left: "2%", width: "20%", height: "45%" }
  },
  incubation: { 
    label: { top: "15%", left: "24%" },
    zone: { top: "25%", left: "23%", width: "22%", height: "48%" }
  },
  illumination: { 
    label: { top: "12%", left: "48%" },
    zone: { top: "22%", left: "46%", width: "22%", height: "50%" }
  },
  verification: { 
    label: { top: "8%", left: "72%" },
    zone: { top: "18%", left: "69%", width: "28%", height: "55%" }
  },
};

const PHASE_COLORS: Record<Phase, { bg: string; border: string; text: string; labelColor: string; borderHex: string }> = {
  preparation: { bg: "bg-orange-100/30", border: "border-orange-300/60", text: "text-orange-700", labelColor: "text-orange-600", borderHex: "rgba(251, 146, 60, 0.5)" },
  incubation: { bg: "bg-blue-100/30", border: "border-blue-300/60", text: "text-blue-700", labelColor: "text-blue-600", borderHex: "rgba(96, 165, 250, 0.5)" },
  illumination: { bg: "bg-yellow-100/30", border: "border-yellow-300/60", text: "text-yellow-700", labelColor: "text-yellow-600", borderHex: "rgba(250, 204, 21, 0.5)" },
  verification: { bg: "bg-green-100/30", border: "border-green-300/60", text: "text-green-700", labelColor: "text-green-600", borderHex: "rgba(74, 222, 128, 0.5)" },
};

const PHASE_LABELS: Record<Phase, string> = {
  preparation: "Preparation",
  incubation: "Incubation", 
  illumination: "Illumination",
  verification: "Verification",
};

export const ElephantPuzzle = ({
  placedQuotes,
  placedTitles,
  onDrop,
  onDragOver,
  onTouchDrop,
  highlightedZone,
  hintZone,
  onRemoveQuote,
  onRemoveTitle,
  totalQuotes = 0,
  onPieceSnap,
  onConnectionMade,
}: ElephantPuzzleProps) => {
  const [connectedPhases, setConnectedPhases] = useState<Set<Phase>>(new Set());
  const [recentlyConnected, setRecentlyConnected] = useState<Phase | null>(null);
  const [snapAnimating, setSnapAnimating] = useState<Record<Phase, boolean>>({
    preparation: false, incubation: false, illumination: false, verification: false
  });
  const [showCompletionReveal, setShowCompletionReveal] = useState(false);
  
  const handleTouchEnd = (e: React.TouchEvent, phase: Phase) => {
    e.preventDefault();
    if (onTouchDrop) {
      onTouchDrop(phase);
    }
  };

  // Calculate progress
  const placedQuotesCount = Object.values(placedQuotes).flat().length;
  const placedTitlesCount = Object.values(placedTitles).filter(Boolean).length;
  const totalItems = totalQuotes + PHASE_TITLES.length;
  const placedItems = placedQuotesCount + placedTitlesCount;
  const progress = totalItems > 0 ? (placedItems / totalItems) * 100 : 0;
  const isComplete = progress === 100;

  // Trigger completion reveal animation
  useEffect(() => {
    if (isComplete && !showCompletionReveal) {
      setTimeout(() => setShowCompletionReveal(true), 300);
    }
  }, [isComplete, showCompletionReveal]);

  // Check for adjacent phase connections with snap animation
  const PHASE_ORDER: Phase[] = ["preparation", "incubation", "illumination", "verification"];
  
  const triggerSnapAnimation = useCallback((phase: Phase) => {
    setSnapAnimating(prev => ({ ...prev, [phase]: true }));
    setTimeout(() => {
      setSnapAnimating(prev => ({ ...prev, [phase]: false }));
    }, 600);
  }, []);
  
  useEffect(() => {
    const newConnected = new Set<Phase>();
    
    PHASE_ORDER.forEach((phase, index) => {
      const hasContent = placedTitles[phase] || placedQuotes[phase].length > 0;
      const prevPhase = index > 0 ? PHASE_ORDER[index - 1] : null;
      const prevHasContent = prevPhase ? (placedTitles[prevPhase] || placedQuotes[prevPhase].length > 0) : false;
      
      if (hasContent && prevHasContent) {
        newConnected.add(phase);
        
        // Trigger animation for newly connected phase
        if (!connectedPhases.has(phase)) {
          setRecentlyConnected(phase);
          triggerSnapAnimation(phase);
          onPieceSnap?.(phase);
          onConnectionMade?.(prevPhase!, phase);
          setTimeout(() => setRecentlyConnected(null), 600);
        }
      }
    });
    
    setConnectedPhases(newConnected);
  }, [placedQuotes, placedTitles, onPieceSnap, onConnectionMade, triggerSnapAnimation]);

  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-gradient-to-b from-sky-300 to-sky-200">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-20 h-2 bg-black/10">
        <motion.div 
          className="h-full bg-gradient-to-r from-green-400 to-green-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      {/* Progress label */}
      <div className="absolute top-3 right-3 z-20 bg-white/90 px-2 py-1 rounded-full text-xs font-bold text-sky-700 shadow">
        🧩 {placedItems}/{totalItems} pieces
      </div>

      {/* Background image - the elephant puzzle base */}
      <motion.img 
        src={elephantBg} 
        alt="Elephant Puzzle - Creativity is..." 
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        draggable={false}
        initial={{ opacity: 0.4, filter: "blur(2px) grayscale(30%)" }}
        animate={{ 
          opacity: isComplete ? 1 : 0.4 + (progress / 100) * 0.5,
          filter: isComplete 
            ? "blur(0px) grayscale(0%)" 
            : `blur(${2 - (progress / 100) * 2}px) grayscale(${30 - (progress / 100) * 30}%)`,
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Completion overlay - full puzzle reveal */}
      <AnimatePresence>
        {showCompletionReveal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-30 pointer-events-none"
          >
            {/* Radial reveal effect */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: [0, 1, 0.8] }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-[200%] h-[200%] rounded-full bg-gradient-radial from-yellow-300/50 via-transparent to-transparent" />
            </motion.div>
            
            {/* Success badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180, y: 50 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.3 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="bg-white/95 rounded-2xl p-6 shadow-2xl border-4 border-yellow-400">
                <motion.span 
                  className="text-6xl block mb-2"
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  🎉
                </motion.span>
                <p className="font-display font-bold text-xl text-sky-800">Puzzle Complete!</p>
              </div>
            </motion.div>

            {/* Sparkle particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: "50%", 
                  y: "50%",
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0],
                  x: `${50 + Math.cos(i * 30 * Math.PI / 180) * 40}%`,
                  y: `${50 + Math.sin(i * 30 * Math.PI / 180) * 40}%`,
                }}
                transition={{ 
                  duration: 1,
                  delay: 0.5 + i * 0.05,
                  ease: "easeOut"
                }}
              >
                ✨
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Floating phase labels - styled like the reference */}
      {(Object.keys(PHASE_CONFIG) as Phase[]).map((phase) => (
        <div
          key={`label-${phase}`}
          className={`absolute font-display font-bold text-sm md:text-xl italic ${PHASE_COLORS[phase].labelColor}`}
          style={{
            top: PHASE_ZONES[phase].label.top,
            left: PHASE_ZONES[phase].label.left,
            transform: "rotate(-8deg)",
            textShadow: "1px 1px 2px rgba(255,255,255,0.8)",
          }}
        >
          {placedTitles[phase] ? placedTitles[phase]?.title : PHASE_LABELS[phase]}
        </div>
      ))}
      
      {/* Phase drop zones - jigsaw puzzle pieces */}
      {(Object.keys(PHASE_CONFIG) as Phase[]).map((phase, phaseIndex) => {
        const isHinted = hintZone === phase;
        const isHighlighted = highlightedZone === phase;
        const isConnected = connectedPhases.has(phase);
        const isRecentlyConnected = recentlyConnected === phase;
        const hasContent = placedTitles[phase] || placedQuotes[phase].length > 0;
        
        // Jigsaw clip-path with tabs and slots
        const getJigsawPath = (index: number) => {
          const hasLeftSlot = index > 0;
          const hasRightTab = index < 3;
          
          if (hasLeftSlot && hasRightTab) {
            return `polygon(
              8% 0%, 92% 0%,
              92% 35%, 100% 38%, 102% 50%, 100% 62%, 92% 65%,
              92% 100%, 8% 100%,
              8% 65%, 0% 62%, -2% 50%, 0% 38%, 8% 35%
            )`;
          } else if (hasLeftSlot) {
            return `polygon(
              8% 0%, 100% 0%,
              100% 100%, 8% 100%,
              8% 65%, 0% 62%, -2% 50%, 0% 38%, 8% 35%
            )`;
          } else if (hasRightTab) {
            return `polygon(
              0% 0%, 92% 0%,
              92% 35%, 100% 38%, 102% 50%, 100% 62%, 92% 65%,
              92% 100%, 0% 100%
            )`;
          }
          return 'none';
        };

        return (
        <motion.div
          key={phase}
          className={`absolute p-2 md:p-3 transition-all duration-300 overflow-visible backdrop-blur-[1px] touch-none ${
            isHinted
              ? `bg-yellow-100/40 shadow-lg`
              : isHighlighted
                ? `${PHASE_COLORS[phase].bg} shadow-md backdrop-blur-[2px]`
                : hasContent
                  ? `${PHASE_COLORS[phase].bg} shadow-sm`
                  : `bg-white/15`
          }`}
          animate={
            isRecentlyConnected 
              ? { scale: [1, 1.05, 1] }
              : isHinted 
                ? { scale: [1.02, 1.04, 1.02] } 
                : {}
          }
          style={{
            top: PHASE_ZONES[phase].zone.top,
            left: PHASE_ZONES[phase].zone.left,
            width: PHASE_ZONES[phase].zone.width,
            height: PHASE_ZONES[phase].zone.height,
            clipPath: getJigsawPath(phaseIndex),
            border: isHinted 
              ? '2px solid rgba(250, 204, 21, 0.8)' 
              : hasContent || isHighlighted 
                ? `2px solid ${PHASE_COLORS[phase].borderHex}`
                : '2px dashed rgba(255, 255, 255, 0.4)',
            WebkitTapHighlightColor: 'transparent',
          }}
          transition={isHinted ? { duration: 0.5, repeat: Infinity, repeatType: "reverse" } : { duration: 0.3 }}
          onDragOver={(e) => {
            e.preventDefault();
            onDragOver(e, phase);
          }}
          onDrop={() => onDrop(phase)}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => handleTouchEnd(e, phase)}
          whileHover={{ scale: 1.01 }}
        >
          {/* Jigsaw tab visual on right side */}
          {phaseIndex < 3 && (
            <div 
              className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-10 rounded-full z-10 transition-colors ${
                hasContent ? PHASE_COLORS[phase].bg : 'bg-white/40'
              }`}
              style={{
                border: hasContent || isHighlighted 
                  ? `3px solid` 
                  : '3px dashed',
                borderColor: hasContent 
                  ? undefined 
                  : 'rgba(156, 163, 175, 0.4)',
              }}
            />
          )}
          
          {/* Jigsaw slot visual on left side */}
          {phaseIndex > 0 && (
            <div 
              className={`absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-10 rounded-full z-0 ${
                isConnected ? 'bg-green-100' : 'bg-sky-200/50'
              }`}
            />
          )}

          {/* Connection indicator */}
          {phaseIndex > 0 && (
            <AnimatePresence>
              {isConnected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -left-1 top-1/2 -translate-y-1/2 z-20"
                >
                  <motion.div 
                    className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                    animate={isRecentlyConnected ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    <span className="text-white text-[10px]">✓</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Hint indicator */}
          {isHinted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap shadow-lg z-20"
            >
              💡 Drop here!
            </motion.div>
          )}
          
          {/* Title slot - jigsaw styled */}
          {placedTitles[phase] && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, rotate: -3 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              className={`text-center mb-2 py-1.5 px-2 cursor-pointer hover:bg-red-100 group transition-all jigsaw-title-placed`}
              onClick={() => onRemoveTitle?.(placedTitles[phase]!, phase)}
              title="Click to remove"
              style={{
                background: `linear-gradient(135deg, ${PHASE_COLORS[phase].bg.replace('/70', '')} 0%, white 100%)`,
                borderRadius: '8px',
                border: `2px solid`,
                borderColor: PHASE_COLORS[phase].border.replace('border-', ''),
              }}
            >
              <span className={`font-display font-bold text-xs md:text-sm ${PHASE_COLORS[phase].text} group-hover:text-red-500`}>
                🧩 {placedTitles[phase]?.title}
                <span className="ml-1 opacity-0 group-hover:opacity-100 text-red-500">×</span>
              </span>
            </motion.div>
          )}

          {/* Placed quotes - jigsaw styled cards */}
          <div className="space-y-2 max-h-[calc(100%-2rem)] overflow-y-auto custom-scrollbar pr-1">
            {placedQuotes[phase].map((quote, quoteIndex) => (
              <motion.div
                key={quote.id}
                initial={{ scale: 0.8, opacity: 0, x: -10 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                transition={{ delay: quoteIndex * 0.05 }}
                className="relative bg-white/95 p-2 md:p-2.5 text-[9px] md:text-xs cursor-pointer hover:bg-red-50 group transition-all"
                onClick={() => onRemoveQuote?.(quote, phase)}
                title="Click to remove and try again"
                style={{
                  clipPath: 'polygon(10% 0%, 100% 0%, 100% 100%, 10% 100%, 10% 65%, 2% 60%, 0% 50%, 2% 40%, 10% 35%)',
                  boxShadow: '3px 4px 10px rgba(0,0,0,0.12)',
                  border: '2px solid',
                  borderColor: PHASE_COLORS[phase].border.replace('border-', '').replace('-400', '-200'),
                  marginLeft: '6px',
                }}
              >
                <p className="line-clamp-3 text-gray-700 group-hover:text-red-600 italic pl-2">"{quote.text}"</p>
                <p className="text-gray-500 mt-1 text-[8px] md:text-[10px] group-hover:text-red-400 pl-2 font-medium">— {quote.author}</p>
              </motion.div>
            ))}
            
            {placedQuotes[phase].length === 0 && !placedTitles[phase] && (
              <motion.div 
                className="text-center py-6 text-gray-400/80 text-[10px] md:text-xs italic flex flex-col items-center gap-2"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-2xl">🧩</span>
                <span className="font-medium">Drop jigsaw pieces here</span>
              </motion.div>
            )}
          </div>
        </motion.div>
        );
      })}
    </div>
  );
};
