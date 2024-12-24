import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Profile {
  nom: string;
  prenom: string;
  role_club: string;
  team: string;
  sport: string;
  role_site: string;
}

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({
    nom: "",
    prenom: "",
    role_club: "",
    team: "",
    sport: "",
    role_site: "member"
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
          .from("profil")
          .select("*")
          .eq("id_user", session.user.id)
          .single();

        if (error) throw error;
        setProfile(data);
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
        .from("profil")
        .update(profile)
        .eq("id_user", session.user.id);

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
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300">Prénom</label>
                      <Input
                        value={profile.prenom}
                        onChange={(e) => setProfile({ ...profile, prenom: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Nom</label>
                      <Input
                        value={profile.nom}
                        onChange={(e) => setProfile({ ...profile, nom: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300">Rôle dans le club</label>
                      <Select
                        value={profile.role_club}
                        onValueChange={(value) => setProfile({ ...profile, role_club: value })}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Sélectionnez un rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entraineur">Entraineur</SelectItem>
                          <SelectItem value="joueur">Joueur</SelectItem>
                          <SelectItem value="arbitre">Arbitre</SelectItem>
                          <SelectItem value="joueur-entraineur">Joueur-Entraineur</SelectItem>
                          <SelectItem value="joueur-arbitre">Joueur-Arbitre</SelectItem>
                          <SelectItem value="entraineur-arbitre">Entraineur-Arbitre</SelectItem>
                          <SelectItem value="les-trois">Les trois</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Équipe</label>
                      <Select
                        value={profile.team}
                        onValueChange={(value) => setProfile({ ...profile, team: value })}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Sélectionnez une équipe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="loisirs">Loisirs</SelectItem>
                          <SelectItem value="d1-masculine">D1 Masculine</SelectItem>
                          <SelectItem value="d1-feminine">D1 Féminine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300">Sport</label>
                      <Select
                        value={profile.sport}
                        onValueChange={(value) => setProfile({ ...profile, sport: value })}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Sélectionnez un sport" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="goalball">Goalball</SelectItem>
                          <SelectItem value="torball">Torball</SelectItem>
                          <SelectItem value="les-deux">Les deux</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
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