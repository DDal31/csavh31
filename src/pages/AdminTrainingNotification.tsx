import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NotificationTypeSelector } from "@/components/admin/notifications/form/NotificationTypeSelector";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Training } from "@/types/training";

const notificationSchema = z.object({
  type: z.string(),
  sport: z.string(),
});

export default function AdminTrainingNotification() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const training: Training = state?.training;

  const form = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      type: "training_reminder",
      sport: training?.type || "goalball",
    },
  });

  if (!training) {
    navigate("/admin/trainings");
    return null;
  }

  const title = `Entraînement de ${
    training.type === "other" 
      ? training.other_type_details 
      : training.type
  } du ${format(new Date(training.date), "d MMMM yyyy", { locale: fr })}`;

  const handleSubmit = async (values: z.infer<typeof notificationSchema>) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("notification_history")
        .insert([
          {
            title,
            content: getNotificationContent(values.type, training),
            target_group: "sport_specific",
            sport: values.sport,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Notification envoyée",
        description: "La notification a été envoyée avec succès.",
      });
      
      navigate("/admin/trainings");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la notification.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNotificationContent = (type: string, training: Training): string => {
    switch (type) {
      case "missing_players":
        return `Il manque des joueurs pour l'entraînement de ${
          training.type === "other" ? training.other_type_details : training.type
        } prévu le ${format(new Date(training.date), "d MMMM", { locale: fr })}. Pensez à vous inscrire !`;
      case "training_reminder":
        return `Rappel : entraînement de ${
          training.type === "other" ? training.other_type_details : training.type
        } prévu le ${format(new Date(training.date), "d MMMM", { locale: fr })} de ${
          training.start_time.slice(0, 5)
        } à ${training.end_time.slice(0, 5)}.`;
      case "training_cancelled":
        return `L'entraînement de ${
          training.type === "other" ? training.other_type_details : training.type
        } prévu le ${format(new Date(training.date), "d MMMM", { locale: fr })} est annulé.`;
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/trainings")}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>

          <div className="bg-gray-800 rounded-xl p-8 space-y-6">
            <h1 className="text-2xl font-bold text-white">
              Envoyer une notification
            </h1>

            <div className="text-gray-300 mb-6">
              <p className="font-medium">{title}</p>
              <p>
                Horaire : {training.start_time.slice(0, 5)} - {training.end_time.slice(0, 5)}
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <NotificationTypeSelector
                  value={form.watch("type")}
                  onChange={(value) => form.setValue("type", value)}
                />

                <Button
                  type="submit"
                  className="w-full bg-white/10 hover:bg-white/20 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Envoi en cours..." : "Envoyer la notification"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}