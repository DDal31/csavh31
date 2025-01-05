import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface NotificationTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function NotificationTypeSelector({ value, onChange }: NotificationTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="notification_type" className="text-gray-200">
        Catégorie
        <span className="text-red-400 ml-1" aria-hidden="true">*</span>
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger 
          id="notification_type"
          className="bg-gray-800 border-gray-700 text-white"
        >
          <SelectValue placeholder="Sélectionnez une catégorie" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          <SelectItem value="training_reminder" className="text-white">
            Rappel d'entraînement
          </SelectItem>
          <SelectItem value="missing_players" className="text-white">
            Joueurs manquants
          </SelectItem>
          <SelectItem value="custom" className="text-white">
            Personnalisé
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}