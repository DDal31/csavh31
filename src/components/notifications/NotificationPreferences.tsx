import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

export function NotificationPreferences() {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('user_notification_preferences')
        .select('push_enabled')
        .eq('user_id', session.user.id)
        .single();

      if (data) {
        setPushEnabled(data.push_enabled);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading preferences:', error);
      setLoading(false);
    }
  };

  const handleToggleNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (!pushEnabled) {
        // Demander la permission pour les notifications
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast({
            title: "Permission refusée",
            description: "Vous devez autoriser les notifications dans votre navigateur.",
            variant: "destructive",
          });
          return;
        }

        // Enregistrer le service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const messaging = firebase.messaging();
        const token = await messaging.getToken({
          vapidKey: 'VOTRE_VAPID_KEY',
          serviceWorkerRegistration: registration,
        });

        // Sauvegarder le token
        await supabase.from('user_fcm_tokens').upsert({
          user_id: session.user.id,
          token,
          device_type: 'web',
        });
      }

      // Mettre à jour les préférences
      await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: session.user.id,
          push_enabled: !pushEnabled,
        });

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