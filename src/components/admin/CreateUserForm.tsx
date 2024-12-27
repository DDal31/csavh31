import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/schemas/profileSchema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";
import { UserBasicInfoFields } from "./users/form/UserBasicInfoFields";
import { UserRoleFields } from "./users/form/UserRoleFields";
import { UserTeamFields } from "./users/form/UserTeamFields";
import type { CreateUserData } from "@/types/auth";

interface CreateUserFormProps {
  onSubmit: (data: CreateUserData) => void;
  isLoading: boolean;
  onBack: () => void;
}

const CreateUserForm = ({ onSubmit, isLoading, onBack }: CreateUserFormProps) => {
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

  const handleSubmit = (data: CreateUserData) => {
    console.log("Creating user with data:", data);
    onSubmit(data);
  };

  return (
    <div role="main" aria-label="Formulaire de création d'utilisateur">
      <Button 
        variant="ghost" 
        className="text-white w-fit flex items-center gap-2 hover:text-gray-300 mb-6"
        onClick={onBack}
        aria-label="Retour à la liste des utilisateurs"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour
      </Button>

      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(handleSubmit)} 
          className="space-y-6"
          aria-label="Formulaire de création d'utilisateur"
        >
          <div className="space-y-4">
            <UserBasicInfoFields form={form} isCreating />
            <UserRoleFields form={form} />
            <UserTeamFields form={form} />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
            disabled={isLoading}
            aria-label={isLoading ? "Création en cours..." : "Créer l'utilisateur"}
          >
            {isLoading ? "Création en cours..." : "Créer l'utilisateur"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateUserForm;