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

  const handleVapidKeyMismatch = async (subscription: WebPushSubscription) => {
    console.log("Handling VAPID key mismatch for subscription:", subscription.endpoint);
    try {
      // Try to get a new subscription
      const newSubscription = await subscribeToPushNotifications();
      if (!newSubscription) {
        throw new Error("Failed to renew subscription");
      }
      console.log("Successfully renewed subscription");
      return newSubscription;
    } catch (error) {
      console.error("Error renewing subscription:", error);
      return null;
    }
  };

  const submitNotification = async ({ title, content, targetGroup, selectedSport }: NotificationData) => {
    setIsSubmitting(true);
    console.log("Starting notification submission process...");

    try {
      const notificationData = {
        title,
        body: content,
        url: "/notifications",
        timestamp: new Date().getTime(),
        icon: 'https://kzahxvazbthyjjzugxsy.supabase.co/storage/v1/object/public/site-assets/app-icon-192.png',
        badge: 'https://kzahxvazbthyjjzugxsy.supabase.co/storage/v1/object/public/site-assets/app-icon-192.png'
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

          // First attempt to send notification
          let response = await supabase.functions.invoke("send-push-notification", {
            body: { subscription, payload: notificationData }
          });

          // Check for VAPID key mismatch error
          if (response.error) {
            let errorBody;
            try {
              errorBody = JSON.parse(response.error.message);
              console.log("Push notification error response:", errorBody);

              if (errorBody?.details === "VapidPkHashMismatch" || 
                  errorBody?.errorBody?.reason === "VapidPkHashMismatch") {
                console.log("VAPID key mismatch detected, attempting to renew subscription");
                
                // Attempt to renew subscription
                const newSubscription = await handleVapidKeyMismatch(subscription);
                if (newSubscription) {
                  console.log("Subscription renewed successfully, retrying notification");
                  
                  // Update subscription in database
                  const { error: updateError } = await supabase
                    .from("push_subscriptions")
                    .update({ subscription: newSubscription })
                    .eq("id", sub.id);

                  if (updateError) {
                    console.error("Error updating subscription:", updateError);
                    failureCount++;
                    continue;
                  }
                  
                  // Retry with new subscription
                  response = await supabase.functions.invoke("send-push-notification", {
                    body: { 
                      subscription: newSubscription, 
                      payload: notificationData 
                    }
                  });
                  
                  if (!response.error) {
                    console.log("Notification sent successfully after subscription renewal");
                    successCount++;
                    continue;
                  }
                }
              }
            } catch (parseError) {
              console.error("Error parsing error response:", parseError);
            }
            
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