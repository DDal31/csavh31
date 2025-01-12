import { Bot } from "lucide-react";

interface ChatMessageProps {
  message: string;
}

export function ChatMessage({ message }: ChatMessageProps) {
  if (!message) return null;
  
  return (
    <div 
      className="bg-gray-700/50 p-4 rounded-lg text-white animate-fade-in"
      role="log" 
      aria-label="Réponse du coach"
    >
      {message}
    </div>
  );
}