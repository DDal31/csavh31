import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WebPushSubscription } from "@/types/notifications";
import { subscribeToPushNotifications } from "@/services/notifications";

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
      const notificationData = {
        title,
        body: content,
        url: "/notifications",
      };
      console.log("Notification data prepared:", notificationData);

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
          const subscription = sub.subscription as unknown as WebPushSubscription;
          
          if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
            console.error("Invalid subscription format:", subscription);
            failureCount++;
            continue;
          }

          console.log("Sending notification to subscription:", {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.keys.p256dh.substring(0, 10) + '...',
              auth: subscription.keys.auth.substring(0, 10) + '...'
            }
          });

          let response = await supabase.functions.invoke("send-push-notification", {
            body: { subscription, payload: notificationData }
          });

          // Check for VAPID key mismatch error
          if (response.error) {
            const errorBody = JSON.parse(response.error.message);
            if (errorBody?.details === "VapidPkHashMismatch" || 
                errorBody?.errorBody?.reason === "VapidPkHashMismatch") {
              console.log("VAPID key mismatch detected, attempting to renew subscription");
              
              // Attempt to renew subscription
              const newSubscription = await subscribeToPushNotifications();
              if (newSubscription) {
                console.log("Subscription renewed, retrying notification");
                response = await supabase.functions.invoke("send-push-notification", {
                  body: { 
                    subscription: newSubscription, 
                    payload: notificationData 
                  }
                });
              }
            }
          }

          console.log("Push notification response:", response);

          if (response.error) {
            console.error("Error sending notification:", response.error);
            failureCount++;
          } else {
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