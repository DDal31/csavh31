import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { UserBasicInfoFields } from "./UserBasicInfoFields";
import { UserRoleFields } from "./UserRoleFields";
import { UserTeamFields } from "./UserTeamFields";
import { profileSchema } from "@/schemas/profileSchema";
import type { Profile } from "@/types/profile";
import type { AdminUserEditData } from "@/types/auth";

interface AdminUserEditFormProps {
  profile: Profile;
  onSubmit: (data: Omit<Profile, "id" | "created_at" | "updated_at">) => void;
  isLoading: boolean;
}

export function AdminUserEditForm({ profile, onSubmit, isLoading }: AdminUserEditFormProps) {
  const form = useForm<AdminUserEditData>({
    resolver: zodResolver(profileSchema.omit({ id: true, password: true })),
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
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-6"
        aria-label={`Formulaire de modification pour ${profile.first_name} ${profile.last_name}`}
      >
        <div className="space-y-4">
          <UserBasicInfoFields form={form} />
          <UserRoleFields form={form} />
          <UserTeamFields form={form} />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
          disabled={isLoading}
          aria-label={isLoading ? "Enregistrement en cours..." : "Enregistrer les modifications"}
        >
          {isLoading ? "Enregistrement en cours..." : "Enregistrer les modifications"}
        </Button>
      </form>
    </Form>
  );
}