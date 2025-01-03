import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WebPushSubscription } from "@/types/notifications";
import {
  handleApplePushError,
  sendPushNotification,
  renewSubscription
} from "@/utils/pushNotifications";

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

      let successCount = 0;
      let failureCount = 0;
      let renewalCount = 0;

      for (const sub of subscriptions || []) {
        try {
          const subscription = sub.subscription as unknown as WebPushSubscription;
          
          if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
            console.error("Invalid subscription format:", subscription);
            failureCount++;
            continue;
          }

          const response = await sendPushNotification(subscription, notificationData);
          console.log("Push notification response:", response);

          if (response.error) {
            if (subscription.endpoint.includes('web.push.apple.com')) {
              console.log("Handling Apple Push error for subscription:", sub.id);
              const result = await handleApplePushError(
                response.error,
                subscription,
                notificationData
              );
              
              if (result.error) {
                console.log("Failed to handle Apple Push error:", result.error);
                // Try to renew the subscription
                const renewed = await renewSubscription(subscription);
                if (renewed) {
                  console.log("Successfully renewed subscription");
                  // Update the subscription in the database
                  const { error: updateError } = await supabase
                    .from("push_subscriptions")
                    .update({ subscription: renewed })
                    .eq("id", sub.id);
                  
                  if (!updateError) {
                    // Retry sending the notification with the renewed subscription
                    const retryResponse = await sendPushNotification(renewed as WebPushSubscription, notificationData);
                    if (!retryResponse.error) {
                      successCount++;
                      renewalCount++;
                      continue;
                    }
                  }
                }
                failureCount++;
              } else {
                successCount++;
                renewalCount++;
              }
            } else {
              console.error("Error sending notification:", response.error);
              failureCount++;
            }
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