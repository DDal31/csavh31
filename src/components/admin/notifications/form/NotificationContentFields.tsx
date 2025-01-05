import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NotificationContentFieldsProps {
  notificationText: string;
  onNotificationTextChange: (value: string) => void;
  notificationTitle: string;
  onNotificationTitleChange: (value: string) => void;
}

export function NotificationContentFields({
  notificationText,
  onNotificationTextChange,
  notificationTitle,
  onNotificationTitleChange,
}: NotificationContentFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="notification_title" className="text-gray-200">
          Modèle de titre
          <span className="text-red-400 ml-1" aria-hidden="true">*</span>
        </Label>
        <Input
          id="notification_title"
          value={notificationTitle}
          onChange={(e) => onNotificationTitleChange(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white"
          placeholder="Ex: Rappel Entrainement {sport} du {date}"
          required
        />
      </div>
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