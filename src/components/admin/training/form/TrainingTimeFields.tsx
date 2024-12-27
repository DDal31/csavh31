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

export function TrainingTimeFields({ form }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="startTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-medium">Heure de début</FormLabel>
            <FormControl>
              <Input 
                type="time" 
                {...field} 
                className="bg-white/10 border-white/20 text-white"
              />
            </FormControl>
            <FormMessage className="text-white" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="endTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-medium">Heure de fin</FormLabel>
            <FormControl>
              <Input 
                type="time" 
                {...field} 
                className="bg-white/10 border-white/20 text-white"
              />
            </FormControl>
            <FormMessage className="text-white" />
          </FormItem>
        )}
      />
    </div>
  );
}