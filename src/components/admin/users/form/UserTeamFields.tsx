import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { UserFormData } from "@/types/auth";

interface UserTeamFieldsProps {
  form: UseFormReturn<UserFormData>;
}

export const UserTeamFields = ({ form }: UserTeamFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="team"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300" htmlFor="team">Équipe</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger 
                  id="team"
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
            <FormLabel className="text-gray-300" htmlFor="site_role">Rôle sur le site</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger 
                  id="site_role"
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
  );
};