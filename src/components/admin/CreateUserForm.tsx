import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/schemas/profileSchema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
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

  return (
    <>
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" aria-label="Formulaire de création d'utilisateur">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Adresse email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="Entrez l'adresse email" 
                  className="bg-gray-700 border-gray-600 text-white" 
                  aria-label="Champ pour l'adresse email"
                  {...field} 
                />
              </FormControl>
              <FormMessage className="text-red-400" role="alert" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Mot de passe</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Entrez le mot de passe" 
                  className="bg-gray-700 border-gray-600 text-white" 
                  aria-label="Champ pour le mot de passe"
                  {...field} 
                />
              </FormControl>
              <FormMessage className="text-red-400" role="alert" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Prénom</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Entrez le prénom" 
                    className="bg-gray-700 border-gray-600 text-white" 
                    aria-label="Champ pour le prénom"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-400" role="alert" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Nom</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Entrez le nom" 
                    className="bg-gray-700 border-gray-600 text-white" 
                    aria-label="Champ pour le nom"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-400" role="alert" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Téléphone</FormLabel>
              <FormControl>
                <Input 
                  type="tel" 
                  placeholder="Entrez le numéro de téléphone" 
                  className="bg-gray-700 border-gray-600 text-white" 
                  aria-label="Champ pour le numéro de téléphone"
                  {...field} 
                />
              </FormControl>
              <FormMessage className="text-red-400" role="alert" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="club_role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Rôle dans le club</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger 
                      className="bg-gray-700 border-gray-600 text-white"
                      aria-label="Sélectionnez le rôle dans le club"
                    >
                      <SelectValue placeholder="Sélectionnez un rôle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="joueur" className="text-white">Joueur</SelectItem>
                    <SelectItem value="entraineur" className="text-white">Entraîneur</SelectItem>
                    <SelectItem value="arbitre" className="text-white">Arbitre</SelectItem>
                    <SelectItem value="joueur-entraineur" className="text-white">Joueur-Entraîneur</SelectItem>
                    <SelectItem value="joueur-arbitre" className="text-white">Joueur-Arbitre</SelectItem>
                    <SelectItem value="entraineur-arbitre" className="text-white">Entraîneur-Arbitre</SelectItem>
                    <SelectItem value="les-trois" className="text-white">Les trois</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-400" role="alert" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sport"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Sport</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger 
                      className="bg-gray-700 border-gray-600 text-white"
                      aria-label="Sélectionnez le sport pratiqué"
                    >
                      <SelectValue placeholder="Sélectionnez un sport" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="goalball" className="text-white">Goalball</SelectItem>
                    <SelectItem value="torball" className="text-white">Torball</SelectItem>
                    <SelectItem value="both" className="text-white">Les deux</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-400" role="alert" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="team"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Équipe</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger 
                      className="bg-gray-700 border-gray-600 text-white"
                      aria-label="Sélectionnez l'équipe"
                    >
                      <SelectValue placeholder="Sélectionnez une équipe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="loisir" className="text-white">Loisir</SelectItem>
                    <SelectItem value="d1_masculine" className="text-white">D1 Masculine</SelectItem>
                    <SelectItem value="d1_feminine" className="text-white">D1 Féminine</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-400" role="alert" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="site_role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Rôle sur le site</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger 
                      className="bg-gray-700 border-gray-600 text-white"
                      aria-label="Sélectionnez le rôle sur le site"
                    >
                      <SelectValue placeholder="Sélectionnez un rôle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="member" className="text-white">Membre</SelectItem>
                    <SelectItem value="admin" className="text-white">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-400" role="alert" />
              </FormItem>
            )}
          />
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
    </>
  );
};

export default CreateUserForm;