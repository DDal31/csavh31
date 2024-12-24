import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import type { Profile } from "@/types/profile";
import { Loader2 } from "lucide-react";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      console.log("Fetching profile data...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found, redirecting to login");
        navigate("/login");
        throw new Error("Non connecté");
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      
      console.log("Profile data fetched:", data);
      return data as Profile;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    console.error("Profile error:", error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de charger le profil",
    });
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">Erreur de chargement</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Profil non trouvé</p>
      </div>
    );
  }

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

export default ProfilePage;