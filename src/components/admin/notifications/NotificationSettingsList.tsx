import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export interface NotificationSetting {
  id: string;
  notification_type: "training_reminder" | "missing_players" | "custom";
  delay_hours: number;
  enabled: boolean;
  logo_path: string | null;
  min_players: number | null;
  notification_text: string | null;
  notification_title: string | null;
  sport: string | null;
  target_group: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettingsListProps {
  settings: NotificationSetting[];
  onAddClick: () => void;
  onEditClick: (setting: NotificationSetting) => void;
}

export function NotificationSettingsList({
  settings,
  onAddClick,
  onEditClick,
}: NotificationSettingsListProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Paramètres de Notification</h2>
        <Button onClick={onAddClick} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2" />
          Ajouter
        </Button>
      </div>
      <div className="space-y-4">
        {settings.map((setting) => (
          <div key={setting.id} className="bg-gray-800 p-4 rounded-md border border-gray-700">
            <h3 className="text-md font-bold text-white">{setting.notification_title}</h3>
            <p className="text-gray-400">{setting.notification_text}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-300">Min Players: {setting.min_players}</span>
              <Button onClick={() => onEditClick(setting)} className="bg-blue-600 hover:bg-blue-700">
                Modifier
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
