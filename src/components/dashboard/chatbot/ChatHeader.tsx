import { Bot } from "lucide-react";

interface ChatHeaderProps {
  sports: string;
}

export function ChatHeader({ sports }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Bot className="h-6 w-6 text-primary" aria-hidden="true" />
      <h3 className="text-lg font-semibold text-white">
        Coach Virtuel {sports}
      </h3>
    </div>
  );
}