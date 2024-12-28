import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { TrainingTypeField } from "./form/TrainingTypeField";
import { TrainingDateField } from "./form/TrainingDateField";
import { TrainingTimeFields } from "./form/TrainingTimeFields";
import { formSchema } from "./form/trainingFormSchema";

type TrainingType = Database["public"]["Enums"]["training_type"];

export function CreateTrainingForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      otherTypeDetails: "",
      startTime: "09:00",
      endTime: "10:30",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Creating training with values:", values);
    setIsLoading(true);
    try {
      const trainingData = {
        type: values.type as TrainingType,
        other_type_details: values.otherTypeDetails || null,
        date: format(values.date, "yyyy-MM-dd"),
        start_time: values.startTime,
        end_time: values.endTime,
      };

      console.log("Submitting training data:", trainingData);
      const { error } = await supabase
        .from("trainings")
        .insert(trainingData);

      if (error) {
        console.error("Error creating training:", error);
        throw error;
      }

      toast({
        title: "Entraînement créé",
        description: "L'entraînement a été ajouté avec succès.",
      });

      form.reset();
    } catch (error) {
      console.error("Error creating training:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'entraînement.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-white">Créer un entraînement</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <TrainingTypeField form={form} />
          <TrainingDateField form={form} />
          <TrainingTimeFields form={form} />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Création en cours..." : "Créer l'entraînement"}
          </Button>
        </form>
      </Form>
    </div>
  );
}