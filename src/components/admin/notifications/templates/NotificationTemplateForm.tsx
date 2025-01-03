import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface NotificationTemplate {
  id?: string;
  title: string;
  content: string;
  type: string;
  sport?: string;
}

interface NotificationTemplateFormProps {
  template?: NotificationTemplate | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function NotificationTemplateForm({
  template,
  onSuccess,
  onCancel,
}: NotificationTemplateFormProps) {
  const [formData, setFormData] = useState<NotificationTemplate>(
    template || {
      title: "",
      content: "",
      type: "",
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (template?.id) {
        const { error } = await supabase
          .from("notification_templates")
          .update(formData)
          .eq("id", template.id);

        if (error) throw error;
        toast({
          title: "Modèle mis à jour",
          description: "Le modèle de notification a été mis à jour avec succès.",
        });
      } else {
        const { error } = await supabase
          .from("notification_templates")
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Modèle créé",
          description: "Le nouveau modèle de notification a été créé avec succès.",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
      onSuccess();
    } catch (error) {
      console.error("Error saving notification template:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde du modèle.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">
        {template ? "Modifier" : "Créer"} un Modèle de Notification
      </h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Titre</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="type">Type</Label>
          <Input
            id="type"
            value={formData.type}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, type: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="sport">Sport (optionnel)</Label>
          <Select
            value={formData.sport}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, sport: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un sport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="goalball">Goalball</SelectItem>
              <SelectItem value="torball">Torball</SelectItem>
              <SelectItem value="showdown">Showdown</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="content">Contenu</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, content: e.target.value }))
            }
            required
            className="h-32"
          />
        </div>
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
    </form>
  );
}