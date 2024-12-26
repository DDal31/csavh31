import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { TrainingTypeField } from "./form/TrainingTypeField";
import { TrainingDateField } from "./form/TrainingDateField";
import { TrainingTimeFields } from "./form/TrainingTimeFields";

type TrainingType = Database["public"]["Enums"]["training_type"];

const formSchema = z.object({
  type: z.enum(["goalball", "torball", "other"] as const),
  otherTypeDetails: z.string().optional().nullable(),
  date: z.date({
    required_error: "Une date est requise",
  }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Format d'heure invalide (HH:MM)",
  }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Format d'heure invalide (HH:MM)",
  }),
}).refine((data) => {
  if (data.type === "other" && !data.otherTypeDetails) {
    return false;
  }
  return true;
}, {
  message: "Veuillez préciser le type d'entraînement",
  path: ["otherTypeDetails"],
}).refine((data) => {
  const [startHour, startMinute] = data.startTime.split(":").map(Number);
  const [endHour, endMinute] = data.endTime.split(":").map(Number);
  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;
  return endTotal > startTotal;
}, {
  message: "L'heure de fin doit être après l'heure de début",
  path: ["endTime"],
});

export function CreateTrainingForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "goalball",
      otherTypeDetails: "",
      startTime: "09:00",
      endTime: "10:30",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("trainings")
        .insert({
          type: values.type as TrainingType,
          other_type_details: values.type === "other" ? values.otherTypeDetails : null,
          date: format(values.date, "yyyy-MM-dd"),
          start_time: values.startTime,
          end_time: values.endTime,
        });

      if (error) throw error;

      toast({
        title: "Entraînement créé",
        description: "L'entraînement a été ajouté avec succès.",
      });

      form.reset();
    } catch (error) {
      console.error("Erreur lors de la création de l'entraînement:", error);
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