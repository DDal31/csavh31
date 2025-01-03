import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Bell, BellOff, Info } from "lucide-react";

interface NotificationSetting {
  id?: string;
  type: string;
  notification_type: "training_reminder" | "missing_players" | "custom";
  delay_hours: number;
  enabled: boolean;
  sport?: string;
  target_group?: "all" | "sport_specific" | "training_registered";
  sound_path?: string;
  logo_path?: string;
  created_at?: string;
  updated_at?: string;
}

interface NotificationSettingsFormProps {
  setting?: NotificationSetting | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function NotificationSettingsForm({
  setting,
  onSuccess,
  onCancel,
}: NotificationSettingsFormProps) {
  const [formData, setFormData] = useState<NotificationSetting>(
    setting || {
      type: "",
      notification_type: "training_reminder",
      delay_hours: 24,
      enabled: true,
      target_group: "all",
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (setting?.id) {
        const { error } = await supabase
          .from("notification_settings")
          .update(formData)
          .eq("id", setting.id);

        if (error) throw error;
        toast({
          title: "Paramètres mis à jour",
          description: "Les paramètres de notification ont été mis à jour avec succès.",
        });
      } else {
        const { error } = await supabase
          .from("notification_settings")
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Paramètres créés",
          description: "Les nouveaux paramètres de notification ont été créés avec succès.",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
      onSuccess();
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde des paramètres.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-gray-900 rounded-lg shadow-lg border border-gray-800 p-6"
      role="form"
      aria-label="Formulaire de paramètres de notification"
    >
      <div className="flex items-center gap-3 mb-6">
        {setting?.enabled ? (
          <Bell className="h-6 w-6 text-primary" aria-hidden="true" />
        ) : (
          <BellOff className="h-6 w-6 text-gray-400" aria-hidden="true" />
        )}
        <h2 className="text-xl font-semibold text-white">
          {setting ? "Modifier" : "Ajouter"} des Paramètres de Notification
        </h2>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-gray-200">
              Type de Notification
              <span className="text-red-400 ml-1" aria-hidden="true">*</span>
            </Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              required
              aria-required="true"
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Ex: Rappel d'entraînement"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification_type" className="text-gray-200">
              Catégorie
              <span className="text-red-400 ml-1" aria-hidden="true">*</span>
            </Label>
            <Select
              value={formData.notification_type}
              onValueChange={(value: any) =>
                setFormData((prev) => ({ ...prev, notification_type: value }))
              }
            >
              <SelectTrigger 
                id="notification_type"
                className="bg-gray-800 border-gray-700 text-white"
              >
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="training_reminder" className="text-white">
                  Rappel d'entraînement
                </SelectItem>
                <SelectItem value="missing_players" className="text-white">
                  Joueurs manquants
                </SelectItem>
                <SelectItem value="custom" className="text-white">
                  Personnalisé
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delay_hours" className="text-gray-200">
              Délai (heures)
              <span className="text-red-400 ml-1" aria-hidden="true">*</span>
            </Label>
            <Input
              id="delay_hours"
              type="number"
              min="0"
              value={formData.delay_hours}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  delay_hours: parseInt(e.target.value),
                }))
              }
              required
              aria-required="true"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_group" className="text-gray-200">
              Groupe Cible
              <span className="text-red-400 ml-1" aria-hidden="true">*</span>
            </Label>
            <Select
              value={formData.target_group}
              onValueChange={(value: any) =>
                setFormData((prev) => ({ ...prev, target_group: value }))
              }
            >
              <SelectTrigger 
                id="target_group"
                className="bg-gray-800 border-gray-700 text-white"
              >
                <SelectValue placeholder="Sélectionnez un groupe cible" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white">
                  Tous
                </SelectItem>
                <SelectItem value="sport_specific" className="text-white">
                  Sport spécifique
                </SelectItem>
                <SelectItem value="training_registered" className="text-white">
                  Inscrits uniquement
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.target_group === "sport_specific" && (
            <div className="space-y-2">
              <Label htmlFor="sport" className="text-gray-200">
                Sport
                <span className="text-red-400 ml-1" aria-hidden="true">*</span>
              </Label>
              <Input
                id="sport"
                value={formData.sport || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, sport: e.target.value }))
                }
                required
                aria-required="true"
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Ex: Goalball"
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 py-4">
          <Switch
            id="enabled"
            checked={formData.enabled}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, enabled: checked }))
            }
            aria-label="Activer les notifications"
          />
          <Label 
            htmlFor="enabled" 
            className="text-gray-200 cursor-pointer select-none"
          >
            Activer les notifications
          </Label>
          <Info 
            className="h-4 w-4 text-gray-400" 
            aria-hidden="true"
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="bg-transparent border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>
    </form>
  );
}