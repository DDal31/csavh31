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
            <FormLabel className="text-white font-medium">Type d'entraînement</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-3"
                aria-label="Sélectionnez le type d'entraînement"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="goalball" id="goalball" />
                  <Label htmlFor="goalball" className="text-white cursor-pointer">Goalball</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="torball" id="torball" />
                  <Label htmlFor="torball" className="text-white cursor-pointer">Torball</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="text-white cursor-pointer">Autre</Label>
                </div>
              </RadioGroup>
            </FormControl>
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
                  aria-label="Précisez le type d'entraînement"
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