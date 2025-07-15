import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChampionshipResults as ChampionshipResultsComponent } from "@/components/championship/ChampionshipResults";
import { useSportsAndTeams } from "@/hooks/useSportsAndTeams";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ChampionshipResultsPage() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            <div className="flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h1 className="text-3xl font-bold text-white">Résultats des Championnats</h1>
            </div>
          </div>

          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-white text-center">
                Sélectionner le sport et l'équipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </CardContent>
          </Card>

          {showResults ? (
            <div className="bg-gray-800 rounded-lg p-6">
              <ChampionshipResultsComponent sportId={selectedSport} teamId={selectedTeam} />
            </div>
          ) : (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  Sélectionnez un sport et une équipe pour voir les résultats des championnats
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}