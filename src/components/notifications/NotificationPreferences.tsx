import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBkkFF0XhNZeWuDmOfEhsgdfX1VBG7WTas",
  projectId: "csavh31-c6a45",
  messagingSenderId: "954580417010",
  appId: "1:954580417010:web:7d4bcd931955f5b7f5e2c6"
};

const app = initializeApp(firebaseConfig);

export function NotificationPreferences() {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFirebaseSupported, setIsFirebaseSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkFirebaseSupport();
    loadPreferences();
  }, []);

  const checkFirebaseSupport = async () => {
    try {
      const supported = await isSupported();
      console.log("Firebase Messaging supported:", supported);
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
      if (!session) return;

      if (!pushEnabled) {
        // Only request permission if notifications are not already enabled
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
            description: "Vous devez autoriser les notifications dans votre navigateur.",
            variant: "destructive",
          });
          return;
        }

        let currentToken = '';
        if (isFirebaseSupported) {
          try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log("Service Worker registered:", registration);

            const messaging = getMessaging(app);
            currentToken = await getToken(messaging, {
              vapidKey: "BHgwOxwsVYoWgxqkF4jGZkSDPHtqL_1pdZs-Q_H5SPezvQn1XGbPpKGAuYZqgafUgKX2F7P_YOHwuQoVXyQ6qYk",
              serviceWorkerRegistration: registration,
            });

            console.log("FCM token obtained:", currentToken);

            if (!currentToken) {
              throw new Error("No registration token available");
            }

            // Save token
            await supabase
              .from('user_fcm_tokens')
              .upsert({
                user_id: session.user.id,
                token: currentToken,
                device_type: 'web',
              });
          } catch (error) {
            console.error("Error during FCM setup:", error);
          }
        }
      }

      // Update preferences
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

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Chargement...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {pushEnabled ? (
            <Bell className="h-5 w-5 text-green-500" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-500" />
          )}
          Notifications Push
        </CardTitle>
        <CardDescription>
          Recevez des notifications pour les entraînements et autres événements importants.
          {!isFirebaseSupported && (
            <p className="mt-2 text-yellow-500">
              Note: Certaines fonctionnalités de notification peuvent être limitées sur votre appareil.
            </p>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span>Activer les notifications push</span>
          <Switch
            checked={pushEnabled}
            onCheckedChange={handleToggleNotifications}
            aria-label="Activer les notifications push"
          />
        </div>
      </CardContent>
    </Card>
  );
}