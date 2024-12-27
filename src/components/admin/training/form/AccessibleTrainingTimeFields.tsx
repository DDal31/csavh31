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

export function AccessibleTrainingTimeFields({ form }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="startTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[#9b87f5] font-medium">Heure de début</FormLabel>
            <FormControl>
              <Input 
                type="time" 
                {...field} 
                className="bg-white/10 border-white/20 text-gray-200"
                aria-label="Sélectionnez l'heure de début"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="endTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[#9b87f5] font-medium">Heure de fin</FormLabel>
            <FormControl>
              <Input 
                type="time" 
                {...field} 
                className="bg-white/10 border-white/20 text-gray-200"
                aria-label="Sélectionnez l'heure de fin"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}