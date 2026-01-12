import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimerProps {
  timerSeconds: number;
  timerStartedAt: string | null;
  isCompleted?: boolean;
  onTimeUp?: () => void;
  onRemainingChange?: (seconds: number) => void;
}

export const Timer = ({ timerSeconds, timerStartedAt, isCompleted, onTimeUp, onRemainingChange }: TimerProps) => {
  const [remaining, setRemaining] = useState(timerSeconds * 1000);

  useEffect(() => {
    if (!timerStartedAt || isCompleted) {
      setRemaining(timerSeconds * 1000);
      return;
    }

    const updateRemaining = () => {
      const startTime = new Date(timerStartedAt).getTime();
      const elapsed = Date.now() - startTime;
      const remainingMs = Math.max(0, timerSeconds * 1000 - elapsed);
      setRemaining(remainingMs);
      onRemainingChange?.(Math.ceil(remainingMs / 1000));

      if (remainingMs <= 0 && onTimeUp) {
        onTimeUp();
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [timerStartedAt, timerSeconds, isCompleted, onTimeUp, onRemainingChange]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isWarning = remaining <= 30000 && remaining > 0;
  const isCritical = remaining <= 10000 && remaining > 0;

  return (
    <div className={cn(
      "px-4 py-2 flex items-center gap-2 rounded-lg transition-all",
      isCritical ? "bg-red-500 text-white animate-pulse" :
      isWarning ? "bg-orange-400 text-white" :
      "bg-white/80 text-foreground shadow"
    )}>
      <Clock className={cn(
        "w-5 h-5",
        isCritical ? "text-white" :
        isWarning ? "text-white" :
        "text-primary"
      )} />
      <span className={cn(
        "font-display font-bold text-lg tabular-nums",
        isCritical && "text-xl"
      )}>
        {formatTime(remaining)}
      </span>
    </div>
  );
};
