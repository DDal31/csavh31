import { CircleCheck, CircleAlert, CircleX } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { BallAnimation } from "@/components/animations/BallAnimation";

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

  const getProgressPercentage = () => {
    if (type === "players") {
      return Math.min((count / 8) * 100, 100);
    } else {
      return Math.min((count / 2) * 100, 100);
    }
  };

  const progressValue = getProgressPercentage();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-2 p-3 rounded-lg bg-gray-700 w-full relative"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex items-center gap-2">
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
      <div className="relative">
        <Progress 
          value={progressValue} 
          className="h-2 bg-gray-600"
        />
        {progressValue > 0 && (
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: `${progressValue}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute left-0 -top-3"
          >
            <BallAnimation 
              type={type === "players" ? "goalball" : "torball"}
              animation="roll"
              className="w-4 h-4 transform -translate-x-1/2"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}