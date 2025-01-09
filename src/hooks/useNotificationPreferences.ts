import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBkkFF0XhNZeWuDmOfEhsgdfX1VBG7WTas",
  projectId: "csavh31-c6a45",
  messagingSenderId: "954580417010",
  appId: "1:954580417010:web:7d4bcd931955f5b7f5e2c6"
};

const app = initializeApp(firebaseConfig);

export const useNotificationPreferences = () => {
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

  const loadPreferences = async () => {
    try {
      console.log("Loading notification preferences...");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session found");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('push_enabled')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        console.log("Preferences found:", data);
        setPushEnabled(data.push_enabled);
      } else {
        console.log("No preferences found, creating default preferences");
        await supabase
          .from('user_notification_preferences')
          .insert({
            user_id: session.user.id,
            push_enabled: false
          });
        setPushEnabled(false);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos préférences de notification.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session found for toggle");
        return;
      }

      if (!pushEnabled) {
        console.log("Requesting notification permission...");
        
        if (!('Notification' in window)) {
          console.log("Notifications not supported in this browser");
          toast({
            title: "Non supporté",
            description: "Votre navigateur ne supporte pas les notifications push.",
            variant: "destructive",
          });
          return;
        }

        const permission = await Notification.requestPermission();
        console.log("Notification permission:", permission);
        
        if (permission !== 'granted') {
          console.log("Notification permission denied");
          toast({
            title: "Permission refusée",
            description: isIOS() 
              ? "Veuillez autoriser les notifications dans les paramètres de votre iPhone (Réglages > Safari > Notifications)"
              : "Vous devez autoriser les notifications dans votre navigateur.",
            variant: "destructive",
          });
          return;
        }

        if (isFirebaseSupported) {
          try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log("Service Worker registered:", registration);

            const messaging = getMessaging(app);
            const currentToken = await getToken(messaging, {
              vapidKey: "BHgwOxwsVYoWgxqkF4jGZkSDPHtqL_1pdZs-Q_H5SPezvQn1XGbPpKGAuYZqgafUgKX2F7P_YOHwuQoVXyQ6qYk",
              serviceWorkerRegistration: registration,
            });

            console.log("FCM token obtained:", currentToken);

            if (!currentToken) {
              throw new Error("No registration token available");
            }

            const { error: tokenError } = await supabase
              .from('user_fcm_tokens')
              .upsert({
                user_id: session.user.id,
                token: currentToken,
                device_type: isIOS() ? 'ios' : 'web',
              });

            if (tokenError) throw tokenError;
          } catch (error) {
            console.error("Error during FCM setup:", error);
            throw error;
          }
        }
      }

      const { error: prefError } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: session.user.id,
          push_enabled: !pushEnabled,
        });

      if (prefError) throw prefError;

      setPushEnabled(!pushEnabled);
      toast({
        title: !pushEnabled ? "Notifications activées" : "Notifications désactivées",
        description: !pushEnabled 
          ? "Vous recevrez désormais des notifications pour les entraînements."
          : "Vous ne recevrez plus de notifications.",
      });
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification des préférences.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkFirebaseSupport();
    loadPreferences();
  }, []);

  return {
    pushEnabled,
    loading,
    isFirebaseSupported,
    handleToggleNotifications
  };
};