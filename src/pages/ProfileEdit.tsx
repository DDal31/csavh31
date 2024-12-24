import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import type { Profile } from "@/types/profile";
import type { ProfileFormValues } from "@/schemas/profileSchema";
import { Loader2 } from "lucide-react";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return null;
      }

      console.log("Fetching profile for edit:", user.id);
      const { data, error } = await supabase
        .from("profiles")
        .select()
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile for edit:", error);
        throw error;
      }

      if (!data) {
        console.log("No profile found for edit:", user.id);
        return null;
      }

      console.log("Profile data fetched for edit:", data);
      return data as Profile;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const mutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      console.log("Updating profile with values:", values);
      const { data, error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", user.id)
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

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Profil non trouvé</p>
        <button onClick={() => navigate("/profile")} className="mt-4">
          Retour
        </button>
      </div>
    );
  }

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