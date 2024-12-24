import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Pencil } from "lucide-react";
import type { Profile } from "@/types/profile";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

        console.log("Fetching profile for user:", session.user.id);
        
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }

        if (!data) {
          console.log("No profile found");
          toast({
            title: "Erreur",
            description: "Profil non trouvé",
            variant: "destructive",
          });
          return;
        }

        console.log("Profile fetched successfully:", data);
        setProfile(data);
      } catch (error) {
        console.error("Error in profile fetch:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil",
          variant: "destructive",
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
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="mb-4">Profil non trouvé</p>
          <Button onClick={() => navigate("/dashboard")}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <User className="h-8 w-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Mon Profil</h1>
            </div>
            <Button onClick={() => navigate("/profile/edit")} className="flex items-center space-x-2">
              <Pencil className="h-4 w-4" />
              <span>Modifier</span>
            </Button>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white">Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400">Prénom</p>
                  <p className="text-lg text-white">{profile.first_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Nom</p>
                  <p className="text-lg text-white">{profile.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-lg text-white">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Téléphone</p>
                  <p className="text-lg text-white">{profile.phone || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Rôle dans le club</p>
                  <p className="text-lg text-white capitalize">{profile.club_role.replace(/-/g, " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Sport pratiqué</p>
                  <p className="text-lg text-white capitalize">
                    {profile.sport === "both" ? "Goalball et Torball" : profile.sport}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Équipe</p>
                  <p className="text-lg text-white capitalize">{profile.team.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Rôle sur le site</p>
                  <p className="text-lg text-white capitalize">{profile.site_role}</p>
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

export default ProfilePage;