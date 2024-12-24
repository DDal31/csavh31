import { supabase } from "@/integrations/supabase/client";
import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "./profileFormSchema";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const loadProfile = (
  form: UseFormReturn<ProfileFormValues>, 
  toast: ReturnType<typeof useToast>['toast'], 
  navigate: ReturnType<typeof useNavigate>, 
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => async () => {
  try {
    console.log("Loading profile data...");
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      navigate("/login");
      return;
    }

    if (!session) {
      console.log("No session found, redirecting to login");
      navigate("/login");
      return;
    }

    console.log("Fetching profile data for user:", session.user.id);
    
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger votre profil",
      });
      return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error fetching user:", userError);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger vos informations utilisateur",
      });
      return;
    }

    if (profileData && user) {
      console.log("Setting form data with profile:", profileData);
      form.reset({
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        club_role: profileData.club_role,
        sport: profileData.sport,
        team: profileData.team,
      });
    }
  } catch (error) {
    console.error("Error in loadProfile:", error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Une erreur est survenue lors du chargement de votre profil",
    });
  } finally {
    setLoading(false);
  }
};
