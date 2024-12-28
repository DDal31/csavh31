import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { AccessibleTrainingTypeField } from "./form/AccessibleTrainingTypeField";
import { AccessibleTrainingDateField } from "./form/AccessibleTrainingDateField";
import { AccessibleTrainingTimeFields } from "./form/AccessibleTrainingTimeFields";
import { formSchema } from "./form/trainingFormSchema";
import type { Database } from "@/integrations/supabase/types";

type Training = Database["public"]["Tables"]["trainings"]["Row"];

type TrainingFormProps = {
  training?: Training | null;
  onSuccess: () => void;
  onCancel: () => void;
};

export function TrainingForm({ training, onSuccess, onCancel }: TrainingFormProps) {
  const { toast } = useToast();
  const isEditing = !!training;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: training?.type || "goalball",
      otherTypeDetails: training?.other_type_details || "",
      date: training ? new Date(training.date) : undefined,
      startTime: training?.start_time.slice(0, 5) || "09:00",
      endTime: training?.end_time.slice(0, 5) || "10:30",
    },
  });

  console.log("Form values:", form.getValues());
  console.log("Form errors:", form.formState.errors);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(`${isEditing ? "Updating" : "Creating"} training with values:`, values);
      
      if (!values.date) {
        console.error("Date is required but missing");
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "La date est requise",
        });
        return;
      }

      const trainingData = {
        type: values.type,
        other_type_details: values.otherTypeDetails || null,
        date: format(values.date, "yyyy-MM-dd"),
        start_time: values.startTime,
        end_time: values.endTime,
      };

      console.log("Submitting training data:", trainingData);

      const { error } = isEditing 
        ? await supabase
            .from("trainings")
            .update(trainingData)
            .eq("id", training.id)
        : await supabase
            .from("trainings")
            .insert(trainingData);

      if (error) {
        console.error("Error submitting training:", error);
        throw error;
      }

      console.log(`Training ${isEditing ? "updated" : "created"} successfully`);
      toast({
        title: `Entraînement ${isEditing ? "modifié" : "créé"}`,
        description: `L'entraînement a été ${isEditing ? "modifié" : "ajouté"} avec succès.`,
      });

      onSuccess();
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "creating"} training:`, error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Une erreur est survenue lors de la ${isEditing ? "modification" : "création"} de l'entraînement.`,
      });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">
          {isEditing ? "Modifier l'entraînement" : "Créer un entraînement"}
        </h2>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="border-white/20 text-white hover:bg-white/10"
          aria-label="Retour à la liste des entraînements"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 shadow-xl">
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="space-y-6"
            aria-label={`Formulaire pour ${isEditing ? "modifier" : "créer"} un entraînement`}
          >
            <AccessibleTrainingTypeField form={form} />
            <AccessibleTrainingDateField form={form} />
            <AccessibleTrainingTimeFields form={form} />
            
            <Button 
              type="submit" 
              className="w-full bg-white/10 hover:bg-white/20 text-white"
              aria-label={isEditing ? "Modifier l'entraînement" : "Créer l'entraînement"}
            >
              {isEditing ? "Modifier l'entraînement" : "Créer l'entraînement"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}