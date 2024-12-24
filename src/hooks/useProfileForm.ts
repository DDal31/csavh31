import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "./useProfileForm/profileFormSchema";
import { loadProfile } from "./useProfileForm/loadProfile";
import { submitProfile } from "./useProfileForm/submitProfile";

// Re-export the type from the schema file
export type { ProfileFormValues } from "./useProfileForm/profileFormSchema";

export const useProfileForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const form = useForm({
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

  const onLoadProfile = loadProfile(form, toast, navigate, setLoading);
  const onSubmit = submitProfile(toast, navigate, setLoading);

  return {
    form,
    loading,
    loadProfile: onLoadProfile,
    onSubmit,
  };
};