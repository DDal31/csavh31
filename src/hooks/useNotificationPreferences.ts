import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { messaging } from "@/config/firebase";
import { isSupported, getToken } from "firebase/messaging";

export function useNotificationPreferences() {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFirebaseSupported, setIsFirebaseSupported] = useState(false);
  const { toast } = useToast();

  const isIOS = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  };

  const checkFirebaseSupport = async () => {
    try {
      const supported = await isSupported();
      console.log("Firebase Messaging supported:", supported);
      console.log("Is iOS device:", isIOS());
      console.log("User Agent:", window.navigator.userAgent);
      setIsFirebaseSupported(supported);
    } catch (error) {
      console.error("Error checking Firebase support:", error);
      setIsFirebaseSupported(false);
    }
  };

  const { data: preferences } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return null;

      const { data, error } = await supabase
        .from("user_notification_preferences")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error("No user session");

      const { error } = await supabase
        .from("user_notification_preferences")
        .upsert({
          user_id: session.user.id,
          push_enabled: enabled,
        });

      if (error) throw error;
    },
  });

  const handleToggleNotifications = async () => {
    try {
      if (!pushEnabled) {
        if (!isFirebaseSupported) {
          throw new Error("Les notifications ne sont pas supportées sur votre appareil");
        }

        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await getToken(messaging, {
            vapidKey: "BEpTfcfcPXLCo6KKmODVDfZETR_YPcsQJGD8hs_eQRAInu0el6Rz3Df6_7EacaL0CGkxJqZtiB4Sb_n5RM3WpQA"
          });
          
          if (token) {
            await updatePreferencesMutation.mutateAsync(true);
            setPushEnabled(true);
            toast({
              title: "Notifications activées",
              description: "Vous recevrez désormais des notifications push.",
            });
          }
        } else {
          toast({
            title: "Permission refusée",
            description: isIOS() 
              ? "Veuillez autoriser les notifications dans les paramètres de votre iPhone (Réglages > Safari > Notifications)"
              : "Vous devez autoriser les notifications dans votre navigateur.",
            variant: "destructive",
          });
        }
      } else {
        await updatePreferencesMutation.mutateAsync(false);
        setPushEnabled(false);
        toast({
          title: "Notifications désactivées",
          description: "Vous ne recevrez plus de notifications push.",
        });
      }
    } catch (error) {
      console.error("Error toggling notifications:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkFirebaseSupport();
    if (preferences) {
      setPushEnabled(preferences.push_enabled);
      setLoading(false);
    }
  }, [preferences]);

  return {
    pushEnabled,
    loading,
    isFirebaseSupported,
    handleToggleNotifications,
  };
}