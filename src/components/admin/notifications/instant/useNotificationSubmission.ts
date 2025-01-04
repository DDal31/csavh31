import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NotificationData {
  title: string;
  content: string;
  targetGroup: string;
  selectedSport: string;
}

export function useNotificationSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitNotification = async ({ title, content, targetGroup, selectedSport }: NotificationData) => {
    setIsSubmitting(true);
    console.log("Starting notification submission process...");

    try {
      const payload = {
        title,
        body: content,
        url: "/notifications",
        timestamp: new Date().getTime(),
        icon: 'https://kzahxvazbthyjjzugxsy.supabase.co/storage/v1/object/public/site-assets/app-icon-192.png',
        badge: 'https://kzahxvazbthyjjzugxsy.supabase.co/storage/v1/object/public/site-assets/app-icon-192.png'
      };
      console.log("Notification payload prepared:", payload);

      const subscriptionsQuery = supabase
        .from("push_subscriptions")
        .select("subscription, id");

      if (targetGroup === "sport_specific" && selectedSport) {
        console.log("Filtering subscriptions for sport:", selectedSport);
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
      console.log("Found subscriptions:", subscriptions?.length);

      if (!subscriptions?.length) {
        toast({
          title: "Aucun destinataire",
          description: "Aucun utilisateur n'est inscrit aux notifications pour le moment.",
          variant: "destructive",
        });
        return { success: false };
      }

      let successCount = 0;
      let failureCount = 0;

      for (const sub of subscriptions) {
        try {
          const response = await supabase.functions.invoke("send-push-notification", {
            body: { 
              subscription: sub.subscription,
              payload
            }
          });

          if (response.error) {
            console.error("Error sending notification:", response.error);
            failureCount++;
          } else {
            console.log("Notification sent successfully");
            successCount++;
          }
        } catch (error) {
          console.error("Error processing notification:", error);
          failureCount++;
        }
      }

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
        description: `Envoyé avec succès: ${successCount}, Échecs: ${failureCount}`,
        variant: successCount > 0 ? "default" : "destructive",
      });

      return { success: successCount > 0 };
    } catch (error) {
      console.error("Error during notification sending:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la notification.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitNotification, isSubmitting };
}