import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface ElapsedTimerProps {
  startTime: number | null;
  isCompleted: boolean;
  onElapsedChange?: (seconds: number) => void;
}

export const ElapsedTimer = ({ startTime, isCompleted, onElapsedChange }: ElapsedTimerProps) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime || isCompleted) return;

    const interval = setInterval(() => {
      const newElapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsed(newElapsed);
      onElapsedChange?.(newElapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isCompleted, onElapsedChange]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1.5 bg-white/90 rounded-lg px-2 py-1 shadow text-sm font-mono"
    >
      <Clock className="w-3.5 h-3.5 text-sky-600" />
      <span className="text-sky-800 font-medium">{formatTime(elapsed)}</span>
    </motion.div>
  );
};
