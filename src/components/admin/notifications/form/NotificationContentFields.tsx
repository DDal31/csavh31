import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface NotificationContentFieldsProps {
  notificationText: string;
  onNotificationTextChange: (value: string) => void;
}

export function NotificationContentFields({
  notificationText,
  onNotificationTextChange,
}: NotificationContentFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="notification_text" className="text-gray-200">
          Texte de la notification
          <span className="text-red-400 ml-1" aria-hidden="true">*</span>
        </Label>
        <Textarea
          id="notification_text"
          value={notificationText}
          onChange={(e) => onNotificationTextChange(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white"
          placeholder="Ex: N'oubliez pas votre entrainement de {sport} prévu le {date} à {heure}"
          required
        />
      </div>
    </div>
  );
}