import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

type Props = {
  teams: string[];
  downloading: string | null;
  onDownload: (team: string) => void;
};

export function TeamDownloads({ teams, downloading, onDownload }: Props) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">
        Télécharger les documents par équipe
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {teams.map((team) => (
          <Button
            key={team}
            onClick={() => onDownload(team)}
            disabled={downloading === team}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
            aria-label={`Télécharger les documents de l'équipe ${team}`}
          >
            {downloading === team ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {team}
          </Button>
        ))}
      </div>
    </div>
  );
}