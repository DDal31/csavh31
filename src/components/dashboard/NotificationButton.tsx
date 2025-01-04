import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from "@/services/notifications";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { initializePushNotifications, addPushNotificationListeners } from "@/utils/pushNotificationsSetup";

export function NotificationButton() {
  const { toast } = useToast();
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: subscription } = useQuery({
    queryKey: ["push-subscription", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", session?.user?.id)
        .single();
      return data;
    },
  });

  useEffect(() => {
    const checkNotificationSupport = async () => {
      const supported = "Notification" in window && "serviceWorker" in navigator;
      setNotificationsSupported(supported);
      console.log("Notifications supported:", supported);

      if (supported) {
        // Initialize Capacitor Push Notifications
        await initializePushNotifications();
        addPushNotificationListeners();
      }
    };

    checkNotificationSupport();
  }, []);

  useEffect(() => {
    setIsSubscribed(!!subscription);
  }, [subscription]);

  const handleSubscriptionToggle = async () => {
    try {
      if (isSubscribed) {
        await unsubscribeFromPushNotifications();
        setIsSubscribed(false);
        toast({
          title: "Notifications désactivées",
          description: "Vous ne recevrez plus de notifications.",
        });
      } else {
        await subscribeToPushNotifications();
        setIsSubscribed(true);
        toast({
          title: "Notifications activées",
          description: "Vous recevrez désormais des notifications pour les entraînements.",
        });
      }
    } catch (error) {
      console.error("Error managing notifications subscription:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la gestion des notifications.",
        variant: "destructive",
      });
    }
  };

  if (!notificationsSupported) return null;

  return (
    <Button
      onClick={handleSubscriptionToggle}
      variant="outline"
      className="flex items-center gap-2 w-full sm:w-auto"
      aria-label={isSubscribed ? "Désactiver les notifications" : "Activer les notifications"}
    >
      {isSubscribed ? (
        <>
          <BellOff className="h-4 w-4" />
          Désactiver les notifications
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" />
          Activer les notifications
        </>
      )}
    </Button>
  );
}