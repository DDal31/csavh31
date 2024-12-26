import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface TrainingTypeFieldProps {
  form: UseFormReturn<any>;
}

export function TrainingTypeField({ form }: TrainingTypeFieldProps) {
  const selectedType = form.watch("type");

  return (
    <>
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type d'entraînement</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="goalball">Goalball</SelectItem>
                <SelectItem value="torball">Torball</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedType === "other" && (
        <FormField
          control={form.control}
          name="otherTypeDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Précisez le type d'entraînement</FormLabel>
              <FormControl>
                <Input placeholder="Type d'entraînement" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}