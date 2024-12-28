import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Sport, Team } from "@/types/sports";

const AdminSportsTeams = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sports, setSports] = useState<Sport[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const loadData = async () => {
    try {
      const [sportsResult, teamsResult] = await Promise.all([
        supabase.from("sports").select("*").order("name"),
        supabase.from("teams").select("*").order("name")
      ]);

      if (sportsResult.error) throw sportsResult.error;
      if (teamsResult.error) throw teamsResult.error;

      setSports(sportsResult.data);
      setTeams(teamsResult.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les sports et équipes",
        variant: "destructive",
      });
      navigate("/admin/settings");
    }
  };

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("site_role")
          .eq("id", session.user.id)
          .single();

        if (!profile || profile.site_role !== "admin") {
          console.log("Accès non autorisé : l'utilisateur n'est pas admin");
          navigate("/dashboard");
          return;
        }

        await loadData();
      } catch (error) {
        console.error("Erreur lors de la vérification des droits admin:", error);
        navigate("/admin/settings");
      }
    };

    checkAuthAndLoadData();
  }, [navigate, toast]);

  const handleDeleteSport = async (sportId: string, sportName: string) => {
    try {
      console.log("Suppression du sport:", sportId);
      
      // Delete all teams associated with this sport first
      const { error: teamsError } = await supabase
        .from("teams")
        .delete()
        .eq("sport_id", sportId);

      if (teamsError) throw teamsError;

      // Then delete the sport
      const { error: sportError } = await supabase
        .from("sports")
        .delete()
        .eq("id", sportId);

      if (sportError) throw sportError;

      toast({
        title: "Sport supprimé",
        description: `Le sport ${sportName} et ses équipes ont été supprimés avec succès.`,
      });

      // Reload data to update the UI
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la suppression du sport:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le sport",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    try {
      console.log("Suppression de l'équipe:", teamId);
      
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamId);

      if (error) throw error;

      toast({
        title: "Équipe supprimée",
        description: `L'équipe ${teamName} a été supprimée avec succès.`,
      });

      // Reload data to update the UI
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'équipe:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'équipe",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/admin/settings")}
                className="text-white hover:text-gray-300"
                aria-label="Retour aux paramètres"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Gestion des Sports et Équipes
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={() => navigate("/admin/settings/sports-teams/add-sport")}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un sport
              </Button>
              <Button
                onClick={() => navigate("/admin/settings/sports-teams/add-team")}
                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une équipe
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {sports.map((sport) => (
              <Card key={sport.id} className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl text-white">{sport.name}</CardTitle>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={`Supprimer le sport ${sport.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-800 text-white border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          Êtes-vous sûr de vouloir supprimer le sport {sport.name} ? 
                          Cette action supprimera également toutes les équipes associées à ce sport.
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                          Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteSport(sport.id, sport.name)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {teams
                      .filter((team) => team.sport_id === sport.id)
                      .map((team) => (
                        <div
                          key={team.id}
                          className="bg-gray-700 rounded-lg p-4 text-white flex justify-between items-center"
                        >
                          <span>{team.name}</span>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                aria-label={`Supprimer l'équipe ${team.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-800 text-white border-gray-700">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  Êtes-vous sûr de vouloir supprimer l'équipe {team.name} ?
                                  Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                                  Annuler
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTeam(team.id, team.name)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminSportsTeams;