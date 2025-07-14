import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSportsAndTeams } from "@/hooks/useSportsAndTeams";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export const SportsTeamsManager = () => {
  const navigate = useNavigate();
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const { sports, teams, isLoadingSports, isLoadingTeams } = useSportsAndTeams(selectedSports);

  const handleSportToggle = (sportId: string) => {
    setSelectedSports(prev => {
      if (prev.includes(sportId)) {
        return prev.filter(id => id !== sportId);
      }
      return [...prev, sportId];
    });
  };

  if (isLoadingSports) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sports Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Sports</h2>
          <Button
            onClick={() => navigate("/admin/settings/sports-teams/add-sport")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un sport
          </Button>
        </div>

        <div className="grid gap-4">
          {sports?.map((sport) => (
            <div
              key={sport.id}
              className="bg-gray-700 p-4 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedSports.includes(sport.id)}
                  onCheckedChange={() => handleSportToggle(sport.id)}
                  className="border-gray-500"
                />
                <span className="text-white font-medium">{sport.name}</span>
              </div>
            </div>
          ))}

          {sports?.length === 0 && (
            <p className="text-gray-400 text-center py-4">
              Aucun sport n'a été créé
            </p>
          )}
        </div>
      </div>

      {/* Teams Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Équipes</h2>
          <Button
            onClick={() => navigate("/admin/settings/sports-teams/add-team")}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={selectedSports.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une équipe
          </Button>
        </div>

        {selectedSports.length === 0 ? (
          <p className="text-gray-400 text-center py-4">
            Sélectionnez un sport pour voir ses équipes
          </p>
        ) : isLoadingTeams ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        ) : (
          <div className="grid gap-4">
            {teams?.map((team) => (
              <div
                key={team.id}
                className="bg-gray-700 p-4 rounded-lg flex items-center justify-between"
              >
                <span className="text-white font-medium">{team.name}</span>
              </div>
            ))}

            {teams?.length === 0 && (
              <p className="text-gray-400 text-center py-4">
                Aucune équipe trouvée pour les sports sélectionnés
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};