import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotificationSubmission } from "../instant/useNotificationSubmission";

type NotificationType = "missing_players" | "training_reminder" | "training_cancelled";

const notificationTemplates = {
  missing_players: "Nous manquons de joueurs pour l'entrainement. Venez nombreux !",
  training_reminder: "N'oubliez pas votre entrainement !",
  training_cancelled: "L'entrainement est annulé. Nous nous excusons pour ce désagrément.",
};

export function TrainingNotificationForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { submitNotification, isSubmitting } = useNotificationSubmission();
  const [type, setType] = useState<NotificationType>("training_reminder");
  const [content, setContent] = useState(notificationTemplates.training_reminder);

  const title = searchParams.get("title") || "";
  const trainingId = searchParams.get("trainingId");

  useEffect(() => {
    setContent(notificationTemplates[type]);
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) return;

    try {
      const result = await submitNotification({
        title,
        content,
        targetGroup: "all",
        selectedSport: "",
      });

      if (result.success) {
        navigate(-1);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-6 bg-gray-800 border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-gray-200">
            Titre
          </Label>
          <div
            id="title"
            className="p-3 rounded-md bg-gray-700 border border-gray-600 text-gray-200"
          >
            {title}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type" className="text-gray-200">
            Type de notification
          </Label>
          <Select
            value={type}
            onValueChange={(value) => setType(value as NotificationType)}
          >
            <SelectTrigger
              id="type"
              className="bg-gray-700 border-gray-600 text-gray-200"
            >
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="missing_players" className="text-gray-200">
                Manque de joueurs
              </SelectItem>
              <SelectItem value="training_reminder" className="text-gray-200">
                Rappel d'entraînement
              </SelectItem>
              <SelectItem value="training_cancelled" className="text-gray-200">
                Annulation d'entraînement
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" className="text-gray-200">
            Contenu
          </Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] bg-gray-700 border-gray-600 text-gray-200"
            placeholder="Contenu de la notification..."
            required
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-gray-600 text-gray-200 hover:bg-gray-700"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? "Envoi en cours..." : "Envoyer"}
          </Button>
        </div>
      </form>
    </Card>
  );
}