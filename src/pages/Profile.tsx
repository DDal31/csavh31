import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import type { Profile } from "@/types/profile";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Non connecté");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de charger le profil",
    });
    return <div>Erreur de chargement</div>;
  }
  if (!profile) return <div>Profil non trouvé</div>;

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Mon Profil</CardTitle>
          <Button onClick={() => navigate("/profile/edit")}>Modifier</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Informations personnelles</h3>
            <p>Prénom: {profile.first_name}</p>
            <p>Nom: {profile.last_name}</p>
            <p>Email: {profile.email}</p>
            <p>Téléphone: {profile.phone || "Non renseigné"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Informations sportives</h3>
            <p>Rôle dans le club: {profile.club_role}</p>
            <p>Sport: {profile.sport}</p>
            <p>Équipe: {profile.team}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;