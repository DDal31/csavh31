import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { formSchema } from "./trainingFormSchema";

type Props = {
  form: UseFormReturn<z.infer<typeof formSchema>>;
};

export function AccessibleTrainingTypeField({ form }: Props) {
  const selectedType = form.watch("type");

  return (
    <>
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-[#9b87f5] font-medium">Type d'entraînement</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
                aria-label="Sélectionnez le type d'entraînement"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="goalball" id="goalball" />
                  <Label htmlFor="goalball">Goalball</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="torball" id="torball" />
                  <Label htmlFor="torball">Torball</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Autre</Label>
                </div>
              </RadioGroup>
            </FormControl>
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
              <FormLabel className="text-[#9b87f5] font-medium">
                Précisez le type d'entraînement
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Type d'entraînement" 
                  {...field} 
                  className="bg-white/10 border-white/20 text-gray-200 placeholder:text-gray-400"
                  aria-label="Précisez le type d'entraînement"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}