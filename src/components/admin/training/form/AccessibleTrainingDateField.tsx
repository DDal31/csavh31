import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { formSchema } from "./trainingFormSchema";

type Props = {
  form: UseFormReturn<z.infer<typeof formSchema>>;
};

export function AccessibleTrainingDateField({ form }: Props) {
  return (
    <FormField
      control={form.control}
      name="date"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-[#9b87f5] font-medium">
            Date de l'entraînement
          </FormLabel>
          <FormControl>
            <Input
              type="date"
              {...field}
              value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
              className="bg-white/10 border-white/20 text-gray-200"
              aria-label="Sélectionnez la date de l'entraînement"
              onChange={(e) => {
                const date = new Date(e.target.value);
                if (!isNaN(date.getTime())) {
                  field.onChange(date);
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}