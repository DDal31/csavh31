import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormData } from "@/schemas/profileSchema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Profile } from "@/types/profile";

interface ProfileEditFormProps {
  profile: Profile;
  onSubmit: (data: ProfileFormData) => void;
  isLoading: boolean;
}

const ProfileEditForm = ({ profile, onSubmit, isLoading }: ProfileEditFormProps) => {
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
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Prénom</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Votre prénom" 
                  aria-label="Champ pour votre prénom"
                  {...field} 
                />
              </FormControl>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Nom de famille</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Votre nom de famille" 
                  aria-label="Champ pour votre nom de famille"
                  {...field} 
                />
              </FormControl>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Adresse e-mail</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="votre@email.com" 
                  aria-label="Champ pour votre adresse email"
                  {...field} 
                />
              </FormControl>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Numéro de téléphone</FormLabel>
              <FormControl>
                <Input 
                  type="tel" 
                  placeholder="06 12 34 56 78" 
                  aria-label="Champ pour votre numéro de téléphone"
                  {...field} 
                />
              </FormControl>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="club_role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Rôle dans le club</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger aria-label="Sélectionnez votre rôle dans le club">
                    <SelectValue placeholder="Sélectionnez votre rôle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="joueur">Joueur</SelectItem>
                  <SelectItem value="entraineur">Entraîneur</SelectItem>
                  <SelectItem value="arbitre">Arbitre</SelectItem>
                  <SelectItem value="joueur-entraineur">Joueur-Entraîneur</SelectItem>
                  <SelectItem value="joueur-arbitre">Joueur-Arbitre</SelectItem>
                  <SelectItem value="entraineur-arbitre">Entraîneur-Arbitre</SelectItem>
                  <SelectItem value="les-trois">Les trois</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sport"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Sport pratiqué</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger aria-label="Sélectionnez votre sport">
                    <SelectValue placeholder="Sélectionnez votre sport" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="goalball">Goalball</SelectItem>
                  <SelectItem value="torball">Torball</SelectItem>
                  <SelectItem value="both">Les deux</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="team"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Équipe</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger aria-label="Sélectionnez votre équipe">
                    <SelectValue placeholder="Sélectionnez votre équipe" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="loisir">Loisir</SelectItem>
                  <SelectItem value="d1_masculine">D1 Masculine</SelectItem>
                  <SelectItem value="d1_feminine">D1 Féminine</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="site_role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Rôle sur le site</FormLabel>
              <FormControl>
                <Input 
                  value={field.value === "admin" ? "Administrateur" : "Membre"} 
                  disabled 
                  aria-label="Votre rôle sur le site (non modifiable)"
                  className="bg-gray-700 cursor-not-allowed"
                />
              </FormControl>
              <FormMessage role="alert" />
            </FormItem>
          )}
        />

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