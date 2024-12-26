import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceGraph } from "./AttendanceGraph";
import { ParticipantsList } from "./ParticipantsList";
import type { Training } from "@/types/training";

interface AttendanceCardProps {
  training: Training & {
    registrations: Array<{
      profiles: {
        first_name: string;
        last_name: string;
        club_role: string;
      };
    }>;
  };
}

export function AttendanceCard({ training }: AttendanceCardProps) {
  const players = training.registrations.filter(reg => 
    ["joueur", "joueur-entraineur", "joueur-arbitre", "les-trois"].includes(reg.profiles.club_role)
  );

  const referees = training.registrations.filter(reg => 
    ["arbitre", "joueur-arbitre", "entraineur-arbitre", "les-trois"].includes(reg.profiles.club_role)
  );

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="space-y-1 px-4 py-3 sm:px-6 sm:py-4">
        <CardTitle className="text-lg sm:text-xl text-white">
          {format(new Date(training.date), "EEEE d MMMM yyyy", { locale: fr })}
        </CardTitle>
        <div className="text-sm sm:text-base text-gray-300 flex flex-wrap gap-x-2 items-center">
          <span>{training.start_time.slice(0, 5)} - {training.end_time.slice(0, 5)}</span>
          <span className="hidden sm:inline">•</span>
          <span>
            {training.type.charAt(0).toUpperCase() + training.type.slice(1)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 px-4 py-3 sm:px-6 sm:py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
          <AttendanceGraph
            type="players"
            count={players.length}
            ariaLabel={`Présence des joueurs : ${players.length} joueurs inscrits, statut ${
              players.length < 6 ? "insuffisant" :
              players.length === 6 ? "minimal" :
              "suffisant"
            }`}
          />
          <AttendanceGraph
            type="referees"
            count={referees.length}
            ariaLabel={`Présence des arbitres : ${referees.length} arbitres inscrits, statut ${
              referees.length === 0 ? "insuffisant" :
              referees.length === 1 ? "minimal" :
              "suffisant"
            }`}
          />
        </div>
        <ParticipantsList players={players} referees={referees} />
      </CardContent>
    </Card>
  );
}