import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfileFormFieldsProps {
  profile: {
    first_name: string;
    last_name: string;
    club_role: "joueur" | "entraineur" | "arbitre" | "joueur-entraineur" | "joueur-arbitre" | "entraineur-arbitre" | "les-trois";
    team: "loisir" | "d1_masculine" | "d1_feminine";
    sport: "goalball" | "torball" | "both";
  };
  setProfile: (profile: any) => void;
}

export const ProfileFormFields = ({ profile, setProfile }: ProfileFormFieldsProps) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-300">Prénom</label>
          <Input
            value={profile.first_name}
            onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300">Nom</label>
          <Input
            value={profile.last_name}
            onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-300">Rôle dans le club</label>
          <Select
            value={profile.club_role}
            onValueChange={(value: typeof profile.club_role) => setProfile({ ...profile, club_role: value })}
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Sélectionnez un rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entraineur">Entraineur</SelectItem>
              <SelectItem value="joueur">Joueur</SelectItem>
              <SelectItem value="arbitre">Arbitre</SelectItem>
              <SelectItem value="joueur-entraineur">Joueur-Entraineur</SelectItem>
              <SelectItem value="joueur-arbitre">Joueur-Arbitre</SelectItem>
              <SelectItem value="entraineur-arbitre">Entraineur-Arbitre</SelectItem>
              <SelectItem value="les-trois">Les trois</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300">Équipe</label>
          <Select
            value={profile.team}
            onValueChange={(value: typeof profile.team) => setProfile({ ...profile, team: value })}
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Sélectionnez une équipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="loisir">Loisirs</SelectItem>
              <SelectItem value="d1_masculine">D1 Masculine</SelectItem>
              <SelectItem value="d1_feminine">D1 Féminine</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300">Sport</label>
          <Select
            value={profile.sport}
            onValueChange={(value: typeof profile.sport) => setProfile({ ...profile, sport: value })}
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Sélectionnez un sport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="goalball">Goalball</SelectItem>
              <SelectItem value="torball">Torball</SelectItem>
              <SelectItem value="both">Les deux</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};