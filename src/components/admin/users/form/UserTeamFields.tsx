import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserFormData } from "@/types/auth";

interface UserTeamFieldsProps {
  form: UseFormReturn<UserFormData>;
}

const UserTeamFields = ({ form }: UserTeamFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="sport"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sport</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un sport" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="goalball">Goalball</SelectItem>
                <SelectItem value="torball">Torball</SelectItem>
                <SelectItem value="both">Les Deux</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="team"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Équipe</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une équipe" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="loisir">Loisir</SelectItem>
                <SelectItem value="d1_masculine">D1 Masculine</SelectItem>
                <SelectItem value="d1_feminine">D1 Féminine</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default UserTeamFields;