import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormFields } from "@/components/profile/ProfileFormFields";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  club_role: "joueur" | "entraineur" | "arbitre" | "joueur-entraineur" | "joueur-arbitre" | "entraineur-arbitre" | "les-trois";
  team: "loisir" | "d1_masculine" | "d1_feminine";
  sport: "goalball" | "torball" | "both";
  site_role: "member" | "admin";
}

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({
    id: "",
    first_name: "",
    last_name: "",
    club_role: "joueur",
    team: "loisir",
    sport: "goalball",
    site_role: "member"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", session.user.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre profil a été mis à jour"
      });
      navigate("/profile");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil"
      });
    } finally {
      setSaving(false);
    }
  };

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
              onClick={() => navigate("/profile")}
              className="text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">
                Modifier mon profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <ProfileFormFields profile={profile} setProfile={setProfile} />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={saving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileEdit;