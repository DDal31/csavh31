import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface InstantNotificationFormProps {
  onSuccess?: () => void;
}

export function InstantNotificationForm({ onSuccess }: InstantNotificationFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetGroup, setTargetGroup] = useState<string>("all");
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      // Préparer les données de notification
      const notificationData = {
        title: title,
        body: content,
        url: "/notifications",
      };

      // Récupérer les souscriptions en fonction du groupe cible
      const subscriptionsQuery = supabase
        .from("push_subscriptions")
        .select("subscription");

      if (targetGroup === "sport_specific" && selectedSport) {
        const { data: userIds } = await supabase
          .from("profiles")
          .select("id")
          .eq("sport", selectedSport);
        
        if (userIds) {
          subscriptionsQuery.in(
            "user_id",
            userIds.map((u) => u.id)
          );
        }
      }

      const { data: subscriptions, error: subError } = await subscriptionsQuery;
      if (subError) throw subError;

      // Envoyer la notification à chaque souscription
      const sendPromises = subscriptions?.map(async (sub) => {
        const { error } = await supabase.functions.invoke("send-push-notification", {
          body: { subscription: sub.subscription, payload: notificationData },
        });
        if (error) throw error;
      });

      if (sendPromises) {
        await Promise.all(sendPromises);
      }

      // Enregistrer l'historique
      const { error: historyError } = await supabase
        .from("notification_history")
        .insert({
          title,
          content,
          target_group: targetGroup,
          sport: targetGroup === "sport_specific" ? selectedSport : null,
        });

      if (historyError) throw historyError;

      toast({
        title: "Notification envoyée",
        description: "La notification a été envoyée avec succès.",
      });

      // Reset form
      setTitle("");
      setContent("");
      setTargetGroup("all");
      setSelectedSport("");
      onSuccess?.();
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la notification.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-200">
            Titre de la notification
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1"
            placeholder="Entrez le titre"
            required
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-200">
            Contenu de la notification
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1"
            placeholder="Entrez le contenu de la notification"
            required
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="target-group" className="block text-sm font-medium text-gray-200">
            Groupe cible
          </label>
          <Select
            value={targetGroup}
            onValueChange={(value) => {
              setTargetGroup(value);
              if (value !== "sport_specific") {
                setSelectedSport("");
              }
            }}
          >
            <SelectTrigger id="target-group" className="mt-1">
              <SelectValue placeholder="Sélectionnez le groupe cible" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les utilisateurs</SelectItem>
              <SelectItem value="sport_specific">Sport spécifique</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {targetGroup === "sport_specific" && (
          <div>
            <label htmlFor="sport" className="block text-sm font-medium text-gray-200">
              Sport
            </label>
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger id="sport" className="mt-1">
                <SelectValue placeholder="Sélectionnez un sport" />
              </SelectTrigger>
              <SelectContent>
                {sports?.map((sport) => (
                  <SelectItem key={sport.id} value={sport.name}>
                    {sport.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-200 mb-2">Aperçu</h3>
        <Card className="p-4 bg-gray-800 border-gray-700">
          <h4 className="font-medium text-gray-200">{title || "Titre de la notification"}</h4>
          <p className="text-gray-400 mt-1">{content || "Contenu de la notification"}</p>
        </Card>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          "Envoyer la notification"
        )}
      </Button>
    </form>
  );
}