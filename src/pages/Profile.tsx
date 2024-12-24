import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      try {
        console.log("Fetching profile data for user:", session.user.id);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }

        console.log("Profile data retrieved:", data);
        setProfile(data);
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger votre profil",
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const profileFields = [
    { label: "Prénom", value: profile?.first_name },
    { label: "Nom", value: profile?.last_name },
    { label: "Email", value: profile?.email },
    { label: "Téléphone", value: profile?.phone || "Non renseigné" },
    { label: "Rôle dans le club", value: profile?.club_role },
    { label: "Sport", value: profile?.sport },
    { label: "Équipe", value: profile?.team },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Button
              variant="ghost"
              className="text-white hover:bg-gray-800"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Button
              onClick={() => navigate("/profile/edit")}
              className="bg-primary hover:bg-primary/90"
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </div>

          <Card className="bg-white/10 border-none backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                Mon Profil
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              {profileFields.map((field) => (
                <div key={field.label} className="grid gap-2">
                  <label className="text-sm font-medium text-gray-400">
                    {field.label}
                  </label>
                  <p className="text-lg text-white">
                    {field.value}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;