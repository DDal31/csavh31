import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  email: z.string().email("Email invalide"),
  phone: z.string().nullable(),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères").optional(),
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  club_role: z.enum(["joueur", "entraineur", "arbitre", "staff"]),
  sport: z.enum(["goalball", "torball", "both"]),
  team: z.enum(["loisir", "d1_masculine", "d1_feminine"]),
});

export type ProfileFormValues = z.infer<typeof formSchema>;

export const useProfileForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      phone: "",
      password: "",
      first_name: "",
      last_name: "",
      club_role: "joueur",
      sport: "goalball",
      team: "loisir",
    },
  });

  const loadProfile = async () => {
    try {
      console.log("Loading profile data...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw sessionError;
      }

      if (!session) {
        console.log("No session found, redirecting to login");
        navigate("/login");
        return;
      }

      const [profileResponse, userResponse] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle(),
        supabase.auth.getUser()
      ]);

      if (profileResponse.error) {
        console.error("Error fetching profile:", profileResponse.error);
        throw profileResponse.error;
      }

      if (userResponse.error) {
        console.error("Error fetching user:", userResponse.error);
        throw userResponse.error;
      }

      const profileData = profileResponse.data;
      const userData = userResponse.data.user;

      if (profileData && userData) {
        console.log("Setting form data with profile:", profileData);
        form.reset({
          email: userData.email || "",
          phone: userData.phone || "",
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
        description: "Impossible de charger votre profil",
      });
      navigate("/profile");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      console.log("Submitting form with values:", values);
      setLoading(true);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw sessionError;
      }

      if (!session) {
        console.error("No session found during form submission");
        throw new Error("Non authentifié");
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

  return {
    form,
    loading,
    loadProfile,
    onSubmit,
  };
};