import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

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
  const handleRoleChange = (role: typeof profile.club_role) => {
    setProfile({ ...profile, club_role: role });
  };

  const handleTeamChange = (team: typeof profile.team) => {
    setProfile({ ...profile, team: team });
  };

  const handleSportChange = (sport: typeof profile.sport) => {
    setProfile({ ...profile, sport: sport });
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-300">Prénom</Label>
          <Input
            value={profile.first_name}
            onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-300">Nom</Label>
          <Input
            value={profile.last_name}
            onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-300">Rôle dans le club</Label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: "joueur", label: "Joueur" },
              { id: "entraineur", label: "Entraineur" },
              { id: "arbitre", label: "Arbitre" },
              { id: "joueur-entraineur", label: "Joueur-Entraineur" },
              { id: "joueur-arbitre", label: "Joueur-Arbitre" },
              { id: "entraineur-arbitre", label: "Entraineur-Arbitre" },
              { id: "les-trois", label: "Les trois" }
            ].map((role) => (
              <div key={role.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`role-${role.id}`}
                  checked={profile.club_role === role.id}
                  onCheckedChange={() => handleRoleChange(role.id as typeof profile.club_role)}
                  className="border-gray-600"
                />
                <Label
                  htmlFor={`role-${role.id}`}
                  className="text-sm font-medium text-gray-300"
                >
                  {role.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-300">Équipe</Label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: "loisir", label: "Loisirs" },
              { id: "d1_masculine", label: "D1 Masculine" },
              { id: "d1_feminine", label: "D1 Féminine" }
            ].map((team) => (
              <div key={team.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`team-${team.id}`}
                  checked={profile.team === team.id}
                  onCheckedChange={() => handleTeamChange(team.id as typeof profile.team)}
                  className="border-gray-600"
                />
                <Label
                  htmlFor={`team-${team.id}`}
                  className="text-sm font-medium text-gray-300"
                >
                  {team.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-300">Sport</Label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: "goalball", label: "Goalball" },
              { id: "torball", label: "Torball" },
              { id: "both", label: "Les deux" }
            ].map((sport) => (
              <div key={sport.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`sport-${sport.id}`}
                  checked={profile.sport === sport.id}
                  onCheckedChange={() => handleSportChange(sport.id as typeof profile.sport)}
                  className="border-gray-600"
                />
                <Label
                  htmlFor={`sport-${sport.id}`}
                  className="text-sm font-medium text-gray-300"
                >
                  {sport.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};