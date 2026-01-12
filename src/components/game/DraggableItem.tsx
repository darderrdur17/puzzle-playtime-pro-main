import { ReactNode, useRef, useState } from "react";
import { motion } from "framer-motion";

interface DraggableItemProps {
  children: ReactNode;
  onDragStart: () => void;
  onDragEnd: () => void;
  className?: string;
  id: string;
}

export const DraggableItem = ({
  children,
  onDragStart,
  onDragEnd,
  className = "",
  id,
}: DraggableItemProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  // Mouse drag handlers (desktop)
  const handleDragStart = () => {
    setIsDragging(true);
    onDragStart();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  // Touch handlers (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
    currentPos.current = { x: touch.clientX, y: touch.clientY };
    setIsDragging(true);
    onDragStart();
    
    // Store the dragged item ID globally for drop detection
    (window as any).__draggedItemId = id;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !itemRef.current) return;
    
    const touch = e.touches[0];
    currentPos.current = { x: touch.clientX, y: touch.clientY };
    
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;
    
    itemRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`;
    itemRef.current.style.zIndex = "1000";
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!itemRef.current) return;
    
    // Reset transform
    itemRef.current.style.transform = "";
    itemRef.current.style.zIndex = "";
    
    setIsDragging(false);
    onDragEnd();
    
    // Find the drop target under the touch point
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Trigger custom event for drop zones to handle
    if (dropTarget) {
      const event = new CustomEvent("touchdrop", {
        bubbles: true,
        detail: { itemId: id, x: touch.clientX, y: touch.clientY },
      });
      dropTarget.dispatchEvent(event);
    }
    
    // Clear global reference
    (window as any).__draggedItemId = null;
  };

  return (
    <motion.div
      ref={itemRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`cursor-grab active:cursor-grabbing touch-none select-none ${className} ${
        isDragging ? "opacity-80 scale-105 rotate-2" : ""
      }`}
      whileHover={{ scale: 1.03, rotate: 1, y: -2 }}
      whileTap={{ scale: 0.97 }}
      style={{
        filter: isDragging ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.25))' : undefined,
      }}
    >
      {children}
    </motion.div>
  );
};
