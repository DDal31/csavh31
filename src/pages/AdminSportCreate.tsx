import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

const AdminSportCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sportName, setSportName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sportName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du sport est requis",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("sports")
        .insert([{ name: sportName.trim() }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le sport a été ajouté avec succès",
      });
      navigate("/admin/settings/sports-teams");
    } catch (error) {
      console.error("Erreur lors de l'ajout du sport:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le sport",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Ajouter un Sport
            </h1>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Nouveau Sport
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="sportName"
                    className="block text-sm font-medium text-gray-200 mb-1"
                  >
                    Nom du sport
                  </label>
                  <Input
                    id="sportName"
                    type="text"
                    value={sportName}
                    onChange={(e) => setSportName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Entrez le nom du sport"
                    disabled={isSubmitting}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Création en cours..." : "Créer le sport"}
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

export default AdminSportCreate;