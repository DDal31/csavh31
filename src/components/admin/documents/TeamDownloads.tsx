import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

type Props = {
  teams: string[];
  selectedTeam: string | null;
  onSelectTeam: (team: string | null) => void;
};

export function TeamDownloads({ teams, selectedTeam, onSelectTeam }: Props) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">
          Filtrer par équipe
        </h2>
        {selectedTeam && (
          <Button
            onClick={() => onSelectTeam(null)}
            variant="outline"
            className="text-white hover:text-primary-foreground"
            aria-label="Afficher toutes les équipes"
          >
            Afficher tout
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {teams.map((team) => (
          <Button
            key={team}
            onClick={() => onSelectTeam(team)}
            className={`${
              selectedTeam === team
                ? "bg-primary hover:bg-primary/90"
                : "bg-secondary hover:bg-secondary/90"
            } text-white w-full`}
            aria-label={`Afficher l'équipe ${team}`}
            aria-pressed={selectedTeam === team}
          >
            <Eye className="h-4 w-4 mr-2" />
            {team}
          </Button>
        ))}
      </div>
    </div>
  );
}