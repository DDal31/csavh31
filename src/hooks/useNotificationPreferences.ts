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
      // Vérifier d'abord si le navigateur supporte les notifications
      if (!("Notification" in window)) {
        console.log("Ce navigateur ne supporte pas les notifications");
        setIsFirebaseSupported(false);
        return;
      }

      // Vérifier le cas spécifique de Safari iOS
      if (isIOS() && isSafari() && !isPWA()) {
        console.log("Notifications non supportées sur Safari iOS");
        setIsFirebaseSupported(false);
        return;
      }

      // Vérifier le support de Firebase Messaging
      try {
        const supported = await isSupported();
        console.log("Firebase Messaging supported:", supported);
        console.log("Is iOS device:", isIOS());
        console.log("Is Safari browser:", isSafari());
        console.log("Is PWA mode:", isPWA());
        console.log("User Agent:", window.navigator.userAgent);
        
        if (!supported) {
          console.log("Firebase Messaging n'est pas supporté sur ce navigateur");
          toast({
            title: "Notifications non supportées",
            description: "Votre navigateur ne supporte pas les notifications push. Veuillez utiliser un navigateur compatible ou installer l'application.",
            variant: "destructive",
          });
        }
        
        setIsFirebaseSupported(supported);
      } catch (error) {
        console.error("Error checking Firebase Messaging support:", error);
        setIsFirebaseSupported(false);
        toast({
          title: "Notifications non supportées",
          description: "Votre navigateur ne supporte pas les notifications push. Veuillez utiliser un navigateur compatible ou installer l'application.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in checkFirebaseSupport:", error);
      setIsFirebaseSupported(false);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la vérification du support des notifications",
        variant: "destructive",
      });
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

  const checkNotificationPermission = async () => {
    if (!("Notification" in window)) {
      throw new Error("Les notifications ne sont pas supportées sur votre navigateur");
    }

    const permission = window.Notification.permission;
    console.log("Current notification permission:", permission);
    
    if (permission === "denied") {
      if (isIOS() && isPWA()) {
        throw new Error(
          "Les notifications sont désactivées. Veuillez :\n" +
          "1. Ouvrir les Réglages de votre iPhone\n" +
          "2. Faire défiler jusqu'à trouver cette application\n" +
          "3. Activer les notifications"
        );
      } else {
        throw new Error(
          "Les notifications sont bloquées. Veuillez les autoriser dans les paramètres de votre navigateur."
        );
      }
    }

    return permission;
  };

  const requestNotificationPermission = async () => {
    try {
      const currentPermission = await checkNotificationPermission();
      
      if (currentPermission === "granted") {
        return currentPermission;
      }

      const permission = await window.Notification.requestPermission();
      console.log("New notification permission status:", permission);
      
      if (permission === "denied" && isIOS() && isPWA()) {
        throw new Error(
          "Les notifications n'ont pas été autorisées. Veuillez :\n" +
          "1. Ouvrir les Réglages de votre iPhone\n" +
          "2. Faire défiler jusqu'à trouver cette application\n" +
          "3. Activer les notifications"
        );
      }

      return permission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      throw error;
    }
  };

  const handleToggleNotifications = async () => {
    try {
      if (!pushEnabled) {
        if (isIOS() && isSafari() && !isPWA()) {
          toast({
            title: "Notifications non supportées",
            description: "Les notifications ne sont pas supportées sur Safari iOS. Veuillez installer l'application sur votre écran d'accueil pour activer les notifications.",
            variant: "destructive",
          });
          return;
        }

        if (!isFirebaseSupported) {
          throw new Error("Les notifications ne sont pas supportées sur votre appareil");
        }

        const permission = await requestNotificationPermission();
        if (permission === "granted") {
          try {
            console.log("Requesting FCM token...");
            // Récupérer la VAPID key depuis l'API
            const { data: vapidKeyResponse, error: vapidKeyError } = await supabase.functions.invoke('get-vapid-key');
            
            if (vapidKeyError) {
              console.error("Error getting VAPID key:", vapidKeyError);
              throw new Error("Erreur lors de la récupération de la clé VAPID");
            }

            const token = await getToken(messaging, {
              vapidKey: vapidKeyResponse.vapidKey
            });
            console.log("FCM Token obtained:", token);
            
            await updatePreferencesMutation.mutateAsync(true);
            setPushEnabled(true);
            
            toast({
              title: "Notifications activées",
              description: "Vous recevrez désormais des notifications push.",
            });
          } catch (error) {
            console.error("Error getting FCM token:", error);
            throw new Error("Erreur lors de l'obtention du token FCM. Veuillez réessayer.");
          }
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
    const init = async () => {
      try {
        await checkFirebaseSupport();
        if (preferences) {
          setPushEnabled(preferences.push_enabled);
        }
      } catch (error) {
        console.error("Error in init:", error);
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, [preferences]);

  return {
    pushEnabled,
    loading,
    isFirebaseSupported,
    handleToggleNotifications,
  };
}
