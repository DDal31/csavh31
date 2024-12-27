import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormData } from "@/schemas/profileSchema";
import { BasicInfoFields } from "./profile/BasicInfoFields";
import { RoleFields } from "./profile/RoleFields";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/profile";

interface ProfileEditFormProps {
  profile: Profile;
  onSubmit: (data: ProfileFormData) => void;
  isLoading: boolean;
  isAdmin?: boolean;
}

const ProfileEditForm = ({ profile, onSubmit, isLoading, isAdmin = false }: ProfileEditFormProps) => {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      phone: profile.phone || "",
      club_role: profile.club_role,
      sport: profile.sport,
      team: profile.team,
      site_role: profile.site_role
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" aria-label="Formulaire de modification du profil">
        <BasicInfoFields form={form} />
        <RoleFields form={form} isAdmin={isAdmin} />
        
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full"
          aria-label={isLoading ? "Enregistrement en cours..." : "Enregistrer les modifications"}
        >
          {isLoading ? "Enregistrement en cours..." : "Enregistrer les modifications"}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileEditForm;