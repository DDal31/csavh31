import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserFormData } from "@/types/auth";

interface UserRoleFieldsProps {
  form: UseFormReturn<UserFormData>;
}

const UserRoleFields = ({ form }: UserRoleFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="club_role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rôle dans le club</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="joueur">Joueur</SelectItem>
                <SelectItem value="entraineur">Entraîneur</SelectItem>
                <SelectItem value="arbitre">Arbitre</SelectItem>
                <SelectItem value="joueur-entraineur">Joueur-Entraîneur</SelectItem>
                <SelectItem value="joueur-arbitre">Joueur-Arbitre</SelectItem>
                <SelectItem value="entraineur-arbitre">Entraîneur-Arbitre</SelectItem>
                <SelectItem value="les-trois">Les Trois</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="site_role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rôle sur le site</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="member">Membre</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default UserRoleFields;