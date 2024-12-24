import { supabase } from "@/integrations/supabase/client";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "./profileFormSchema";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const submitProfile = (
  toast: ReturnType<typeof useToast>['toast'], 
  navigate: ReturnType<typeof useNavigate>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => async (values: ProfileFormValues) => {
  try {
    console.log("Submitting form with values:", values);
    setLoading(true);
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error("Session error:", sessionError);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Session expirée, veuillez vous reconnecter",
      });
      navigate("/login");
      return;
    }

    // Update profile data first
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name: values.first_name,
        last_name: values.last_name,
        club_role: values.club_role,
        sport: values.sport,
        team: values.team,
      })
      .eq("id", session.user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      throw profileError;
    }

    // Then update user data
    const updateUserData: any = {
      email: values.email,
      phone: values.phone,
    };

    if (values.password && values.password.length > 0) {
      updateUserData.password = values.password;
    }

    const { error: userError } = await supabase.auth.updateUser(updateUserData);

    if (userError) {
      console.error("Error updating user:", userError);
      throw userError;
    }

    console.log("Profile updated successfully");
    toast({
      title: "Succès",
      description: "Votre profil a été mis à jour",
    });

    navigate("/profile");
  } catch (error) {
    console.error("Error in form submission:", error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de mettre à jour votre profil",
    });
  } finally {
    setLoading(false);
  }
};
