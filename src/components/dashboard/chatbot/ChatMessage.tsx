import { Bot } from "lucide-react";
import { motion } from "framer-motion";

interface ChatMessageProps {
  message: string;
}

export function ChatMessage({ message }: ChatMessageProps) {
  if (!message) return null;
  
  return (
    <motion.div 
      className="bg-gray-700/50 p-4 rounded-lg text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="log" 
      aria-label="Réponse du coach"
    >
      <div className="flex items-start gap-3">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
        >
          <Bot className="h-6 w-6 text-primary mt-1" />
        </motion.div>
        <div className="flex-1 typing-animation">
          {message}
        </div>
      </div>
    </motion.div>
  );
}