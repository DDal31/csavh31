import { Bell, BellOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { NotificationLoadingCard } from "./NotificationLoadingCard";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";

export function NotificationPreferences() {
  const { pushEnabled, loading, isFirebaseSupported, handleToggleNotifications } = useNotificationPreferences();

  if (loading) {
    return <NotificationLoadingCard />;
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