import { Bot } from "lucide-react";
import { motion } from "framer-motion";

interface ChatMessageProps {
  message: string;
  isLoading?: boolean;
}

export function ChatMessage({ message, isLoading }: ChatMessageProps) {
  if (!message && !isLoading) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-700/50 p-4 rounded-lg text-white"
      role="log" 
      aria-label="Réponse du coach"
    >
      <div className="flex items-start gap-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20 
          }}
        >
          <Bot className="w-6 h-6 text-blue-400" />
        </motion.div>
        <div className={isLoading ? "typing-dots" : "typing-animation"}>
          {message}
        </div>
      </div>
    </motion.div>
  );
}