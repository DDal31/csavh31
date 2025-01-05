import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Bell, BellOff, Info } from "lucide-react";
import { NotificationTypeSelector } from "./form/NotificationTypeSelector";
import { NotificationContentFields } from "./form/NotificationContentFields";
import { NotificationSettingsFields } from "./form/NotificationSettingsFields";

interface NotificationSetting {
  id?: string;
  notification_type: "training_reminder" | "missing_players" | "custom";
  delay_hours: number;
  enabled: boolean;
  sport?: string;
  min_players?: number;
  notification_text?: string;
  notification_title?: string;
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
      notification_type: "training_reminder",
      delay_hours: 24,
      enabled: true,
      sport: "",
      notification_text: "",
      notification_title: "",
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: sports } = useQuery({
    queryKey: ["sports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sports")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Submitting notification settings:", formData);
      
      // Prepare the data to match the database schema
      const notificationData = {
        notification_type: formData.notification_type,
        delay_hours: formData.delay_hours,
        enabled: formData.enabled,
        sport: formData.sport,
        min_players: formData.min_players,
        notification_text: formData.notification_text,
        notification_title: formData.notification_title
      };

      if (setting?.id) {
        const { error } = await supabase
          .from("notification_settings")
          .update(notificationData)
          .eq("id", setting.id);

        if (error) throw error;
        toast({
          title: "Paramètres mis à jour",
          description: "Les paramètres de notification ont été mis à jour avec succès.",
        });
      } else {
        const { error } = await supabase
          .from("notification_settings")
          .insert([notificationData]);

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
        {formData.enabled ? (
          <Bell className="h-6 w-6 text-primary" aria-hidden="true" />
        ) : (
          <BellOff className="h-6 w-6 text-gray-400" aria-hidden="true" />
        )}
        <h2 className="text-xl font-semibold text-white">
          {setting ? "Modifier" : "Ajouter"} des Paramètres de Notification
        </h2>
      </div>

      <div className="space-y-6">
        <NotificationTypeSelector
          value={formData.notification_type}
          onChange={(value) => {
            setFormData((prev) => ({
              ...prev,
              notification_type: value as typeof formData.notification_type,
              min_players: value === "missing_players" ? 4 : undefined,
            }));
          }}
        />

        <NotificationSettingsFields
          sport={formData.sport || ""}
          onSportChange={(value) => setFormData((prev) => ({ ...prev, sport: value }))}
          delayHours={formData.delay_hours}
          onDelayHoursChange={(value) => setFormData((prev) => ({ ...prev, delay_hours: value }))}
          minPlayers={formData.min_players}
          onMinPlayersChange={(value) => setFormData((prev) => ({ ...prev, min_players: value }))}
          showMinPlayers={formData.notification_type === "missing_players"}
          sports={sports}
        />

        <NotificationContentFields
          notificationText={formData.notification_text || ""}
          onNotificationTextChange={(value) => setFormData((prev) => ({ ...prev, notification_text: value }))}
          notificationTitle={formData.notification_title || ""}
          onNotificationTitleChange={(value) => setFormData((prev) => ({ ...prev, notification_title: value }))}
        />

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