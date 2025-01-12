import { motion } from "framer-motion";

export function TypingAnimation() {
  return (
    <div className="flex space-x-2 p-4" role="status" aria-label="Bot est en train d'écrire">
      {[0, 1, 2].map((dot) => (
        <motion.div
          key={dot}
          className="h-2 w-2 bg-primary rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: dot * 0.2
          }}
        />
      ))}
    </div>
  );
}