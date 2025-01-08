import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBkkFF0XhNZeWuDmOfEhsgdfX1VBG7WTas",
  projectId: "your-project-id",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export function NotificationPreferences() {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      console.log("Loading notification preferences...");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No session found");
        setLoading(false);
        return;
      }

      console.log("Fetching preferences for user:", session.user.id);
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('push_enabled')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching preferences:', error);
        throw error;
      }

      if (!data) {
        console.log("No preferences found, creating default preferences");
        const { error: insertError } = await supabase
          .from('user_notification_preferences')
          .insert({
            user_id: session.user.id,
            push_enabled: false
          });

        if (insertError) {
          console.error('Error creating default preferences:', insertError);
          throw insertError;
        }

        setPushEnabled(false);
      } else {
        console.log("Preferences found:", data);
        setPushEnabled(data.push_enabled);
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
        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast({
            title: "Permission refusée",
            description: "Vous devez autoriser les notifications dans votre navigateur.",
            variant: "destructive",
          });
          return;
        }

        // Register service worker and get FCM token
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.VITE_VAPID_PUBLIC_KEY,
          serviceWorkerRegistration: registration,
        });

        if (!currentToken) {
          throw new Error("No registration token available");
        }

        // Save the token
        const { error: tokenError } = await supabase
          .from('user_fcm_tokens')
          .upsert({
            user_id: session.user.id,
            token: currentToken,
            device_type: 'web',
          });

        if (tokenError) {
          console.error('Error saving FCM token:', tokenError);
          throw tokenError;
        }
      }

      // Update preferences
      const { error: prefError } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: session.user.id,
          push_enabled: !pushEnabled,
        });

      if (prefError) {
        console.error('Error updating preferences:', prefError);
        throw prefError;
      }

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