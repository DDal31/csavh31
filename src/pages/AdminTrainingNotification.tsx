import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Training } from "@/types/training";

const notificationSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  type: z.enum(["missing_players", "reminder", "cancellation"], {
    required_error: "Veuillez sélectionner un type de notification",
  }),
  sport: z.enum(["goalball", "torball", "multi"], {
    required_error: "Veuillez sélectionner un sport",
  }),
});

type NotificationForm = z.infer<typeof notificationSchema>;

export default function AdminTrainingNotification() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const training = location.state?.training as Training;

  if (!training) {
    navigate("/admin/trainings");
    return null;
  }

  const form = useForm<NotificationForm>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: `Entraînement de ${training.type} du ${format(new Date(training.date), "d MMMM yyyy", { locale: fr })}`,
      type: "reminder",
      sport: training.type === "other" ? "multi" : training.type,
    },
  });

  const onSubmit = async (data: NotificationForm) => {
    try {
      // TODO: Implement notification sending logic
      console.log("Sending notification:", data);
      
      toast({
        title: "Notification envoyée",
        description: "La notification a été envoyée avec succès.",
      });
      
      navigate("/admin/trainings");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la notification.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6 text-white hover:text-gray-300"
            onClick={() => navigate("/admin/trainings")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux entraînements
          </Button>

          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <h1 className="text-2xl font-bold text-white mb-6">
              Envoyer une notification
            </h1>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Titre</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Type de message</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="missing_players">
                            Manque de joueurs inscrits
                          </SelectItem>
                          <SelectItem value="reminder">
                            Rappel de l'entraînement
                          </SelectItem>
                          <SelectItem value="cancellation">
                            Annulation de l'entraînement
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Sport</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Sélectionnez un sport" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="goalball">Goalball</SelectItem>
                          <SelectItem value="torball">Torball</SelectItem>
                          <SelectItem value="multi">Multi-sports</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Envoyer la notification
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}