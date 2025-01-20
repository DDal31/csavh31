import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/schemas/profileSchema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";
import { UserBasicInfoFields } from "./users/form/UserBasicInfoFields";
import { UserRoleFields } from "./users/form/UserRoleFields";
import { UserSportsTeamsFields } from "./users/form/UserSportsTeamsFields";
import { useToast } from "@/hooks/use-toast";
import type { CreateUserData, UserFormData } from "@/types/auth";

interface CreateUserFormProps {
  onSubmit: (data: CreateUserData) => void;
  isLoading: boolean;
  onBack: () => void;
}

const CreateUserForm = ({ onSubmit, isLoading, onBack }: CreateUserFormProps) => {
  const { toast } = useToast();
  const form = useForm<UserFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      club_role: "joueur",
      sport: "Goalball",
      team: "Loisir",
      site_role: "member"
    }
  });

  const handleSubmit = async (data: CreateUserData) => {
    try {
      console.log("Tentative de création d'utilisateur avec les données:", data);
      
      // Validation des champs requis
      if (!data.first_name.trim() || !data.last_name.trim() || !data.email.trim() || !data.password.trim()) {
        toast({
          title: "Erreur de validation",
          description: "Tous les champs obligatoires doivent être remplis",
          variant: "destructive",
        });
        return;
      }

      // Validation de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        toast({
          title: "Erreur de validation",
          description: "L'adresse email n'est pas valide",
          variant: "destructive",
        });
        return;
      }

      // Validation du mot de passe
      if (data.password.length < 6) {
        toast({
          title: "Erreur de validation",
          description: "Le mot de passe doit contenir au moins 6 caractères",
          variant: "destructive",
        });
        return;
      }

      await onSubmit(data);
      
      console.log("Création d'utilisateur réussie");
      toast({
        title: "Succès",
        description: "L'utilisateur a été créé avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'utilisateur. Veuillez réessayer.",
        variant: "destructive",
      });
    }
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
            <UserBasicInfoFields form={form} isCreating={true} />
            <UserRoleFields form={form} />
            <UserSportsTeamsFields form={form} />
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