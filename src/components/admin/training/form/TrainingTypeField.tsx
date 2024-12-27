import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { formSchema } from "./trainingFormSchema";

type Props = {
  form: UseFormReturn<z.infer<typeof formSchema>>;
};

export function TrainingTypeField({ form }: Props) {
  const selectedType = form.watch("type");

  return (
    <>
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-medium">Type d'entraînement</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="goalball">Goalball</SelectItem>
                <SelectItem value="torball">Torball</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-white" />
          </FormItem>
        )}
      />

      {selectedType === "other" && (
        <FormField
          control={form.control}
          name="otherTypeDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-medium">
                Précisez le type d'entraînement
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Type d'entraînement" 
                  {...field} 
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </FormControl>
              <FormMessage className="text-white" />
            </FormItem>
          )}
        />
      )}
    </>
  );
}