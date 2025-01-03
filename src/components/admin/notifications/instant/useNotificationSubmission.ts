import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { unsubscribeFromPushNotifications, subscribeToPushNotifications } from "@/services/notifications";

interface NotificationData {
  title: string;
  content: string;
  targetGroup: string;
  selectedSport: string;
}

export function useNotificationSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRenewSubscription = async (subscription: any) => {
    console.log("Renewing subscription for:", subscription);
    try {
      await unsubscribeFromPushNotifications();
      console.log("Successfully unsubscribed");
      await subscribeToPushNotifications();
      console.log("Successfully resubscribed");
      return true;
    } catch (error) {
      console.error("Error renewing subscription:", error);
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
          console.log("Sending notification to subscription:", sub.subscription);
          const response = await supabase.functions.invoke("send-push-notification", {
            body: { subscription: sub.subscription, payload: notificationData },
          });

          if (response.error) {
            const errorData = JSON.parse(response.error.message);
            
            if (errorData?.body?.includes("VapidPkHashMismatch") || 
                (typeof errorData.body === 'string' && JSON.parse(errorData.body)?.details?.includes("VAPID key mismatch"))) {
              console.log("VAPID key mismatch detected, attempting to renew subscription");
              const renewed = await handleRenewSubscription(sub.subscription);
              if (renewed) {
                renewalCount++;
                // Retry sending notification with renewed subscription
                await supabase.functions.invoke("send-push-notification", {
                  body: { subscription: sub.subscription, payload: notificationData },
                });
                successCount++;
              } else {
                failureCount++;
              }
            } else {
              console.error("Error sending notification:", errorData);
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