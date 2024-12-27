import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { ProfileFormData } from "@/schemas/profileSchema";

interface RoleFieldsProps {
  form: UseFormReturn<ProfileFormData>;
  isAdmin: boolean;
}

export const RoleFields = ({ form, isAdmin }: RoleFieldsProps) => {
  return (
    <>
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
                disabled={!isAdmin}
                aria-label="Votre rôle sur le site"
                className={`${!isAdmin ? "bg-gray-700 cursor-not-allowed" : ""}`}
                readOnly={!isAdmin}
              />
            </FormControl>
            <FormMessage role="alert" />
          </FormItem>
        )}
      />
    </>
  );
};