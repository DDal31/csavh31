import { Bot } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type TrainingType = Database["public"]["Enums"]["training_type"];

interface ChatHeaderProps {
  sport: TrainingType;
  messageCount: number;
  maxMessages: number;
}

export function ChatHeader({ sport, messageCount, maxMessages }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Bot className="h-6 w-6 text-primary" aria-hidden="true" />
      <h3 className="text-lg font-semibold text-white">
        Coach Virtuel {sport}
      </h3>
      <span className="text-sm text-gray-400 ml-auto">
        {messageCount}/{maxMessages} messages aujourd'hui
      </span>
    </div>
  );
}