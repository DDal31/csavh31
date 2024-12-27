import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { ProfileFormData } from "@/schemas/profileSchema";

interface BasicInfoFieldsProps {
  form: UseFormReturn<ProfileFormData>;
}

export const BasicInfoFields = ({ form }: BasicInfoFieldsProps) => {
  return (
    <>
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
    </>
  );
};