import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  club_role: "joueur" | "entraineur" | "arbitre" | "joueur-entraineur" | "joueur-arbitre" | "entraineur-arbitre" | "les-trois";
  team: "loisir" | "d1_masculine" | "d1_feminine";
  sport: "goalball" | "torball" | "both";
  site_role: "member" | "admin";
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;
        setProfile(data as Profile);
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger votre profil"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <Button
              onClick={() => navigate("/profile/edit")}
              className="bg-primary hover:bg-primary/90"
            >
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </Button>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                Profil de {profile?.first_name} {profile?.last_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">Informations personnelles</h3>
                  <div className="space-y-2 text-gray-400">
                    <p><span className="font-medium">Prénom:</span> {profile?.first_name}</p>
                    <p><span className="font-medium">Nom:</span> {profile?.last_name}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">Informations sportives</h3>
                  <div className="space-y-2 text-gray-400">
                    <p><span className="font-medium">Rôle:</span> {profile?.club_role}</p>
                    <p><span className="font-medium">Équipe:</span> {profile?.team}</p>
                    <p><span className="font-medium">Sport:</span> {profile?.sport}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;