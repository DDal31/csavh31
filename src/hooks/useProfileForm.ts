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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (profileData && user) {
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
      console.error("Erreur lors du chargement du profil:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger votre profil",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      // Mettre à jour le profil dans la table profiles
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

      if (profileError) throw profileError;

      // Mettre à jour l'email et le téléphone dans auth.users
      const { error: userError } = await supabase.auth.updateUser({
        email: values.email,
        phone: values.phone,
        ...(values.password ? { password: values.password } : {}),
      });

      if (userError) throw userError;

      toast({
        title: "Succès",
        description: "Votre profil a été mis à jour",
      });

      navigate("/profile");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
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