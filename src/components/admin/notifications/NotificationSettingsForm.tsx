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

interface NotificationSetting {
  id?: string;
  type: string;
  notification_type: "training_reminder" | "low_participation" | "manual";
  delay_hours: number;
  enabled: boolean;
  sport?: string;
  target_group?: "all" | "sport_specific" | "registered_only";
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
      notification_type: "manual",
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
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">
        {setting ? "Modifier" : "Ajouter"} des Paramètres de Notification
      </h2>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type de Notification</Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification_type">Catégorie</Label>
            <Select
              value={formData.notification_type}
              onValueChange={(value: any) =>
                setFormData((prev) => ({ ...prev, notification_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="training_reminder">
                  Rappel d'entraînement
                </SelectItem>
                <SelectItem value="low_participation">
                  Participation faible
                </SelectItem>
                <SelectItem value="manual">Manuel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delay_hours">Délai (heures)</Label>
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_group">Groupe Cible</Label>
            <Select
              value={formData.target_group}
              onValueChange={(value: any) =>
                setFormData((prev) => ({ ...prev, target_group: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="sport_specific">Sport spécifique</SelectItem>
                <SelectItem value="registered_only">
                  Inscrits uniquement
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.target_group === "sport_specific" && (
            <div className="space-y-2">
              <Label htmlFor="sport">Sport</Label>
              <Input
                id="sport"
                value={formData.sport || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, sport: e.target.value }))
                }
                required
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="enabled"
            checked={formData.enabled}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, enabled: checked }))
            }
          />
          <Label htmlFor="enabled">Activer les notifications</Label>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>
    </form>
  );
}