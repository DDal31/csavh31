import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChampionshipResults } from "./ChampionshipResults";
import { useSportsAndTeams } from "@/hooks/useSportsAndTeams";

export function ChampionshipTile() {
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  
  const { sports, teams, isLoadingSports, isLoadingTeams } = useSportsAndTeams(
    selectedSport ? [selectedSport] : []
  );

  const handleSportChange = (value: string) => {
    setSelectedSport(value);
    setSelectedTeam(""); // Reset team selection when sport changes
  };

  const showResults = selectedSport && selectedTeam;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="text-center p-4 sm:p-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-500" />
          <CardTitle className="text-lg sm:text-xl font-bold text-white">
            Résultats Championnat
          </CardTitle>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Sport</label>
            <Select 
              value={selectedSport} 
              onValueChange={handleSportChange}
              disabled={isLoadingSports}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Sélectionner un sport" />
              </SelectTrigger>
              <SelectContent>
                {sports?.map((sport) => (
                  <SelectItem key={sport.id} value={sport.id}>
                    {sport.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Équipe</label>
            <Select 
              value={selectedTeam} 
              onValueChange={setSelectedTeam}
              disabled={!selectedSport || isLoadingTeams}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Sélectionner une équipe" />
              </SelectTrigger>
              <SelectContent>
                {teams?.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      {showResults && (
        <CardContent>
          <ChampionshipResults sportId={selectedSport} teamId={selectedTeam} />
        </CardContent>
      )}
    </Card>
  );
}