import { useQuery } from "@tanstack/react-query";
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
import { supabase } from "@/integrations/supabase/client";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { formSchema } from "./trainingFormSchema";

type Props = {
  form: UseFormReturn<z.infer<typeof formSchema>>;
};

export function AccessibleTrainingTypeField({ form }: Props) {
  const { data: sports, isLoading } = useQuery({
    queryKey: ["sports"],
    queryFn: async () => {
      console.log("Fetching sports from database...");
      const { data, error } = await supabase
        .from("sports")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching sports:", error);
        throw error;
      }

      console.log("Sports fetched:", data);
      return data;
    },
  });

  if (isLoading) {
    return <div>Chargement des sports...</div>;
  }

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
                {sports?.map((sport) => (
                  <div key={sport.id} className="flex items-center space-x-3">
                    <RadioGroupItem 
                      value={sport.name.toLowerCase()} 
                      id={sport.id} 
                    />
                    <Label 
                      htmlFor={sport.id} 
                      className="text-white cursor-pointer"
                    >
                      {sport.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage className="text-white" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="otherTypeDetails"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-medium">
              Occasion exceptionnelle
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Précisez l'occasion (optionnel)" 
                {...field} 
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                aria-label="Précisez l'occasion exceptionnelle"
              />
            </FormControl>
            <FormMessage className="text-white" />
          </FormItem>
        )}
      />
    </>
  );
}