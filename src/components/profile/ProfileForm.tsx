import { type Profile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";

interface ProfileFormProps {
  profile: Profile;
  saving: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (field: keyof Profile, value: string) => void;
}

const ProfileForm = ({ profile, saving, onSubmit, onChange }: ProfileFormProps) => {
  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-400">
          Prénom
        </label>
        <Input
          value={profile?.first_name || ""}
          onChange={(e) => onChange("first_name", e.target.value)}
          className="bg-white/10 border-white/20 text-white"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-400">
          Nom
        </label>
        <Input
          value={profile?.last_name || ""}
          onChange={(e) => onChange("last_name", e.target.value)}
          className="bg-white/10 border-white/20 text-white"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-400">
          Email
        </label>
        <Input
          value={profile?.email || ""}
          onChange={(e) => onChange("email", e.target.value)}
          className="bg-white/10 border-white/20 text-white"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-400">
          Téléphone
        </label>
        <Input
          value={profile?.phone || ""}
          onChange={(e) => onChange("phone", e.target.value)}
          className="bg-white/10 border-white/20 text-white"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-400">
          Rôle dans le club
        </label>
        <Select
          value={profile?.club_role}
          onValueChange={(value) => onChange("club_role", value)}
        >
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Sélectionnez votre rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="joueur">Joueur</SelectItem>
            <SelectItem value="entraineur">Entraîneur</SelectItem>
            <SelectItem value="arbitre">Arbitre</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-400">
          Sport
        </label>
        <Select
          value={profile?.sport}
          onValueChange={(value) => onChange("sport", value)}
        >
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Sélectionnez votre sport" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="goalball">Goalball</SelectItem>
            <SelectItem value="torball">Torball</SelectItem>
            <SelectItem value="both">Les deux</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-400">
          Équipe
        </label>
        <Select
          value={profile?.team}
          onValueChange={(value) => onChange("team", value)}
        >
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Sélectionnez votre équipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="loisir">Loisir</SelectItem>
            <SelectItem value="d1_masculine">D1 Masculine</SelectItem>
            <SelectItem value="d1_feminine">D1 Féminine</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        className="bg-primary hover:bg-primary/90 mt-4"
        disabled={saving}
      >
        <Save className="mr-2 h-4 w-4" />
        {saving ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
};

export default ProfileForm;