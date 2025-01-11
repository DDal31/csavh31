import { Bot } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type TrainingType = Database["public"]["Enums"]["training_type"];

interface ChatHeaderProps {
  sport: TrainingType;
}

export function ChatHeader({ sport }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Bot className="h-6 w-6 text-primary" aria-hidden="true" />
      <h3 className="text-lg font-semibold text-white">
        Coach Virtuel {sport}
      </h3>
    </div>
  );
}