import { CircleCheck, CircleAlert, CircleX } from "lucide-react";

interface AttendanceGraphProps {
  type: "players" | "referees";
  count: number;
  ariaLabel: string;
}

export function AttendanceGraph({ type, count, ariaLabel }: AttendanceGraphProps) {
  const getStatus = () => {
    if (type === "players") {
      if (count < 6) return "insufficient";
      if (count === 6) return "minimal";
      return "sufficient";
    } else {
      if (count === 0) return "insufficient";
      if (count === 1) return "minimal";
      return "sufficient";
    }
  };

  const status = getStatus();
  const Icon = status === "sufficient" ? CircleCheck :
              status === "minimal" ? CircleAlert :
              CircleX;

  const colorClass = status === "sufficient" ? "text-green-500" :
                    status === "minimal" ? "text-yellow-500" :
                    "text-red-500";

  return (
    <div 
      className="flex items-center gap-2 p-3 rounded-lg bg-gray-700 w-full"
      role="img"
      aria-label={ariaLabel}
    >
      <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${colorClass} flex-shrink-0`} />
      <div className="min-w-0">
        <h3 className="text-sm sm:text-base font-medium text-white truncate">
          {type === "players" ? "Joueurs" : "Arbitres"}
        </h3>
        <p className="text-xs sm:text-sm text-gray-300">
          {count} {type === "players" ? "joueur" : "arbitre"}
          {count > 1 ? "s" : ""} inscrit{count > 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}