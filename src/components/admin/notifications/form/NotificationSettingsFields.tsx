import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotificationSettingsFieldsProps {
  sport: string;
  onSportChange: (value: string) => void;
  delayHours: number;
  onDelayHoursChange: (value: number) => void;
  minPlayers?: number;
  onMinPlayersChange?: (value: number) => void;
  showMinPlayers?: boolean;
  sports?: { id: string; name: string; }[];
}

export function NotificationSettingsFields({
  sport,
  onSportChange,
  delayHours,
  onDelayHoursChange,
  minPlayers,
  onMinPlayersChange,
  showMinPlayers = false,
  sports = [],
}: NotificationSettingsFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sport" className="text-gray-200">
          Sport
          <span className="text-red-400 ml-1" aria-hidden="true">*</span>
        </Label>
        <Select
          value={sport}
          onValueChange={onSportChange}
        >
          <SelectTrigger 
            id="sport"
            className="bg-gray-800 border-gray-700 text-white"
          >
            <SelectValue placeholder="Sélectionnez un sport" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {sports.map((sport) => (
              <SelectItem key={sport.id} value={sport.name} className="text-white">
                {sport.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="delay_hours" className="text-gray-200">
          Délai (heures)
          <span className="text-red-400 ml-1" aria-hidden="true">*</span>
        </Label>
        <Input
          id="delay_hours"
          type="number"
          min="0"
          value={delayHours}
          onChange={(e) => onDelayHoursChange(parseInt(e.target.value))}
          className="bg-gray-800 border-gray-700 text-white"
          required
        />
      </div>

      {showMinPlayers && (
        <div className="space-y-2">
          <Label htmlFor="min_players" className="text-gray-200">
            Nombre minimum de joueurs
            <span className="text-red-400 ml-1" aria-hidden="true">*</span>
          </Label>
          <Input
            id="min_players"
            type="number"
            min="1"
            value={minPlayers}
            onChange={(e) => onMinPlayersChange?.(parseInt(e.target.value))}
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </div>
      )}
    </div>
  );
}