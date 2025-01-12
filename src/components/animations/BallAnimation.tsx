import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BallAnimationProps {
  type: "goalball" | "torball";
  animation: "roll" | "bounce" | "spin";
  className?: string;
}

export function BallAnimation({ type, animation, className }: BallAnimationProps) {
  const ballVariants = {
    roll: {
      rotate: [0, 360],
      x: [-20, 20],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "linear",
      },
    },
    bounce: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut",
      },
    },
    spin: {
      rotate: [0, 360],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  return (
    <motion.div
      className={cn(
        "w-8 h-8 rounded-full shadow-lg",
        type === "goalball" 
          ? "bg-blue-500 border-2 border-blue-600" 
          : "bg-white border-2 border-gray-300",
        className
      )}
      variants={ballVariants}
      animate={animation}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    />
  );
}