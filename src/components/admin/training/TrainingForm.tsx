import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { TrainingTypeField } from "./form/TrainingTypeField";
import { TrainingDateField } from "./form/TrainingDateField";
import { TrainingTimeFields } from "./form/TrainingTimeFields";
import { formSchema } from "./form/trainingFormSchema";
import type { Database } from "@/integrations/supabase/types";

type Training = Database["public"]["Tables"]["trainings"]["Row"];
type TrainingType = Database["public"]["Enums"]["training_type"];

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
      type: (training?.type as TrainingType) || "goalball",
      otherTypeDetails: training?.other_type_details || "",
      date: training ? new Date(training.date) : undefined,
      startTime: training?.start_time.slice(0, 5) || "09:00",
      endTime: training?.end_time.slice(0, 5) || "10:30",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(`${isEditing ? "Updating" : "Creating"} training with values:`, values);
      
      const trainingData = {
        type: values.type as TrainingType,
        other_type_details: values.type === "other" ? values.otherTypeDetails : null,
        date: format(values.date, "yyyy-MM-dd"),
        start_time: values.startTime,
        end_time: values.endTime,
      };

      const { error } = isEditing 
        ? await supabase
            .from("trainings")
            .update(trainingData)
            .eq("id", training.id)
        : await supabase
            .from("trainings")
            .insert(trainingData);

      if (error) throw error;

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
        <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          {isEditing ? "Modifier l'entraînement" : "Créer un entraînement"}
        </h2>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="border-[#9b87f5] text-[#9b87f5] hover:bg-[#9b87f5] hover:text-white flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 shadow-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TrainingTypeField form={form} />
            <TrainingDateField form={form} />
            <TrainingTimeFields form={form} />
            
            <Button 
              type="submit" 
              className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white mt-8"
            >
              {isEditing ? "Modifier l'entraînement" : "Créer l'entraînement"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}