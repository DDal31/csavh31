import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { unsubscribeFromPushNotifications, subscribeToPushNotifications } from "@/services/notifications";
import { WebPushSubscription } from "@/types/notifications";

interface NotificationData {
  title: string;
  content: string;
  targetGroup: string;
  selectedSport: string;
}

export function useNotificationSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRenewSubscription = async (subscription: WebPushSubscription) => {
    console.log("Starting subscription renewal process...");
    try {
      // First, remove the old subscription
      await unsubscribeFromPushNotifications();
      console.log("Successfully unsubscribed from old subscription");

      // Get a new subscription
      const newSubscription = await subscribeToPushNotifications();
      console.log("Successfully created new subscription:", newSubscription);

      if (!newSubscription) {
        console.error("Failed to create new subscription");
        return false;
      }

      // Convert the subscription to a serializable format
      const subscriptionData = {
        endpoint: newSubscription.endpoint,
        keys: {
          p256dh: newSubscription.keys.p256dh,
          auth: newSubscription.keys.auth
        }
      } as WebPushSubscription;

      // Update the subscription in the database
      const { error: updateError } = await supabase
        .from("push_subscriptions")
        .update({ subscription: subscriptionData })
        .eq("subscription->endpoint", subscription.endpoint);

      if (updateError) {
        console.error("Error updating subscription in database:", updateError);
        return false;
      }

      console.log("Successfully updated subscription in database");
      return true;
    } catch (error) {
      console.error("Error during subscription renewal:", error);
      return false;
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
      };
      console.log("Notification data prepared:", notificationData);

      console.log("Fetching subscriptions for target group:", targetGroup);
      const subscriptionsQuery = supabase
        .from("push_subscriptions")
        .select("subscription");

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

      let successCount = 0;
      let failureCount = 0;
      let renewalCount = 0;

      for (const sub of subscriptions || []) {
        try {
          // Ensure the subscription data matches our WebPushSubscription type
          const subscription = sub.subscription as WebPushSubscription;
          
          if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
            console.error("Invalid subscription format:", subscription);
            failureCount++;
            continue;
          }

          console.log("Attempting to send notification to subscription:", {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.keys.p256dh.substring(0, 10) + '...',
              auth: subscription.keys.auth.substring(0, 10) + '...'
            }
          });

          const response = await supabase.functions.invoke("send-push-notification", {
            body: { subscription, payload: notificationData },
          });

          if (response.error) {
            const errorData = JSON.parse(response.error.message);
            console.log("Received error response:", errorData);
            
            // Check for VAPID key mismatch error
            if (errorData?.body?.includes("VapidPkHashMismatch") || 
                (typeof errorData.body === 'string' && 
                 (JSON.parse(errorData.body)?.details?.includes("VAPID key mismatch") || 
                  JSON.parse(errorData.body)?.reason === "VapidPkHashMismatch"))) {
              console.log("VAPID key mismatch detected, attempting to renew subscription");
              const renewed = await handleRenewSubscription(subscription);
              if (renewed) {
                renewalCount++;
                // Retry sending notification with renewed subscription
                const retryResponse = await supabase.functions.invoke("send-push-notification", {
                  body: { subscription, payload: notificationData },
                });
                if (!retryResponse.error) {
                  successCount++;
                  console.log("Successfully sent notification after renewal");
                } else {
                  failureCount++;
                  console.error("Failed to send notification after renewal:", retryResponse.error);
                }
              } else {
                failureCount++;
                console.error("Failed to renew subscription");
              }
            } else {
              console.error("Error sending notification:", errorData);
              failureCount++;
            }
          } else {
            successCount++;
            console.log("Successfully sent notification");
          }
        } catch (error) {
          console.error("Error processing notification:", error);
          failureCount++;
        }
      }

      // Record notification history
      console.log("Recording notification in history...");
      const { error: historyError } = await supabase
        .from("notification_history")
        .insert({
          title,
          content,
          target_group: targetGroup,
          sport: targetGroup === "sport_specific" ? selectedSport : null,
        });

      if (historyError) throw historyError;

      console.log("Notification process completed");
      toast({
        title: "Notification envoyée",
        description: `Envoyé avec succès: ${successCount}, Échecs: ${failureCount}${renewalCount > 0 ? `, Renouvellements: ${renewalCount}` : ''}`,
      });

      return { success: true };
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