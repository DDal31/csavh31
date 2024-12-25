import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/schemas/profileSchema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CreateUserData } from "@/types/auth";
import ProfileEditForm from "@/components/ProfileEditForm";

interface CreateUserFormProps {
  onSubmit: (data: CreateUserData) => void;
  isLoading: boolean;
}

const CreateUserForm = ({ onSubmit, isLoading }: CreateUserFormProps) => {
  const form = useForm<CreateUserData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      club_role: "joueur",
      sport: "goalball",
      team: "loisir",
      site_role: "member"
    }
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...form.register("email")}
        type="email"
        placeholder="Email"
      />
      <Input
        {...form.register("password")}
        type="password"
        placeholder="Mot de passe"
      />
      <ProfileEditForm
        profile={{
          id: "",
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          club_role: "joueur",
          sport: "goalball",
          team: "loisir",
          site_role: "member",
          created_at: "",
          updated_at: ""
        }}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </form>
  );
};

export default CreateUserForm;