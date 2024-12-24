import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import type { Profile } from "@/types/profile";
import type { ProfileFormValues } from "@/schemas/profileSchema";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Non connecté");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      return data as Profile;
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Non connecté");

      console.log("Updating profile with values:", values);
      const { data, error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", user.user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Profil mis à jour",
        description: "Vos modifications ont été enregistrées",
      });
      navigate("/profile");
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le profil. Veuillez réessayer.",
      });
    },
  });

  if (isLoadingProfile) return <div>Chargement...</div>;
  
  if (profileError) {
    console.error("Profile error:", profileError);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de charger le profil",
    });
    return <div>Erreur de chargement</div>;
  }
  
  if (!profile) return <div>Profil non trouvé</div>;

  const handleSubmit = (values: ProfileFormValues) => {
    console.log("Form submitted with values:", values);
    mutation.mutate(values);
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Modifier mon profil</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileEditForm
            profile={profile}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/profile")}
            isLoading={mutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileEdit;