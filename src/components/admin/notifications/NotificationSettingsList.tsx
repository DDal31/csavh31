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
  type: string;
  notification_type: "training_reminder" | "low_participation" | "manual";
  delay_hours: number;
  enabled: boolean;
  sport?: string;
  target_group?: "all" | "sport_specific" | "registered_only";
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
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Paramètres de Notification</h2>
        <Button onClick={onAddClick} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Délai (heures)</TableHead>
            <TableHead>Sport</TableHead>
            <TableHead>Groupe Cible</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {settings.map((setting) => (
            <TableRow key={setting.id}>
              <TableCell>{setting.type}</TableCell>
              <TableCell>{setting.delay_hours}</TableCell>
              <TableCell>{setting.sport || "Tous"}</TableCell>
              <TableCell>{setting.target_group || "Tous"}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    setting.enabled
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
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
                  className="flex items-center gap-2"
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
  );
}