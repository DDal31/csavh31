import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit } from "lucide-react";

interface NotificationSetting {
  id: string;
  notification_type: "training_reminder" | "missing_players" | "custom";
  delay_hours: number;
  enabled: boolean;
  sport?: string;
  min_players?: number;
  notification_text?: string;
  notification_title?: string;
}

interface NotificationSettingsListProps {
  settings: NotificationSetting[];
  onAddClick: () => void;
  onEditClick: (setting: NotificationSetting) => void;
}

export function NotificationSettingsList({
  settings,
  onAddClick,
  onEditClick,
}: NotificationSettingsListProps) {
  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case "training_reminder":
        return "Rappel d'entraînement";
      case "missing_players":
        return "Joueurs manquants";
      case "custom":
        return "Personnalisé";
      default:
        return type;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-purple-500/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Paramètres de Notification</h2>
        <Button 
          onClick={onAddClick} 
          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          aria-label="Ajouter un nouveau paramètre de notification"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-purple-500/20">
              <TableHead className="text-purple-300">Type</TableHead>
              <TableHead className="text-purple-300">Sport</TableHead>
              <TableHead className="text-purple-300">Délai (heures)</TableHead>
              <TableHead className="text-purple-300">Min. Joueurs</TableHead>
              <TableHead className="text-purple-300">Statut</TableHead>
              <TableHead className="text-purple-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settings.map((setting) => (
              <TableRow 
                key={setting.id}
                className="border-b border-purple-500/10 hover:bg-purple-900/20"
              >
                <TableCell className="text-gray-300">
                  {getNotificationTypeLabel(setting.notification_type)}
                </TableCell>
                <TableCell className="text-gray-300">{setting.sport || "Tous"}</TableCell>
                <TableCell className="text-gray-300">{setting.delay_hours}</TableCell>
                <TableCell className="text-gray-300">
                  {setting.min_players || "-"}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      setting.enabled
                        ? "bg-green-900/20 text-green-400"
                        : "bg-red-900/20 text-red-400"
                    }`}
                  >
                    {setting.enabled ? "Activé" : "Désactivé"}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditClick(setting)}
                    className="text-purple-300 hover:text-white hover:bg-purple-800/50 flex items-center gap-2"
                    aria-label={`Modifier le paramètre ${setting.notification_type}`}
                  >
                    <Edit className="h-4 w-4" />
                    Modifier
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}