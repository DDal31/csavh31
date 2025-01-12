import { Bot } from "lucide-react";
import { motion } from "framer-motion";

interface ChatMessageProps {
  message: string;
}

export function ChatMessage({ message }: ChatMessageProps) {
  if (!message) return null;
  
  return (
    <motion.div 
      className="bg-gray-700/50 p-4 rounded-lg text-white typing-animation"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="log" 
      aria-label="Réponse du coach"
    >
      {message}
    </motion.div>
  );
}