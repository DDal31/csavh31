import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { Sport } from "@/types/sports";

const AdminTeamCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sports, setSports] = useState<Sport[]>([]);
  const [teamName, setTeamName] = useState("");
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadSports = async () => {
      try {
        const { data, error } = await supabase
          .from("sports")
          .select("*")
          .order("name");

        if (error) throw error;

        setSports(data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des sports:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les sports",
          variant: "destructive",
        });
        navigate("/admin/settings/sports-teams");
      }
    };

    loadSports();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !selectedSport) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont requis",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("teams")
        .insert([{
          name: teamName.trim(),
          sport_id: selectedSport
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "L'équipe a été ajoutée avec succès",
      });
      navigate("/admin/settings/sports-teams");
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'équipe:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'équipe",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/settings/sports-teams")}
              className="text-white hover:text-gray-300"
              aria-label="Retour à la gestion des sports et équipes"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Ajouter une Équipe
            </h1>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Nouvelle Équipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-200">
                    Sport
                  </label>
                  <RadioGroup
                    value={selectedSport}
                    onValueChange={setSelectedSport}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    {sports.map((sport) => (
                      <div key={sport.id} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={sport.id}
                          id={sport.id}
                          className="border-gray-600 text-blue-600"
                        />
                        <label
                          htmlFor={sport.id}
                          className="text-sm font-medium leading-none text-gray-200 cursor-pointer"
                        >
                          {sport.name}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <label
                    htmlFor="teamName"
                    className="block text-sm font-medium text-gray-200 mb-1"
                  >
                    Nom de l'équipe
                  </label>
                  <Input
                    id="teamName"
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Entrez le nom de l'équipe"
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Création en cours..." : "Créer l'équipe"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminTeamCreate;