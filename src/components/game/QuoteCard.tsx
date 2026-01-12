import { motion } from "framer-motion";
import { Quote } from "@/types/game";

interface QuoteCardProps {
  quote: Quote;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const QuoteCard = ({ quote, isDragging, onDragStart, onDragEnd }: QuoteCardProps) => {
  return (
    <motion.div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`puzzle-piece bg-card border-primary/30 ${isDragging ? "dragging" : ""}`}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <p className="text-sm font-medium leading-tight">"{quote.text}"</p>
      <p className="text-xs text-muted-foreground mt-2">— {quote.author}</p>
    </motion.div>
  );
};
