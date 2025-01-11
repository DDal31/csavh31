import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

export function ChatInput({ 
  message, 
  setMessage, 
  onSubmit, 
  isLoading
}: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className="flex gap-3">
      <Input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Posez votre question..."
        className="flex-grow bg-gray-700/50 border-gray-600 focus:border-primary text-white placeholder:text-gray-400"
        aria-label="Votre question au coach virtuel"
        disabled={isLoading}
      />
      <Button 
        type="submit" 
        disabled={isLoading || !message.trim()}
        aria-label="Envoyer la question"
        className="bg-primary hover:bg-primary/90 text-white"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}