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

  const isSafari = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return userAgent.includes('safari') && !userAgent.includes('chrome');
  };

  const isPWA = () => {
    return window.matchMedia('(display-mode: standalone)').matches;
  };

  const checkFirebaseSupport = async () => {
    try {
      // Si on est sur Safari iOS en mode navigateur, on sait déjà que ce n'est pas supporté
      if (isIOS() && isSafari() && !isPWA()) {
        console.log("Notifications non supportées sur Safari iOS");
        setIsFirebaseSupported(false);
        return;
      }

      const supported = await isSupported();
      console.log("Firebase Messaging supported:", supported);
      console.log("Is iOS device:", isIOS());
      console.log("Is Safari browser:", isSafari());
      console.log("Is PWA mode:", isPWA());
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

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      throw new Error("Les notifications ne sont pas supportées sur votre navigateur");
    }

    if (window.Notification.permission === "denied") {
      throw new Error("Les notifications ont été bloquées. Veuillez les autoriser dans les paramètres de votre appareil.");
    }

    const permission = await window.Notification.requestPermission();
    console.log("Notification permission status:", permission);
    return permission;
  };

  const handleToggleNotifications = async () => {
    try {
      if (!pushEnabled) {
        // Vérification spécifique pour Safari iOS en mode navigateur
        if (isIOS() && isSafari() && !isPWA()) {
          toast({
            title: "Notifications non supportées",
            description: "Les notifications ne sont pas supportées sur Safari iOS. Veuillez installer l'application sur votre écran d'accueil pour activer les notifications.",
            variant: "destructive",
          });
          return;
        }

        // Vérification pour iOS en mode PWA
        if (isIOS() && isPWA()) {
          try {
            const permission = await requestNotificationPermission();
            if (permission === "granted") {
              await updatePreferencesMutation.mutateAsync(true);
              setPushEnabled(true);
              toast({
                title: "Notifications activées",
                description: "Vous recevrez désormais des notifications push.",
              });
            } else {
              toast({
                title: "Permission refusée",
                description: "Veuillez autoriser les notifications dans les paramètres de votre iPhone (Réglages > [Nom de l'app])",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("Erreur lors de la demande de permission:", error);
            toast({
              title: "Erreur",
              description: "Une erreur est survenue lors de l'activation des notifications. Veuillez vérifier vos paramètres de notifications.",
              variant: "destructive",
            });
          }
          return;
        }

        // Pour les autres navigateurs
        if (!isFirebaseSupported) {
          throw new Error("Les notifications ne sont pas supportées sur votre appareil");
        }

        const permission = await requestNotificationPermission();
        if (permission === "granted") {
          const token = await getToken(messaging, {
            vapidKey: "BEpTfcfcPXLCo6KKmODVDfZETR_YPcsQJGD8hs_eQRAInu0el6Rz3Df6_7EacaL0CGkxJqZtiB4Sb_n5RM3WpQA"
          });
          console.log("FCM Token:", token);
          
          await updatePreferencesMutation.mutateAsync(true);
          setPushEnabled(true);
          
          toast({
            title: "Notifications activées",
            description: "Vous recevrez désormais des notifications push.",
          });
        } else {
          toast({
            title: "Permission refusée",
            description: "Vous devez autoriser les notifications dans votre navigateur.",
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
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la gestion des notifications",
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