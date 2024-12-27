import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { CreateUserData, AdminUserEditData } from "@/types/auth";

interface UserBasicInfoFieldsProps {
  form: UseFormReturn<CreateUserData> | UseFormReturn<AdminUserEditData>;
  isCreating: boolean;
}

export const UserBasicInfoFields = ({ form, isCreating }: UserBasicInfoFieldsProps) => {
  return (
    <>
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

      {isCreating && (
        <FormField
          control={(form as UseFormReturn<CreateUserData>).control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300" htmlFor="password">Mot de passe</FormLabel>
              <FormControl>
                <Input 
                  id="password"
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
      )}

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
    </>
  );
};