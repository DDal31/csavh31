import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      try {
        console.log("Fetching profile data for editing, user:", session.user.id);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile for edit:", error);
          throw error;
        }

        console.log("Profile data retrieved for editing:", data);
        setProfile(data);
      } catch (error) {
        console.error("Error loading profile for edit:", error);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      console.log("Updating profile with data:", profile);
      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", profile.id);

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      console.log("Profile updated successfully");
      toast({
        title: "Succès",
        description: "Votre profil a été mis à jour",
      });
      navigate("/profile");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    field: keyof Profile,
    value: string
  ) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Button
              variant="ghost"
              className="text-white hover:bg-gray-800"
              onClick={() => navigate("/profile")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="bg-white/10 border-none backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">
                  Modifier mon profil
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-400">
                    Prénom
                  </label>
                  <Input
                    value={profile?.first_name || ""}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-400">
                    Nom
                  </label>
                  <Input
                    value={profile?.last_name || ""}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-400">
                    Email
                  </label>
                  <Input
                    value={profile?.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-400">
                    Téléphone
                  </label>
                  <Input
                    value={profile?.phone || ""}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-400">
                    Rôle dans le club
                  </label>
                  <Select
                    value={profile?.club_role}
                    onValueChange={(value) => handleChange("club_role", value)}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Sélectionnez votre rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="joueur">Joueur</SelectItem>
                      <SelectItem value="entraineur">Entraîneur</SelectItem>
                      <SelectItem value="arbitre">Arbitre</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-400">
                    Sport
                  </label>
                  <Select
                    value={profile?.sport}
                    onValueChange={(value) => handleChange("sport", value)}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Sélectionnez votre sport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goalball">Goalball</SelectItem>
                      <SelectItem value="torball">Torball</SelectItem>
                      <SelectItem value="both">Les deux</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-400">
                    Équipe
                  </label>
                  <Select
                    value={profile?.team}
                    onValueChange={(value) => handleChange("team", value)}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Sélectionnez votre équipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="loisir">Loisir</SelectItem>
                      <SelectItem value="d1_masculine">D1 Masculine</SelectItem>
                      <SelectItem value="d1_feminine">D1 Féminine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 mt-4"
                  disabled={saving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditProfile;