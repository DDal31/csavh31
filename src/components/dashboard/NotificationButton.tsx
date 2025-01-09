import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { Loader2 } from "lucide-react";

export function NotificationButton() {
  const { pushEnabled, loading, isFirebaseSupported, handleToggleNotifications } = useNotificationPreferences();

  if (!isFirebaseSupported) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleToggleNotifications}
      disabled={loading}
      className="w-full sm:w-auto bg-secondary hover:bg-secondary/80 text-white border-none"
      aria-label={pushEnabled ? "Désactiver les notifications" : "Activer les notifications"}
    >
      <div className="flex items-center gap-2">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : pushEnabled ? (
          <Bell className="h-5 w-5" />
        ) : (
          <BellOff className="h-5 w-5" />
        )}
        <span className="hidden sm:inline">
          {pushEnabled ? "Notifications activées" : "Activer les notifications"}
        </span>
      </div>
    </Button>
  );
}