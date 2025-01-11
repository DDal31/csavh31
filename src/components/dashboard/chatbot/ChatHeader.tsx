import type { Database } from "@/integrations/supabase/types";

type TrainingType = Database["public"]["Enums"]["training_type"];

interface ChatHeaderProps {
  sport: TrainingType;
}

export function ChatHeader({ sport }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <h3 className="text-lg font-semibold text-white">
        Coach Virtuel {sport.charAt(0).toUpperCase() + sport.slice(1)}
      </h3>
    </div>
  );
}