import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSportsAndTeams } from "@/hooks/useSportsAndTeams";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const SportsTeamsManager = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const { sports, teams, isLoadingSports, isLoadingTeams } = useSportsAndTeams(selectedSports);

  const handleSportToggle = (sportId: string) => {
    setSelectedSports(prev => {
      if (prev.includes(sportId)) {
        return prev.filter(id => id !== sportId);
      }
      return [...prev, sportId];
    });
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    setDeletingTeamId(teamId);
    
    try {
      console.log("Tentative de suppression de l'équipe:", teamId, teamName);
      
      const { error, data } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamId)
        .select();

      if (error) {
        console.error("Erreur Supabase lors de la suppression:", error);
        toast.error(`Erreur lors de la suppression: ${error.message}`);
        return;
      }

      console.log("Suppression réussie:", data);
      
      // Invalider et refetch les données
      await queryClient.invalidateQueries({ 
        queryKey: ["teams", selectedSports] 
      });
      
      // Forcer le rechargement
      await queryClient.refetchQueries({ 
        queryKey: ["teams", selectedSports] 
      });

      toast.success(`Équipe "${teamName}" supprimée avec succès`);
    } catch (error) {
      console.error("Erreur catch:", error);
      toast.error("Une erreur est survenue lors de la suppression");
    } finally {
      setDeletingTeamId(null);
    }
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
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      disabled={deletingTeamId === team.id}
                      aria-label={`Supprimer l'équipe ${team.name}`}
                    >
                      {deletingTeamId === team.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-800 border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">
                        Supprimer l'équipe
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-300">
                        Êtes-vous sûr de vouloir supprimer l'équipe "{team.name}" ? 
                        Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                        Annuler
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteTeam(team.id, team.name)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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