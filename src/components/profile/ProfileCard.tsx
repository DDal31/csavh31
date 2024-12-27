import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { profileSchema } from "@/schemas/profileSchema";
import type { Profile } from "@/types/profile";
import type { ProfileFormData } from "@/schemas/profileSchema";

export interface ProfileCardProps {
  profile: Profile;
  isLoading?: boolean;
  onSubmit: (data: ProfileFormData) => void;
}

export const ProfileCard = ({ profile, isLoading, onSubmit }: ProfileCardProps) => {
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
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-6"
        aria-label={`Formulaire de modification pour ${profile.first_name} ${profile.last_name}`}
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300" htmlFor="email">Adresse email</FormLabel>
                <FormControl>
                  <Input 
                    id="email"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300" htmlFor="first_name">Prénom</FormLabel>
                  <FormControl>
                    <Input 
                      id="first_name"
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
                  <FormLabel className="text-gray-300" htmlFor="last_name">Nom</FormLabel>
                  <FormControl>
                    <Input 
                      id="last_name"
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
                <FormLabel className="text-gray-300" htmlFor="phone">Téléphone</FormLabel>
                <FormControl>
                  <Input 
                    id="phone"
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
};
