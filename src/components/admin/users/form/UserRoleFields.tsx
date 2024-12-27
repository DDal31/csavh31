import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { CreateUserData } from "@/types/auth";

interface UserRoleFieldsProps {
  form: UseFormReturn<CreateUserData>;
}

export const UserRoleFields = ({ form }: UserRoleFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="club_role"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300" htmlFor="club_role">Rôle dans le club</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger 
                  id="club_role"
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
            <FormLabel className="text-gray-300" htmlFor="sport">Sport</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger 
                  id="sport"
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
  );
};